from flask import Flask
from flask_cors import CORS

app = Flask(__name__)


if __name__ == "__main__":
    app.run(debug=True)
    # app.run(host='0.0.0.0', port=5000, debug=False)
    # CORS(app, origins=["https://landsatcheck.co"])
