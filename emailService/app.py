
from flask import Flask, request, jsonify
import requests
from datetime import date, timedelta
from timezonefinder import TimezoneFinder

app = Flask(__name__)

@app.route('/', methods=['POST'])
def requestEmail():
    data = request.get_json()
    
    if 'email' not in data or 'time' not in data or 'location' not in data:
        return jsonify({'error': 'Argument is missing'}), 400
    
    email = data['email']
    time = data['time']
    location = data['location']
    
    satArrive = request("landsat.co/data/satArrive", params={'location': location})
    
    timezone = TimezoneFinder().timezone_at(lat=location[0], lng=location[1])
    
    firstEmail = satArrive - timedelta(days=time)
    firstEmailDay = firstEmail.date()
    secondEmail = satArrive + timedelta(hours=6)
    
    # Add mailgun here

    return jsonify({
        'message': 'Data received successfully',
        'email': email,
        'time': time
    }), 200


if __name__ == "__main__":
    app.run(debug=True)
