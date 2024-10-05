import os

import requests
from dotenv import load_dotenv

load_dotenv()

env_api = os.getenv("api_key")
send = os.getenv("sender")
recip = os.getenv("recipient")
doma = os.getenv("domain")


def send_mailgun_email():
    api_key = str(env_api)
    domain = doma

    sender = send
    recipient = recip
    subject = "Test Email from landsatcheckemail.co"
    body_text = "This is a test email sent from landsatcheckemail.co using Mailgun."
    body_html = "<html><body>This is a <strong>test</strong> email sent from landsatcheckemail.co using Mailgun.</body></html>"

    url = f"https://api.eu.mailgun.net/v3/{domain}/messages"
    auth = ("api", api_key)
    data = {
        "from": sender,
        "to": recipient,
        "subject": subject,
        "text": body_text,
        "html": body_html,
    }

    try:
        response = requests.post(url, auth=auth, data=data)
        print(f"Status Code: {response.status_code}")
        print(f"Response Text: {response.text}")

        if response.status_code == 200:
            print("Email sent successfully!")
        else:
            print(f"Error sending email: {response.text}")
    except Exception as e:
        print(f"An error occurred: {str(e)}")


send_mailgun_email()
