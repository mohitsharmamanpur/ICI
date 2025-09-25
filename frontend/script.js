document.getElementById('predictBtn').addEventListener('click', async () => {
    const fileInput = document.getElementById('xrayImage');
    const resultDiv = document.getElementById('result');

    if (fileInput.files.length === 0) {
        resultDiv.innerHTML = `<div class="alert alert-danger">Please select a file first!</div>`;
        return;
    }

    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append('file', file);

    resultDiv.innerHTML = `<div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div>`;

    try {
        const response = await fetch('http://localhost:5000/predict', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const confidencePercent = (data.confidence * 100).toFixed(2);
        
        const alertClass = data.prediction === 'Pneumonia' ? 'alert-danger' : 'alert-success';

        resultDiv.innerHTML = `
            <div class="alert ${alertClass}">
                <h2>Result: <strong>${data.prediction}</strong></h2>
                <p>Confidence: ${confidencePercent}%</p>
            </div>
        `;
    } catch (error) {
        resultDiv.innerHTML = `<div class="alert alert-danger">Error: ${error.message}</div>`;
        console.error('Error:', error);
    }
});