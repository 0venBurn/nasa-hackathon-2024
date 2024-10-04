import requests
from flask import Flask

app = Flask(__name__)


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