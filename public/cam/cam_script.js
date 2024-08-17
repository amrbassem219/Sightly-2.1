document.addEventListener('DOMContentLoaded', (event) => {
    // Voice recognition functionality
    let recognition;
    if ('webkitSpeechRecognition' in window) {
        recognition = new webkitSpeechRecognition();
    } else if ('SpeechRecognition' in window) {
        recognition = new SpeechRecognition();
    } else {
        alert('Your browser does not support speech recognition.');
        return;
    }

    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'ar-EG';

    recognition.onstart = () => {
        console.log('Speech recognition started.');
    };
    const transcriptionElement = document.getElementById('transcription');

    recognition.onresult = async (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript.trim();
        console.log('Transcript:', transcript);
        transcriptionElement.textContent += `${transcript}`;
        if (transcript.includes('يا') || transcript.includes('سيد') || transcript.includes('سايت') || transcript.includes('لي') || transcript.includes('سيت')) {
            try {
                // Make sure the server is reachable
                const response = await fetch('http://localhost:3000/process', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ transcript })
                });

                if (!response.ok) {
                    throw new Error(`Server returned status ${response.status}`);
                }

                const data = await response.json();
                transcriptionElement.textContent += `\nServer Response: ${data.response}`;

                if (transcript.includes('خد') || transcript.includes('صورة')) {  // Trigger on specific voice commands
                    console.log('Capture command recognized');
                    captureImage();  // Call the capture image function when command is recognized
                }
            } catch (error) {
                // Display detailed error message for better debugging
                console.error('Error communicating with server:', error);
                transcriptionElement.textContent += `\nError communicating with server: ${error.message}`;
            }
        }
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
    };

    recognition.onend = () => {
        console.log('Speech recognition ended.');
        recognition.start();  // Restart speech recognition after it ends
    };

    recognition.start();  // Start voice recognition on page load

    // Camera capture functionality
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const scannedImage = document.getElementById('scanned-image');

    // Access the user's camera
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            video.srcObject = stream;
        })
        .catch(err => {
            console.error("Error accessing the camera: ", err);
        });

    // Function to capture the image from the video stream
    function captureImage() {
        const context = canvas.getContext('2d');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert the canvas image to a data URL and display it
        // const imageData = canvas.toDataURL('image/png');
        // scannedImage.src = imageData;
        // scannedImage.style.display = 'block';
        location.href = "../after analysis/after_analysis_index.html";
    }
});