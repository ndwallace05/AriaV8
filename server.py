from flask import Flask, jsonify, request
from livekit import api
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

LIVEKIT_API_KEY = os.environ.get("LIVEKIT_API_KEY")
LIVEKIT_API_SECRET = os.environ.get("LIVEKIT_API_SECRET")
LIVEKIT_URL = os.environ.get("LIVEKIT_URL")

@app.route("/")
def index():
    return app.send_static_file("frontend")

@app.route("/token")
def token():
    lk_api = api.AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET)
    grant = api.VideoGrant(room_join=True, room="my-room")
    token = lk_api.create(identity="user", grant=grant)
    return jsonify({"token": token})

if __name__ == "__main__":
    app.run(debug=True, port=8080)
