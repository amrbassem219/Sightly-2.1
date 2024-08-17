import express from 'express';
import axios from 'axios';
import cors from 'cors';
import { Builder, By, until } from 'selenium-webdriver';
import edge from 'selenium-webdriver/edge.js'; // Ensure the extension is correct
import path from 'path';
import { fileURLToPath } from 'url';

// Define __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(cors());  // Enable CORS to allow communication between front-end and back-end

const groq_api_key_1 = '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';  // Replace with your first Groq API key
const groq_api_key_2 = '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';  // Replace with your second Groq API key

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/index.html'));  // Serve the HTML file
});

// Change the route to '/process' to match the front-end code
app.post('/process', async (req, res) => {
  const { transcript } = req.body;

  if (transcript) {
    const response = await getGroqChatCompletion(transcript);
    res.json({ response });
  } else {
    res.status(400).json({ error: 'No transcript provided' });
  }
});

async function getGroqChatCompletion(userInput) {
  const conversation = [
    {
      role: "user",
      content: `You are a medical doctor named Sightly specializing in internal medicine and you only answer medical questions. Answer the following question with your medical expertise: ${userInput}`,
    },
  ];

  try {
    const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
      model: 'llama3-8b-8192',
      messages: conversation,
    }, {
      headers: { Authorization: `Bearer ${groq_api_key_1}` },
    });

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error in Groq API call:', error);
    return 'Error processing request';
  }
}

// Route to trigger Selenium automation
app.post('/trigger-selenium', async (req, res) => {
  try {
    await runSeleniumAutomation();
    res.json({ message: 'Selenium automation triggered successfully.' });
  } catch (error) {
    console.error('Error triggering Selenium automation:', error);
    res.status(500).json({ error: 'Failed to trigger Selenium automation' });
  }
});

// Function to run Selenium automation in Edge browser
async function runSeleniumAutomation() {
  const service = new edge.ServiceBuilder('D:/docchat/assistant/test/whisper/simpler/public/msedgedriver.exe');  // Provide the path to msedgedriver

  const options = new edge.Options();

  // Initialize the Edge WebDriver
  const driver = new Builder()
    .forBrowser('MicrosoftEdge')
    .setEdgeService(service)
    .setEdgeOptions(options)
    .build();

  try {
    // Focus on the currently open tab/window
    await driver.switchTo().window(await driver.getWindowHandle());

    // Wait for the 'أضف إلى السلة' button to be present and visible
    await driver.wait(until.elementLocated(By.xpath("//button[contains(text(), 'أضف إلى السلة')]")), 10000);

    // Find and click the 'أضف إلى السلة' button
    const addToCartButton = await driver.findElement(By.xpath("//button[contains(text(), 'أضف إلى السلة')]"));
    await addToCartButton.click();

    console.log("Clicked the 'أضف إلى السلة' button.");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await driver.quit();  // Ensure the driver is closed after execution
  }
}

// Serve static files from public directory
app.use(express.static('public'));

app.listen(3000, () => {
  const url = 'http://localhost:3000';
  console.log(`Server is running. Open ${url} in your browser.`);
});
