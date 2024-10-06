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

def download_from_s3(url, local_path):
    if url.startswith('s3://'):
        bucket = url.split('/')[2]
        key = '/'.join(url.split('/')[3:])
        s3_client.download_file(bucket, key, local_path, ExtraArgs={"RequestPayer": "requester"})
    else:   
        response = requests.get(url)
        response.raise_for_status()
        with open(local_path, 'wb') as f:
            f.write(response.content)
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
    
def plot_3x3_grid_and_sr(band_data, center_lat, center_lon, filename, metadata):
    fig = plt.figure(figsize=(6, 15))  # Tall and narrow to mimic the style in the example
    gs = GridSpec(6, 1, figure=fig, height_ratios=[2, 1, 1.2, 0.4, 1, 2])

    # Create custom colormap (dark green to white)
    colors = ['darkgreen', 'lightgreen', 'white']
    n_bins = 100
    cmap = LinearSegmentedColormap.from_list('custom_green', colors, N=n_bins)

    # 3x3 grid based on average of bands
    ax_grid = fig.add_subplot(gs[0])
    
    # Initialize an empty list to hold the band grids
    band_grids = []
    
    # Collect all grids that exist for each band
    for band in ['coastal', 'blue', 'green', 'red', 'nir08', 'swir16', 'swir22']:
        if band in band_data:
            data = band_data[band]
            center_y, center_x = data.shape[0] // 2, data.shape[1] // 2
            grid = data[center_y-1:center_y+2, center_x-1:center_x+2]
            band_grids.append(grid)
    
    if band_grids:
        # Compute the average of all band grids
        avg_grid = np.mean(band_grids, axis=0)
        
        # Apply scaling and normalization to the average grid
        min_val, max_val = np.percentile(avg_grid, (2, 98))
        avg_grid = np.clip(avg_grid, min_val, max_val)
        avg_grid = (avg_grid - min_val) / (max_val - min_val)

        # Display the average grid with the custom colormap
        im = ax_grid.imshow(avg_grid, cmap=cmap, interpolation='nearest')
        ax_grid.set_title("3x3 Pixel Grid (Average of Bands)", fontsize=10)
        ax_grid.axis('off')

        # Add colorbar
        plt.colorbar(im, ax=ax_grid, orientation='vertical', label='Normalized Reflectance')

        # Highlight the center pixel (the target pixel)
        rect = plt.Rectangle((0.5, 0.5), 1, 1, fill=False, edgecolor='cyan', linewidth=2)
        ax_grid.add_patch(rect)
    else:
        ax_grid.text(0.5, 0.5, 'No valid data available for averaging', ha='center', va='center', fontsize=10)

    # Metadata below the grid
    ax_meta = fig.add_subplot(gs[1])
    ax_meta.axis('off')
    metadata_text = "\n".join([f"{k}: {v}" for k, v in metadata.items()])
    ax_meta.text(0, 1, metadata_text, verticalalignment='top', fontsize=8)

    # Surface Reflectance Table
    ax_table = fig.add_subplot(gs[2])
    ax_table.axis('off')
    bands = ['coastal', 'blue', 'green', 'red', 'nir08', 'swir16', 'swir22', 'lwir11', 'lwir12']
    
    sr_values = []
    temp_celsius = None
    thermal_avg_kelvin = None
    for band in bands:
        if band in band_data:
            data = band_data[band]
            center_y, center_x = data.shape[0] // 2, data.shape[1] // 2
            if 'lwir' in band:
                temp_kelvin = data[center_y, center_x]
                if thermal_avg_kelvin is None:
                    thermal_avg_kelvin = temp_kelvin
                else:
                    thermal_avg_kelvin = (thermal_avg_kelvin + temp_kelvin) / 2  # Averaging thermal bands
            else:
                sr_values.append(f"{data[center_y, center_x]:.4f}")
        else:
            sr_values.append('N/A')

    if thermal_avg_kelvin is not None:
        temp_celsius = thermal_avg_kelvin - 273.15
        sr_values.append(f"{thermal_avg_kelvin:.2f} (K)")
    else:
        sr_values.append('N/A')

    table_data = [['Band Number', 'Surface Reflectance']] + list(zip(bands[:-2] + ['Thermal Band'], sr_values))

    # Always add temperature row, even if it's N/A
    table_data.append(['Temperature', f'{temp_celsius:.2f}°C' if temp_celsius is not None else 'N/A'])
    
    table = ax_table.table(cellText=table_data, loc='center', cellLoc='center')
    table.auto_set_font_size(False)
    table.set_fontsize(8)
    table.scale(1, 1.2)

    # Surface Reflectance Graph (without Thermal Band as a separate plot)
    ax_sr = fig.add_subplot(gs[5])
    wavelengths = [0.44, 0.48, 0.56, 0.65, 0.86, 1.61, 2.20]  # Only reflective bands
    
    # Filter out N/A values
    valid_data = [(w, float(v.split()[0]) if ' ' in v else float(v)) 
                  for w, v in zip(wavelengths, sr_values[:-1]) if v != 'N/A']
    
    if valid_data:
        valid_wavelengths, valid_values = zip(*valid_data)

        # Plot only reflective bands
        ax_sr.plot(valid_wavelengths, valid_values, marker='o', color='darkgreen', label='Reflective Bands', linewidth=2, markersize=4)

        ax_sr.set_xlabel('Wavelength (µm)', fontsize=10)
        ax_sr.set_ylabel('Surface Reflectance', fontsize=10)
        ax_sr.set_title('Spectral Signature', fontsize=12)
        ax_sr.set_xlim(min(valid_wavelengths), max(valid_wavelengths))
        ax_sr.legend(fontsize=8)
        ax_sr.grid(True, which="both", ls="-", alpha=0.2)
        
        # Only show x-ticks for bands with data
        ax_sr.set_xticks(valid_wavelengths)
        ax_sr.set_xticklabels([band for band, w in zip(bands[:-2], wavelengths) if w in valid_wavelengths], rotation=45, ha='right', fontsize=8)
        
        # Adjust y-axis without multiplication
        ax_sr.set_ylim(min(valid_values), max(valid_values))

        # Format y-axis labels
        ax_sr.yaxis.set_major_formatter(plt.FuncFormatter(lambda x, p: format(int(x), ',')))
        
        ax_sr.tick_params(axis='both', which='major', labelsize=8)
    else:
        ax_sr.text(0.5, 0.5, 'No valid data available for plotting', ha='center', va='center', fontsize=10)

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
timeRange = '2024-06-01/2024-06-30'

def perform_search(bbox):
    return LandsatSTAC.search(
        bbox=bbox,
        datetime=timeRange,
        query=['eo:cloud_cover<95'],
        collections=["landsat-c2l1"]
    )

# Iterate over each bounding box and perform the search
for bbox in bounding_boxes:
    LandsatSearch = retry_stac_request(lambda: perform_search(bbox))

    try:
        Landsat_items = list(LandsatSearch.get_items())
        logging.info(f"{len(Landsat_items)} Landsat scenes fetched for region {bbox}")
    except Exception as e:
        logging.error(f"Error fetching Landsat items for region {bbox}: {str(e)}")
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
        bands = ['coastal', 'blue', 'green', 'red', 'nir08', 'swir16', 'swir22', 'lwir11', 'lwir12']
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
