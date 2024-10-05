from flask import Flask, jsonify, request
import os
import rasterio as rio
from rasterio.session import AWSSession
from rasterio.features import bounds
import rioxarray
import matplotlib.pyplot as plt
import boto3
import json
from pystac_client import Client
import hvplot.xarray
from pyproj import Transformer
from flask_cors import CORS 

app = Flask(__name__)
CORS(app)

stac_url = 'https://landsatlook.usgs.gov/stac-server'
ls_cat = Client.open(stac_url)
print(ls_cat)

# Initialize the S3 client
s3_client = boto3.client('s3', region_name='us-west-2')

# Define the bucket name and prefix (directory) you want to list
bucket_name = 'usgs-landsat'
prefix = 'collection02/'  # To list contents in the 'collection02/' directory

def BuildSquare(lon, lat, delta):
    c1 = [lon + delta, lat + delta]
    c2 = [lon + delta, lat - delta]
    c3 = [lon - delta, lat - delta]
    c4 = [lon - delta, lat + delta]
    geometry = {"type": "Polygon", "coordinates": [[ c1, c2, c3, c4, c1 ]]}
    return geometry

@app.route('/list-objects', methods=['GET'])
def list_objects():
    # List objects in the bucket using 'Requester Pays'
    response = s3_client.list_objects_v2(
        Bucket=bucket_name,
        Prefix=prefix,
        RequestPayer='requester'
    )

    # Check if 'Contents' is in the response (i.e., if objects are found)
    if 'Contents' in response:
        # Collect the keys (file paths) in a list
        object_keys = [obj['Key'] for obj in response['Contents']]
        return jsonify(object_keys)
    else:
        return jsonify({"message": "No objects found in the specified prefix."})

@app.route('/search-scenes', methods=['POST'])
def search_scenes():
    # Initialize the STAC client
    LandsatSTAC = Client.open("https://landsatlook.usgs.gov/stac-server", headers=[])

    # Function to build the square
    def BuildSquare(lon, lat, delta):
        c1 = [lon + delta, lat + delta]
        c2 = [lon + delta, lat - delta]
        c3 = [lon - delta, lat - delta]
        c4 = [lon - delta, lat + delta]
        geometry = {"type": "Polygon", "coordinates": [[c1, c2, c3, c4, c1]]}
        return geometry

    # Extract parameters from the POST request
    data = request.get_json()
    lon = data.get('lon')
    lat = data.get('lat')
    delta = data.get('delta')
    dateRange = data.get('dateRange')

    if not all([lon, lat, delta, dateRange]):
        return jsonify({"error": "Missing parameters: lon, lat, delta, or dateRange"}), 400

    # Build geometry using the provided parameters
    geometry = BuildSquare(lat, lon, delta)
    bbox = bounds(geometry) 

    # Perform the STAC search
    LandsatSearch = LandsatSTAC.search(
        bbox=bbox,
        datetime=dateRange,
        query = ['eo:cloud_cover95'],
        collections=["landsat-c2l2-sr"]
    )

    Landsat_items = [i.to_dict() for i in LandsatSearch.items()]

    # Function to get content of an S3 URL
    def get_metadata_content(s3_url):
        bucket_name = s3_url.split('/')[2]
        key = '/'.join(s3_url.split('/')[3:])
        
        s3_client = boto3.client('s3', region_name='us-west-2')
        
        metadata_object = s3_client.get_object(Bucket=bucket_name, Key=key, RequestPayer='requester')
        metadata_content = metadata_object['Body'].read().decode('utf-8')
        
        return metadata_content

    # Example usage with the metadata S3 URL
    metadata_list = []
    for item in Landsat_items:
        try:
            metadata_s3_url = item["assets"]["MTL.json"]["alternate"]["s3"]["href"]
            metadata_content = get_metadata_content(metadata_s3_url)
            
            # Parse the metadata content to a JSON object
            metadata_json = json.loads(metadata_content)
            metadata_list.append(metadata_json)
        except Exception as e:
            print(f"Error fetching metadata: {e}")
    
    # Return the metadata as a JSON response
    return jsonify(metadata_list)
    
if __name__ == "__main__":
    app.run(debug=True)


