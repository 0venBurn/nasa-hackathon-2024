
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from datetime import date, timedelta
import pytz


app = Flask(__name__)

@app.route('/', methods=['POST'])
def requestEmail():
    data = request.get_json()
    
    if 'email' not in data or 'days' not in data or 'location' not in data:
        return jsonify({'error': 'Argument is missing'}), 400
    
    email = data['email']
    daysWarning = data['days']
    location = data['location']
    
    #retruns a datetime with TZ data
    satArriveDT = request("landsat.co/data/satArrive", params={'location': location})
    
    firstEmail = satArriveDT - timedelta(days=daysWarning)
    secondEmail = satArriveDT + timedelta(hours=6)
    
    firstUtc = firstEmail.astimezone(pytz.utc)
    secondUtc = secondEmail.astimezone(pytz.utc)
    
    # Add mailgun here

    return jsonify({
        'message': 'Data received successfully'
    }), 200


if __name__ == "__main__":
    app.run(debug=True)
    # app.run(host='0.0.0.0', port=5000, debug=False)
    # CORS(app, origins=["https://landsatcheck.co"])
