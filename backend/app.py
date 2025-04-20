from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
cors = CORS(app, resources={r"/*": {"origins": "*"}})

stored_context = {}

@app.route("/")
def index():
    return "Server is running!"

@app.route("/start", methods=["POST", "OPTIONS"])
def start_workflow():
    if request.method == "OPTIONS":
        return '', 204

    data = request.get_json()
    disease = data.get("disease")
    history = data.get("history")

    if not disease or not history:
        return jsonify({"error": "Missing disease or history"}), 400

    stored_context["disease"] = disease
    stored_context["history"] = history

    print("Received context:", stored_context)
    return jsonify({"message": "success"}), 200

@app.route("/frames", methods=["POST"])
def receive_frames():
    data = request.get_json()
    frames = data.get("frames", [])
    # print(f"read {len(frames)} frames")
    # print(type(frames[0]))
    return jsonify({"message": "success", "farme count": len(frames)}), 200

@app.route("/next-steps", methods=["GET"])
def dummy_next_steps():
    return jsonify({"next_steps": "stop the bleeding and go to the upper GI"})


if __name__ == "__main__":
    app.run(port=8000, debug=True)
