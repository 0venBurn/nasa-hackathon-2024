from flask import Flask, jsonify
import rasterio as rio
from rasterio.session import AWSSession
import rioxarray
import boto3
import json
from pystac_client import Client
import hvplot.xarray

app = Flask(__name__)

stac_url = 'https://landsatlook.usgs.gov/stac-server'
ls_cat = Client.open(stac_url)
print(ls_cat)

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

if __name__ == "__main__":
    app.run(debug=True)
