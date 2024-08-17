document.addEventListener('DOMContentLoaded', (event) => {
    async function speakText(text) {
        try {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US';

            utterance.onstart = () => {
                document.getElementById('listenvid').src = 'static/speaking.gif';
            };

            utterance.onend = () => {
                document.getElementById('listenvid').src = 'static/listen.gif';
            };

            window.speechSynthesis.speak(utterance);
        } catch (error) {
            console.error('Error with speakText:', error);
        }
    }

    const transcriptionElement = document.getElementById('transcription');
    const startListeningText = document.getElementById('start-listening');
    const listenvid = document.getElementById('listenvid');

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
        listenvid.src = 'static/listen.gif'; // Listening GIF
    };

    recognition.onresult = async (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript.trim();
        console.log('Transcript:', transcript);

        // Always append transcript to transcription element
        transcriptionElement.textContent += ` ${transcript}`;

        // Only trigger "thinking" GIF and server request if specific words are detected
        if (transcript.includes('يا') || transcript.includes('سيد') || transcript.includes('سايت') || transcript.includes('لي') || transcript.includes('سيت')) {
            try {
                listenvid.src = 'static/thinking.gif'; // Show analyzing GIF

                // Send the transcript to the server for processing
                const response = await fetch('http://localhost:3000/process', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ transcript })
                });

                const data = await response.json();
                transcriptionElement.textContent += `\nServer Response: ${data.response}`;

                // Redirect if necessary based on server response
                if (data.response.includes('capture webcam') || transcript.includes('صور') || transcript.includes('تحليل') || transcript.includes('جديد')) {
                    speakText("Sure");
                    location.href = ('cam/cam_index.html');
                }
                else if (data.response.includes('consult a doctor') || transcript.includes('دكتور')) {
                    speakText("Sure");
                    location.href = ('consult doctor/consult_index.html');
                }

            } catch (error) {
                console.error('Error communicating with server:', error);
                transcriptionElement.textContent += `\nError communicating with server.`;
            } finally {
                // Revert back to listening GIF after processing
                listenvid.src = 'static/listen.gif';
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

    // Start listening on click
    startListeningText.addEventListener('click', () => {
        startListeningText.style.display = 'none'; // Hide the text after clicking
        recognition.start(); // Start speech recognition
    });
});
