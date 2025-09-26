from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
from PIL import Image
import numpy as np
import io
import os

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Load the trained model using a path relative to this file
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'pneumonia_model.h5')
try:
    print(f"[startup] Loading model from: {MODEL_PATH}")
    model = tf.keras.models.load_model(MODEL_PATH)
    print("[startup] Model loaded successfully.")
except Exception as e:
    print(f"[startup] Error loading model from {MODEL_PATH}: {e}")
    model = None

# Function to preprocess the uploaded image
def preprocess_image(image_bytes):
    img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    img = img.resize((224, 224))
    img_array = np.array(img)
    img_array = np.expand_dims(img_array, axis=0)
    img_array = img_array / 255.0
    return img_array

@app.route('/predict', methods=['POST'])
@app.route('/api/predict', methods=['POST'])
def predict():
    if model is None:
        print("[predict] Model not loaded")
        return jsonify({'error': 'Model is not loaded!'}), 500

    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    try:
        image_bytes = file.read()
        print(f"[predict] Received file: {file.filename}, size={len(image_bytes)} bytes")
        processed_image = preprocess_image(image_bytes)
        print(f"[predict] Processed image shape: {processed_image.shape}, dtype={processed_image.dtype}")

        # Make prediction
        prediction = model.predict(processed_image)
        print(f"[predict] Raw model output: {prediction}")
        confidence = float(prediction[0][0])

        # Determine result
        if confidence > 0.5:
            result = {'prediction': 'Pneumonia', 'confidence': confidence}
        else:
            result = {'prediction': 'Normal', 'confidence': 1 - confidence}

        print(f"[predict] Response: {result}")
        return jsonify(result)

    except Exception as e:
        print(f"[predict] Error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    status = 'ok' if model is not None else 'model_not_loaded'
    return jsonify({'status': status}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)