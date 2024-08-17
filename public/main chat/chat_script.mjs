import Groq from "groq-sdk";

const groq = new Groq({ apiKey: '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' });

async function main(userInput) {
  console.log("main function called with input:", userInput);
  try {
    const chatCompletion = await getGroqChatCompletion(userInput);
    const response = chatCompletion.choices[0]?.message?.content || "";
    console.log("Response received:", response);
    return response;
  } catch (error) {
    console.error("Error in main function:", error);
  }
}

async function getGroqChatCompletion(userInput) {
  console.log("getGroqChatCompletion function called with input:", userInput);
  try {
    return groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: `You are a medical doctor named Sightly specializing in internal medicine and you only answer medical questions. Answer the following question with your medical expertise: ${userInput}`,
        },
      ],
      model: "llama3-8b-8192",
    });
  } catch (error) {
    console.error("Error in getGroqChatCompletion function:", error);
  }
}

const form = document.getElementById('chat-form');
const promptInput = document.getElementById('prompt');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const userInput = promptInput.value.trim();
  if (userInput) {
    try {
      const response = await main(userInput);
      console.log("Response received:", response);
      const responsePara = document.createElement('p');
      responsePara.textContent = response;
      document.getElementById('response-container').appendChild(responsePara);
    } catch (error) {
      console.error("Error in form submission:", error);
    }
  }
});
