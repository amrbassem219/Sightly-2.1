from gtts import gTTS
import sys

# Check if a command-line argument is provided
if len(sys.argv) > 1:
    text = sys.argv[1]
else:
    print("Error: No text provided.")
    sys.exit(1)

# Language configuration
language = 'en'  # Set to Arabic (or 'ar-eg' for Egyptian Arabic)

# Create a gTTS object
tts = gTTS(text=text, lang=language, slow=False)

# Save the audio file
tts.save("output.mp3")


# "مستوي الهيموغلوبين منخفض جدا. أرشح أخذ مكمل غذائي"

"Your hemoglobin level is very low. I suggest taking an iron supplement"