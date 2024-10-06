from flask import Flask, jsonify, request
import logging
import certifi
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
from datetime import date, timedelta, datetime

app = Flask(__name__)
CORS(app)

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Set up environment for Windows with proper CA bundle
os.environ['CURL_CA_BUNDLE'] = certifi.where()

stac_url = 'https://landsatlook.usgs.gov/stac-server'
LandsatSTAC = Client.open(stac_url)

# Initialize the S3 client
s3_client = boto3.client('s3', region_name='us-west-2')
logging.info("Creating AWS Session")


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
    lon = float(request.args.get('lon'))
    lat = float(request.args.get('lat'))
    delta = float(request.args.get('delta'))

    if not all([lon, lat, delta]):
        return jsonify({"error": "Missing parameters: lon, lat, or delta"}), 400

    # Build geometry using the provided parameters
    geometry = BuildSquare(lat, lon, delta)
    bbox = bounds(geometry)

    # Calculate the date range: from two weeks ago to today
    today = date.today()
    two_weeks_ago = today - timedelta(weeks=2)
    date_range = f"{two_weeks_ago.strftime('%Y-%m-%d')}/{today.strftime('%Y-%m-%d')}"

    # Perform the STAC search without filters to check availability
    LandsatSearch = LandsatSTAC.search(
        bbox=bbox,
        collections=["landsat-c2l2-sr"],
        datetime=date_range
    )

    # Convert search results to a list of dictionaries
    Landsat_items = [i.to_dict() for i in LandsatSearch.items()]

    # Debug: Print the search results to check what's returned
    print(f"Found {len(Landsat_items)} items in the search results.")

    # Loop through the items to find the latest Landsat 8 and 9 scenes
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
    
    # Initialize variables to store the most recent scenes' datetime
    latest_landsat8_date = None
    latest_landsat9_date = None
    latest_landsat8_time = None
    latest_landsat9_time = None

    for item in metadata_list:
        spacecraft_id = item["LANDSAT_METADATA_FILE"]["IMAGE_ATTRIBUTES"]["SPACECRAFT_ID"]
        date_acquired = item["LANDSAT_METADATA_FILE"]["IMAGE_ATTRIBUTES"]["DATE_ACQUIRED"]
        scene_center_time = item["LANDSAT_METADATA_FILE"]["IMAGE_ATTRIBUTES"]["SCENE_CENTER_TIME"]

        print(f"Spacecraft ID: {spacecraft_id}")
        print(f"Date Acquired: {date_acquired}")
        print(f"Scene Center Time: {scene_center_time}")

        # Parse date_acquired as a datetime object for comparison
        date_acquired_datetime = datetime.strptime(date_acquired, "%Y-%m-%d")

        if spacecraft_id == 'LANDSAT_8':
            # Update if latest_landsat8_date is None or a newer date is found
            if latest_landsat8_date is None or date_acquired_datetime > latest_landsat8_date:
                print(latest_landsat8_date, date_acquired_datetime)
                latest_landsat8_date = date_acquired_datetime
            if latest_landsat8_time is None:
                latest_landsat8_time = scene_center_time
        if spacecraft_id == 'LANDSAT_9':
            # Update if latest_landsat9_date is None or a newer date is found
            if latest_landsat9_date is None or date_acquired_datetime > latest_landsat9_date:
                latest_landsat9_date = date_acquired_datetime
            if latest_landsat9_time is None:
                latest_landsat9_time = scene_center_time

    # Add 2 weeks to the latest dates
    if latest_landsat8_date:
        latest_landsat8_date += timedelta(weeks=2)
    if latest_landsat9_date:
        latest_landsat9_date += timedelta(weeks=2)
        
    # Convert the latest dates back to string format for output
    latest_landsat8_date_str = latest_landsat8_date.strftime("%Y-%m-%d") if latest_landsat8_date else None
    latest_landsat9_date_str = latest_landsat9_date.strftime("%Y-%m-%d") if latest_landsat9_date else None

    if latest_landsat8_time:
        latest_landsat8_date_str += f"-{latest_landsat8_time[:8]}"
    if latest_landsat9_time:
        latest_landsat9_date_str += f"-{latest_landsat9_time[:8]}"
    print(f"Latest Landsat 8 Date Acquired: {latest_landsat8_date_str}")
    print(f"Latest Landsat 9 Date Acquired: {latest_landsat9_date_str}")

    # Prepare the response with the next passover times
    response = {
        "landsat8NextPassover": latest_landsat8_date_str,
        "landsat9NextPassover": latest_landsat9_date_str
    }

    # Return the response as a JSON
    return jsonify(response)

if __name__ == "__main__":
    app.run(debug=True, port=5001)
