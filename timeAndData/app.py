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
LandsatSTAC = Client.open(stac_url)

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

# Function to get content of an S3 URL (unchanged)
def get_metadata_content(s3_url):
    bucket_name = s3_url.split('/')[2]
    key = '/'.join(s3_url.split('/')[3:])
    
    s3_client = boto3.client('s3', region_name='us-west-2')
    
    metadata_object = s3_client.get_object(Bucket=bucket_name, Key=key, RequestPayer='requester')
    metadata_content = metadata_object['Body'].read().decode('utf-8')
    
    return metadata_content

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
    
@app.route('/next-overhead-time', methods=['POST'])
def next_overhead_time():
    # Extract parameters from the POST request
    data = request.get_json()
    lon = data.get('lon')
    lat = data.get('lat')
    delta = data.get('delta')

    if not all([lon, lat, delta]):
        return jsonify({"error": "Missing parameters: lon, lat, or delta"}), 400

    # Build geometry using the provided parameters
    geometry = BuildSquare(lat, lon, delta)
    bbox = bounds(geometry)

    # Perform the STAC search with a recent date range and limit
    LandsatSearch = LandsatSTAC.search(
        bbox=bbox,
        datetime="2023-09-01/2024-10-01",  # Use a dynamic recent date range as needed
        query=['eo:cloud_cover95'],  
        collections=["landsat-c2l2-sr"],
        limit=20  # Limit the number of results to process
    )

    # Convert search results to a list of dictionaries
    Landsat_items = [i.to_dict() for i in LandsatSearch.items()]

    # Initialize variables to store the most recent scenes' datetime
    latest_landsat8_datetime = None
    latest_landsat9_datetime = None

    # Loop through the items to find the latest Landsat 8 and 9 scenes
    for item in Landsat_items:
        spacecraft_id = item['properties'].get('landsat:spacecraft_id')
        scene_datetime = item['properties'].get('datetime')

        if spacecraft_id == 'LANDSAT_8' and latest_landsat8_datetime is None:
            latest_landsat8_datetime = scene_datetime
        elif spacecraft_id == 'LANDSAT_9' and latest_landsat9_datetime is None:
            latest_landsat9_datetime = scene_datetime

        # Break early if both latest scenes are found
        if latest_landsat8_datetime and latest_landsat9_datetime:
            break

    # Prepare the response with the next passover times
    response = {
        "landsat8NextPassover": latest_landsat8_datetime,
        "landsat9NextPassover": latest_landsat9_datetime
    }

    # Return the response as a JSON
    return jsonify(response)

if __name__ == "__main__":
    app.run(debug=True)
    # app.run(host='0.0.0.0', port=5000, debug=False)
    # CORS(app, origins=["https://landsatcheck.co"])
