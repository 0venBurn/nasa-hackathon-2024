import os
from datetime import date, datetime, timedelta

import pytz
import requests
from dateutil import parser
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS

load_dotenv()

app = Flask(__name__)
CORS(app, origins=["https://landsatcheck.co"])  # Enable CORS for the specified origin


def send_email(
    email,
    sender_email,
    web_domain,
    api_key,
    send_date,
    email_subject,
    email_body_text,
    email_body_html,
):
    key = api_key
    domain = web_domain
    sender = sender_email
    receiver = email
    # Format the delivery time in RFC2822 format if send_date is in the future
    if send_date:
        time = send_date.strftime("%a, %d %b %Y %H:%M:%S %z")
    else:
        time = None  # For immediate delivery, we won't set o:deliverytime
    subject = email_subject
    body_text = email_body_text
    body_html = email_body_html

    # Adjust the Mailgun API URL if you're in a different region
    url = f"https://api.eu.mailgun.net/v3/{domain}/messages"
    auth = ("api", key)
    data = {
        "from": sender,
        "to": receiver,
        "subject": subject,
        "text": body_text,
        "html": body_html,
    }
    if time:
        data["o:deliverytime"] = time

    try:
        response = requests.post(url, auth=auth, data=data)
        print(f"Status Code: {response.status_code}")
        print(f"Response Text: {response.text}")

        if response.status_code == 200:
            print("Email scheduled successfully!")
        else:
            print(f"Error scheduling email: {response.text}")
    except Exception as e:
        print(f"An error occurred: {str(e)}")


@app.route("/", methods=["POST"])
def requestEmail():
    # Load environment variables
    env_api = os.getenv("api_key")
    sender_of_message = os.getenv("sender")
    web_domain = os.getenv("domain")

    data = request.get_json()

    # Check for missing arguments
    if "email" not in data:
        return jsonify({"error": "Email is missing"}), 400

    email = data["email"]

    # Get the send times from the POST data
    # The send times can be specified in various ways
    if "send_times" in data:
        send_times = data[
            "send_times"
        ]  # Expected to be a list of numbers (minutes from now)
        # Validate send_times
        if not isinstance(send_times, list):
            return jsonify({"error": "send_times must be a list of numbers"}), 400

        # Convert the send_times to datetime objects
        current_time_utc = datetime.now(pytz.utc)
        send_datetimes = []

        for send_time in send_times:
            if isinstance(send_time, (int, float)):
                # Interpret as minutes from now
                send_dt = current_time_utc + timedelta(minutes=send_time)
                send_datetimes.append(send_dt)
            else:
                return (
                    jsonify({"error": "Invalid send_time format, must be numbers"}),
                    400,
                )

    elif "days" in data and "location" in data:
        daysWarning = data["days"]
        location = data["location"]  # Assuming location is a tuple/list of (lat, lng)

        # Get the satellite arrival datetime
        satArrive_response = requests.get(
            "https://landsat.co/data/satArrive", params={"location": location}
        )

        if satArrive_response.status_code != 200:
            return jsonify({"error": "Failed to get satellite arrival data"}), 500

        satArrive_data = satArrive_response.json()
        satArriveDT_str = satArrive_data.get("datetime")

        if not satArriveDT_str:
            return (
                jsonify({"error": "Satellite arrival datetime missing in response"}),
                500,
            )

        # Parse the datetime string to a datetime object
        satArriveDT = parser.isoparse(satArriveDT_str)

        # Compute the times for the emails
        firstEmail = satArriveDT - timedelta(days=daysWarning)
        secondEmail = satArriveDT + timedelta(hours=6)

        # Convert times to UTC
        firstUtc = firstEmail.astimezone(pytz.utc)
        secondUtc = secondEmail.astimezone(pytz.utc)

        send_datetimes = [firstUtc, secondUtc]

    else:
        return (
            jsonify(
                {"error": "Either send_times or days and location must be provided"}
            ),
            400,
        )

    # Email content (default strings)
    email_subject = "Test Email"
    email_body_text = "This is a test email sent from your script."
    email_body_html = "<p>This is a test email sent from your script.</p>"

    # Send emails
    current_time_utc = datetime.now(pytz.utc)  # Update current time
    for send_dt in send_datetimes:
        # If send_dt is equal to current time or in the past, send immediately
        if send_dt <= current_time_utc:
            send_date = None  # Immediate delivery
        else:
            send_date = send_dt

        send_email(
            email,
            sender_of_message,
            web_domain,
            env_api,
            send_date,
            email_subject,
            email_body_text,
            email_body_html,
        )

    return jsonify({"message": "Emails scheduled successfully", "email": email}), 200


if __name__ == "__main__":
    # Uncomment the desired app.run configuration
    # app.run(host='0.0.0.0', port=5000, debug=False)
    app.run(debug=True)
