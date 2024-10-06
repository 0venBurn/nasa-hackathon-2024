import os
import boto3
import rasterio as rio
from pyproj import Transformer
import certifi
import numpy as np
from rasterio.windows import Window
import matplotlib
matplotlib.use('Agg')  # Use the 'Agg' backend which doesn't require a GUI
import matplotlib.pyplot as plt
from matplotlib.gridspec import GridSpec
from matplotlib.colors import LinearSegmentedColormap
from rasterio.errors import RasterioIOError
from pystac_client import Client
from pystac_client.exceptions import APIError
import time
import logging
from datetime import datetime, timezone

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Set up environment for Windows with proper CA bundle
os.environ['CURL_CA_BUNDLE'] = certifi.where()

# AWS S3 session creation
s3_client = boto3.client('s3')
logging.info("Creating AWS Session")

output_dir = 'landsat'
if not os.path.exists(output_dir):
    os.makedirs(output_dir)
    logging.info(f"Created directory: {output_dir}")

# Define the bounding box for Central US (min_lon, min_lat, max_lon, max_lat)
bbox = [-97.0, 38.5, -96.5, 39.0]  # Example: Central US

# User-defined center location
center_lon, center_lat = sum(bbox[0::2]) / 2, sum(bbox[1::2]) / 2

# Function to download files from S3
def download_from_s3(s3_url, local_path):
    """Download a file from S3 to a local path."""
    bucket = s3_url.split('/')[2]
    key = '/'.join(s3_url.split('/')[3:])
    
    # Include RequestPayer parameter to handle requester-pays buckets
    s3_client.download_file(bucket, key, local_path, ExtraArgs={"RequestPayer": "requester"})
    return local_path

# Function to subset the GeoTIFF file
def getSubset(geotiff_file, bbox):
    try:
        with rio.open(geotiff_file) as src:
            # Transform the bbox to the image's coordinate system
            transformer = Transformer.from_crs("EPSG:4326", src.crs, always_xy=True)
            minx, miny = transformer.transform(bbox[0], bbox[1])
            maxx, maxy = transformer.transform(bbox[2], bbox[3])

            # Get pixel coordinates
            window = src.window(minx, miny, maxx, maxy)
            
            # Read the subset of the data
            subset = src.read(1, window=window)
        return subset
    except RasterioIOError as e:
        logging.error(f"Error reading file {geotiff_file}: {str(e)}")
        return None

# Function to plot 3x3 grid and surface reflectance
def plot_3x3_grid_and_sr(band_data, center_lat, center_lon, filename, metadata):
    fig = plt.figure(figsize=(10, 12))
    gs = GridSpec(4, 2, figure=fig, height_ratios=[2, 1, 1, 1])

    # Create custom colormap (dark green to white)
    colors = ['darkgreen', 'lightgreen', 'white']
    n_bins = 100
    cmap = LinearSegmentedColormap.from_list('custom_green', colors, N=n_bins)

    # 3x3 grid
    ax_grid = fig.add_subplot(gs[0, 0])
    grid = np.zeros((3, 3))  # Single band grid
    
    # Use the red band for visualization
    if 'red' in band_data:
        data = band_data['red']
        center_y, center_x = data.shape[0] // 2, data.shape[1] // 2
        grid = data[center_y-1:center_y+2, center_x-1:center_x+2]
        
        # Apply scaling and normalization
        min_val, max_val = np.percentile(grid, (2, 98))
        grid = np.clip(grid, min_val, max_val)
        grid = (grid - min_val) / (max_val - min_val)

    # Display the grid with the custom colormap
    im = ax_grid.imshow(grid, cmap=cmap, interpolation='nearest')
    ax_grid.set_title("3x3 Pixel Grid")
    ax_grid.axis('off')
    
    # Add colorbar
    plt.colorbar(im, ax=ax_grid, orientation='vertical', label='Normalized Reflectance')
    
    # Highlight the center pixel (the target pixel)
    rect = plt.Rectangle((0.5, 0.5), 1, 1, fill=False, edgecolor='cyan', linewidth=2)
    ax_grid.add_patch(rect)

    # Metadata
    ax_meta = fig.add_subplot(gs[1, :])
    ax_meta.axis('off')

    metadata_text = (
        f"Satellite: {metadata['satellite']}\n"
        f"Date Acquired: {metadata['date']}\n"
        f"Scene Center Time: {metadata['overpass_time']}\n"
        f"WRS Path/Row: {metadata['wrs_path_row']}\n"
        f"Cloud Cover: {metadata['cloud_cover']}%\n"
        f"Image Quality: {metadata['image_quality']}"
    )
    ax_meta.text(0, 1, metadata_text, verticalalignment='top', fontsize=10)

    # Surface Reflectance Table
    ax_table = fig.add_subplot(gs[2, 0])
    ax_table.axis('off')
    bands = ['coastal', 'blue', 'green', 'red', 'nir', 'swir1', 'swir2']  # Add SWIR1 and SWIR2
    
    # Calculate SR values and temperature for the center pixel
    sr_values = []
    temp_kelvin = temp_celsius = None
    for band in bands:
        if band in band_data:
            data = band_data[band]
            center_y, center_x = data.shape[0] // 2, data.shape[1] // 2
            sr_values.append(data[center_y, center_x])
        else:
            sr_values.append(np.nan)
    
    # Handle LWIR for temperature calculation
    if 'lwir' in band_data:
        lwir_data = band_data['lwir']
        temp_kelvin = lwir_data[center_y, center_x]
        temp_celsius = temp_kelvin - 273.15

    table_data = [['Band Number', 'Surface Reflectance']] + list(zip(bands, sr_values))
    table = ax_table.table(cellText=table_data, loc='center', cellLoc='center')
    table.auto_set_font_size(False)
    table.set_fontsize(10)
    table.scale(1, 1.5)

    # Surface Temperature
    if temp_kelvin is not None:
        ax_temp = fig.add_subplot(gs[3, 0])
        ax_temp.axis('off')
        temp_text = f"Surface Temp (Kelvin): {temp_kelvin:.2f} K\nSurface Temp (Celsius): {temp_celsius:.2f} °C"
        ax_temp.text(0, 0.5, temp_text, fontsize=10, verticalalignment='center')

    # Surface Reflectance Graph (Spectral Signature)
    ax_sr = fig.add_subplot(gs[2:, 1])
    # Approximate central wavelengths for Landsat bands (in micrometers)
    wavelengths = [0.44, 0.48, 0.56, 0.65, 0.86, 1.61, 2.20]  # Add wavelengths for SWIR1 and SWIR2
    
    # Plot reflective bands
    ax_sr.plot(wavelengths, sr_values, marker='o', color='darkgreen', label='Reflective Bands')
    
    ax_sr.set_xlabel('Wavelength (µm)')
    ax_sr.set_ylabel('Surface Reflectance')
    ax_sr.set_title('Spectral Signature')
    ax_sr.set_xlim(0.4, 2.3)  # Extend x-axis to include SWIR bands
    
    # Add band names to x-axis
    band_names = ['Coastal', 'Blue', 'Green', 'Red', 'NIR', 'SWIR1', 'SWIR2']
    ax_sr.set_xticks(wavelengths)
    ax_sr.set_xticklabels(band_names, rotation=45, ha='right')

    plt.tight_layout()
    plt.savefig(filename, bbox_inches='tight', dpi=300)
    plt.close()

