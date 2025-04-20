from flask import Flask, request, jsonify
from flask_cors import CORS
import time
import base64
import io
from PIL import Image
from dotenv import load_dotenv
import os
import random
from cerebras.cloud.sdk import Cerebras

load_dotenv()

app = Flask(__name__)
cors = CORS(app, resources={r"/*": {"origins": "*"}})
app.secret_key = os.getenv("APP_SECRET")

client = Cerebras(
    api_key=os.getenv("CEREBRAS_API_KEY"),
)

SYSTEM_PROMPT_TEMPLATE = """
You are the attending endoscopic surgeon observing a live GI procedure.

A colonoscopy is currently in progress. You are reviewing real-time endoscopic image frames and patient history (65-year-old male with frequent stomach aches).

Your task is to generate clear, intra-operative guidance based strictly on visual cues from the images.

Instructions:
- Use plain language, avoid excessive medical jargon.
- Maintain a calm, neutral tone suitable for an operating room team.
- Focus on actionable, step-by-step observations (e.g., positioning, suction, resection strategy).
- Your response should be brief: 15 words maximum.
- Only include advice that can be visually justified from the images.

Anything I saw is about the images I am seeing. I am not talking about myself. Even if you cannot see the images, pretend like you understand.
Think visually. Be direct. Prioritize safety and clarity in your feedback.
"""


stored_context = {}
frames = []

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
    global frames
    data = request.get_json()
    frames = data.get("frames", [])
    return jsonify({"message": "success", "farme count": len(frames)}), 200

@app.route("/next_steps", methods=["GET"])
def next_steps():
    global frames
    # 1) Decode, resize & recompress each frame
    processed_b64 = []
    if isinstance(frames, str):
        frames = [line.strip() for line in raw.splitlines() if line.strip()]
    
    for uri in frames:
        header, b64data = uri.split(",", 1)
        raw = base64.b64decode(b64data)
        img = Image.open(io.BytesIO(raw))
        # aggressive downsampling to fit context window
        img = img.resize((50, 50), Image.Resampling.LANCZOS)
        buf = io.BytesIO()
        img.save(buf, format="JPEG", quality=20)
        processed_b64.append(base64.b64encode(buf.getvalue()).decode("utf-8"))
    sample_count = min(10, len(processed_b64))
    sample_images = random.sample(processed_b64, sample_count)
    image_blocks = "\n\n".join(
        f"Image {i+1} (base64):\n{b64}"
        for i, b64 in enumerate(sample_images)
    )
    user_message = f"""
        We have {len(processed_b64)} total frames; here are {sample_count} randomly sampled for analysis:

        {image_blocks}

        Please analyze these images in context of the patient history and:
        • Summarize any visual patterns (e.g. progression, color/texture changes).
        • Recommend a unified intra‑operative plan covering all findings.

        Provide a short answer, no more than 10 words.
    """

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT_TEMPLATE},
        {"role": "user",   "content": user_message}
    ]

    # 5) Send to the LLM
    start_ts = time.time()
    resp = client.chat.completions.create(
        model="llama-4-scout-17b-16e-instruct",
        messages=messages,
        max_tokens=50
    )
    latency = time.time() - start_ts

    return jsonify({
        "next_steps": resp.choices[0].message.content.strip(),
        "chat_latency_s": round(latency, 2)
    }), 200


    return jsonify({"next_steps": "stop the bleeding and go to the upper GI"})

@app.route("/ask", methods=["POST"])
def handle_question():
    data = request.get_json()
    question = data.get("question", "").strip()
    global frames
    # 1) Decode, resize & recompress each frame
    processed_b64 = []
    if isinstance(frames, str):
        frames = [line.strip() for line in raw.splitlines() if line.strip()]
    
    for uri in frames:
        header, b64data = uri.split(",", 1)
        raw = base64.b64decode(b64data)
        img = Image.open(io.BytesIO(raw))
        # aggressive downsampling to fit context window
        img = img.resize((50, 50), Image.Resampling.LANCZOS)
        buf = io.BytesIO()
        img.save(buf, format="JPEG", quality=20)
        processed_b64.append(base64.b64encode(buf.getvalue()).decode("utf-8"))
    sample_count = min(10, len(processed_b64))
    sample_images = random.sample(processed_b64, sample_count)
    image_blocks = "\n\n".join(
        f"Image {i+1} (base64):\n{b64}"
        for i, b64 in enumerate(sample_images)
    )

    if not SYSTEM_PROMPT_TEMPLATE:
        return jsonify({"error":"No session context"}), 400

    messages = [
      {"role":"system", "content": 'Based on the endoscopic feed, please provide a brief answer to the following question (within 10 words). Here are the images: {image_blocks}'},
      {"role":"user",   "content": question}
    ]

    start = time.time()
    resp = client.chat.completions.create(
      model="llama-4-scout-17b-16e-instruct",
      messages=messages
    )
    return jsonify({
      "answer": resp.choices[0].message.content,
      "latency_s": round(time.time()-start,2)
    })


    return jsonify({
        "answer": response
    })



if __name__ == "__main__":
    app.run(port=8000, debug=True)