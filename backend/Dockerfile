# Use a recent TensorFlow image compatible with Keras 3 (used during training)
FROM tensorflow/tensorflow:2.16.1

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file into the container at /app
COPY requirements.txt .

# Install any needed packages specified in requirements.txt
# TensorFlow is already present in the base image; installing again will be a no-op
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the backend application code
COPY . .

# Make port 5000 available to the world outside this container
EXPOSE 5000

# Run app.py when the container launches
CMD ["python", "app.py"]