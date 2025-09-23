import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from livekit.api import AccessToken, VideoGrants
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/get_livekit_token": {"origins": "http://localhost:5173"}})


LIVEKIT_API_KEY = os.environ.get("LIVEKIT_API_KEY")
LIVEKIT_API_SECRET = os.environ.get("LIVEKIT_API_SECRET")
LIVEKIT_URL = os.environ.get("LIVEKIT_URL")

if not all([LIVEKIT_API_KEY, LIVEKIT_API_SECRET, LIVEKIT_URL]):
    raise ValueError("LIVEKIT_API_KEY, LIVEKIT_API_SECRET, and LIVEKIT_URL environment variables must be set.")

@app.route("/get_livekit_token", methods=["POST"])
def get_livekit_token():
    """
    Generates a LiveKit access token for a user.
    The frontend should send a POST request with a JSON body containing:
    - user_id: A unique identifier for the user (e.g., email).
    - access_token: The user's Google OAuth access token.
    """
    data = request.get_json()
    user_id = data.get("user_id")
    access_token = data.get("access_token")

    if not user_id or not access_token:
        return jsonify({"error": "user_id and access_token are required"}), 400

    # The agent will connect as a participant with a unique identity
    agent_identity = f"agent-{user_id}"

    # The metadata will be passed to the agent's entrypoint
    metadata = {
        "user_id": user_id,
        "access_token": access_token,
    }

    # Create a LiveKit access token
    lk_token = AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET)
    grant = VideoGrants(room_join=True, room="aria-room") # A single room for all sessions for now

    lk_token.with_identity(agent_identity)
    lk_token.with_metadata(json.dumps(metadata))
    lk_token.add_grant(grant)

    return jsonify({"token": lk_token.to_jwt()})

if __name__ == "__main__":
    app.run(port=5001)
