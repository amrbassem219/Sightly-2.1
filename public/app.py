import pytesseract
from PIL import Image
from flask import Flask, render_template, jsonify, request
from groq import Client

app = Flask(__name__)

# Set up the Tesseract command path
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

# API key for the Groq API
api_key = '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'
client = Client(api_key=api_key)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/send_message", methods=["POST"])
def send_message():
    try:
        data = request.get_json()
        user_message = data.get("message", "")

        # Perform OCR on the image
        image_name = 'report.png'
        image = Image.open('static/' + image_name)
        ocr_text = pytesseract.image_to_string(image, lang='eng', config='--psm 6')
        print("Extracted OCR text:", ocr_text)  # Debugging print statement

        # Combine OCR text with user input
        prompt = f"You are a medical doctor named Sightly specializing in internal medicine and you only answer medical questions. Answer the following question with your medical expertise: {user_message}"

        # Generate a response using Groq API
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            model="llama3-8b-8192",
        )
        response_text = chat_completion.choices[0].message.content

        return jsonify({"response": response_text})
    except Exception as e:
        print("Error:", e)  # Print the error to the console for debugging
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", debug=True)
