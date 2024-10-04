from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/', methods=['POST'])
def requestEmail():
    data = request.get_json()
    
    if 'email' not in data or 'time' not in data:
        return jsonify({'error': 'Email and time fields are required'}), 400
    
    email = data['email']
    time = data['time']

    # Add mailgun here

    return jsonify({
        'message': 'Data received successfully',
        'email': email,
        'time': time
    }), 200
    


if __name__ == "__main__":
    app.run(debug=True)
