document.addEventListener('DOMContentLoaded', (event) => {
    async function speakText(text) {
        return new Promise((resolve, reject) => {
            try {
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.lang = 'en-US';

                utterance.onstart = () => {
                    document.getElementById('listenvid').src = '../static/speaking.gif'; // Change to speaking GIF
                };

                utterance.onend = () => {
                    document.getElementById('listenvid').src = '../static/listen.gif'; // Change back to listening GIF after speaking
                    resolve();  // Resolve the promise when speaking finishes
                };

                window.speechSynthesis.speak(utterance);
            } catch (error) {
                console.error('Error with speakText:', error);
                reject(error);
            }
        });
    }

    const initialMessage = "Overall, your blood report is fine, but your hemoglobin is very low, indicating anemia. Take an iron supplement daily and consult your doctor for further evaluation.";
    const transcriptionElement = document.getElementById('transcription');
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
        listenvid.src = '../static/listen.gif'; // Change to listening GIF
    };

    recognition.onresult = async (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript.trim();
        console.log('Transcript:', transcript);
        transcriptionElement.textContent += `${transcript}`;
        if (transcript.includes('يا') || transcript.includes('سيد') || transcript.includes('سايت') || transcript.includes('لي') || transcript.includes('سيت')) {

            try {
                listenvid.src = '../static/thinking.gif'; // Change to analyzing GIF
                const response = await fetch('http://localhost:3000/process', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ transcript })
                });

                const data = await response.json();
                transcriptionElement.textContent += `\nServer Response: ${data.response}`;

                if (data.response.includes('buy a medication') || transcript.includes('صيدلية')) {
                    speakText("Sure");
                    window.open('https://www.vezeeta.com/ar-eg/pharmacy/%D9%81%D9%8A%D8%B1%D9%88%D8%AC%D9%84%D9%88%D8%A8%D9%8A%D9%86-30-%D9%83%D8%A8%D8%B3%D9%88%D9%84');

                    // try {
                    //     const response = await fetch('http://localhost:3000/trigger-selenium', {
                    //         method: 'POST'
                    //     });

                    //     const data = await response.json();
                    //     console.log(data.message);
                    // } catch (error) {
                    //     console.error('Error triggering Selenium automation:', error);
                    // }

                    speakText("I found this iron supplement on vezeeta.com, do you want me to order it?");
                }
                else if (data.response.includes('consult a doctor') || transcript.includes('دكتور')){
                    speakText("Sure")
                    location.href = ('../consult doctor/consult_index.html')
                }

            } catch (error) {
                console.error('Error communicating with server:', error);
                transcriptionElement.textContent += `\nError communicating with server.`;
            }
        };
    }
    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
    };

    recognition.onend = () => {
        console.log('Speech recognition ended.');
        recognition.start();  // Restart speech recognition after it ends
    };

    // Wait for 2 seconds with the "thinking" GIF before speaking
    listenvid.src = '../static/thinking.gif';  // Change to thinking GIF
    setTimeout(() => {
        speakText(initialMessage).then(() => {
            recognition.start();  // Start recognition after speaking finishes
        }).catch((error) => {
            console.error('Error during speech synthesis:', error);
        });
    }, 2000);  // 2-second delay
});
