from flask import Flask, jsonify, request
import logging
from rasterio.features import bounds
import boto3
from pystac_client import Client

app = Flask(__name__)

# Set up logging
logging.basicConfig(filename='search_scenes.log', level=logging.DEBUG)

stac_url = 'https://landsatlook.usgs.gov/stac-server'

# Initialize the S3 client
s3_client = boto3.client('s3', region_name='us-west-2')

# Define the bucket name and prefix (directory) you want to list
bucket_name = 'usgs-landsat'
prefix = 'collection02/'  # To list contents in the 'collection02/' directory

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
    debug_info = {}  # Dictionary to store debug info

    try:
        # Initialize the STAC client
        LandsatSTAC = Client.open(stac_url, headers=[])

        # Function to build the square
        def BuildSquare(lon, lat, delta):
            logging.debug(f"BuildSquare input - lon: {lon} ({type(lon)}), lat: {lat} ({type(lat)}), delta: {delta} ({type(delta)})")
            c1 = [lon + delta, lat + delta]
            c2 = [lon + delta, lat - delta]
            c3 = [lon - delta, lat - delta]
            c4 = [lon - delta, lat + delta]
            logging.debug(f"Corners: c1={c1}, c2={c2}, c3={c3}, c4={c4}")
            geometry = {"type": "Polygon", "coordinates": [[c1, c2, c3, c4, c1]]}
            logging.debug(f"Generated geometry: {geometry}")
            return geometry

        # Extract parameters from the POST request
        data = request.get_json()
        lon = data.get('lon')
        lat = data.get('lat')
        delta = data.get('delta')
        dateRange = data.get('dateRange')

        debug_info['input_params'] = {'lon': lon, 'lat': lat, 'delta': delta, 'dateRange': dateRange}
        logging.debug(f"Input parameters: {debug_info['input_params']}")

        if not all([lon, lat, delta, dateRange]):
            return jsonify({"error": "Missing parameters: lon, lat, delta, or dateRange", "debug_info": debug_info}), 400

        # Ensure lon, lat, and delta are floats
        try:
            lon = float(lon)
            lat = float(lat)
            delta = float(delta)
        except ValueError as e:
            error_msg = f"Error converting geometry parameters to float: {str(e)}"
            logging.error(error_msg)
            return jsonify({"error": error_msg, "debug_info": debug_info}), 400

        # Build geometry using the provided parameters
        geometry = BuildSquare(lon, lat, delta)
        debug_info['geometry'] = geometry
        
        try:
            bbox = bounds(geometry)
            debug_info['bbox'] = bbox
            logging.debug(f"Bounding box: {bbox}")
        except Exception as e:
            error_msg = f"Error calculating bounds: {str(e)}"
            logging.error(error_msg)
            return jsonify({"error": error_msg, "debug_info": debug_info}), 400

        # Perform the STAC search
        try:
            LandsatSearch = LandsatSTAC.search(
                bbox=bbox,
                datetime=dateRange,
                query=['eo:cloud_cover95'],
                collections=["landsat-c2l2-sr"]
            )
            Landsat_items = [i.to_dict() for i in LandsatSearch.items()]
            debug_info['landsat_items_count'] = len(Landsat_items)
            logging.debug(f"Number of Landsat items: {len(Landsat_items)}")
        except Exception as e:
            error_msg = f"Error during STAC search: {str(e)}"
            logging.error(error_msg)
            return jsonify({"error": error_msg, "debug_info": debug_info}), 500

        # Return the results
        return jsonify({"items": Landsat_items, "debug_info": debug_info})

    except Exception as e:
        error_msg = f"Unexpected error: {str(e)}"
        logging.error(error_msg)
        return jsonify({"error": error_msg, "debug_info": debug_info}), 500

if __name__ == '__main__':
    app.run(debug=True)