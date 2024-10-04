
from flask import Flask, request, jsonify
import requests

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
    


def send_simple_message():
    return requests.post(
        "https://api.mailgun.net/v3/sandboxb0307974dbfe4b41a863b287f45d506e.mailgun.org/messages",
        auth=("api", "YOUR_API_KEY"),
        data={
            "from": "Excited User <mailgun@sandboxb0307974dbfe4b41a863b287f45d506e.mailgun.org>",
            "to": [
                "bar@example.com",
                "YOU@sandboxb0307974dbfe4b41a863b287f45d506e.mailgun.org",
            ],
            "subject": "Hello",
            "text": "Testing some Mailgun awesomeness!",
        },
    )


if __name__ == "__main__":
    app.run(debug=True)