# Function to retry STAC API requests
def retry_stac_request(func, max_retries=3, delay=5):
    for attempt in range(max_retries):
        try:
            return func()
        except APIError as e:
            if attempt < max_retries - 1:
                logging.warning(f"STAC API error: {str(e)}. Retrying in {delay} seconds...")
                time.sleep(delay)
            else:
                logging.error(f"Max retries reached. STAC API error: {str(e)}")
                raise

# Connect to STAC server
LandsatSTAC = Client.open("https://landsatlook.usgs.gov/stac-server", headers=[])

def perform_search():
    return LandsatSTAC.search(
        bbox=bbox,
        query=['eo:cloud_cover<95'],
        collections=["landsat-c2l1"],
        datetime='2024-06-02/2024-06-23',
        sortby=[{'field': 'properties.datetime', 'direction': 'desc'}],  # Sort by most recent
        limit=1  # Fetch only the most recent scene
    )

LandsatSearch = retry_stac_request(perform_search)

try:
    Landsat_items = list(LandsatSearch.items())
    logging.info(f"{len(Landsat_items)} Landsat scenes fetched")
except Exception as e:
    logging.error(f"Error fetching Landsat items: {str(e)}")
    Landsat_items = []

# Main processing loop
for i, item in enumerate(Landsat_items):
    try:
        # Fetch metadata
        scene_center_time = datetime.fromisoformat(item.properties['datetime']).replace(tzinfo=timezone.utc)
        overpass_time = scene_center_time.strftime("%H:%M:%S UTC")
        metadata = {
            'satellite': item.properties['platform'],
            'date': scene_center_time.strftime("%Y-%m-%d"),
            'overpass_time': overpass_time,
            'lat_lon': f"{center_lat:.2f}, {center_lon:.2f}",
            'wrs_path_row': f"{item.properties['landsat:wrs_path']}/{item.properties['landsat:wrs_row']}",
            'cloud_cover': item.properties['eo:cloud_cover'],
            'image_quality': item.properties.get('landsat:quality_assessment', 'N/A')
        }
        
        logging.info(f"Processing Landsat item {i + 1}/{len(Landsat_items)} - {metadata['date']} {metadata['overpass_time']}")
        
        # Download all available bands
        bands = ['coastal', 'blue', 'green', 'red', 'nir', 'swir1', 'swir2', 'lwir']  # Include SWIR1 and SWIR2
        local_files = {}
        band_data = {}
        
        for band in bands:
            try:
                if band in item.assets:
                    s3_url = item.assets[band].extra_fields['alternate']['s3']['href']
                    local_file = os.path.join(output_dir, f"landsat_{band}_{i}.tif")
                    download_from_s3(s3_url, local_file)
                    local_files[band] = local_file
                    
                    # Get the data subset
                    band_data[band] = getSubset(local_file, bbox)
                else:
                    logging.warning(f"Band {band} not available for this scene.")
            except Exception as e:
                logging.warning(f"Error processing band {band}: {str(e)}")
        
        # Generate visualization
        try:
            plot_3x3_grid_and_sr(band_data, center_lat, center_lon,
                                 os.path.join(output_dir, f"{metadata['date']}_landsat_visualization.png"),
                                 metadata)
        except Exception as e:
            logging.warning(f"Error generating visualization: {str(e)}")
        
        # Clean up temporary files
        for file in local_files.values():
            if os.path.exists(file):
                os.remove(file)
        
    except Exception as e:
        logging.error(f"Error processing item {i + 1}: {str(e)}")

logging.info("Processing complete")