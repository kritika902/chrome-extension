// Set up the Google Cloud Speech-to-Text API client
const client = new window.SpeechRecognition();
client.interimResults = true;
client.continuous = true;
const apiKey = "YOUR_API_KEY_HERE";
const googleConfig = {
  encoding: "LINEAR16",
  sampleRateHertz: 16000,
  languageCode: "en-US",
};
const googleRequest = {
  config: googleConfig,
  interimResults: true,
};

// Start the speech recognition when the extension is clicked
chrome.browserAction.onClicked.addListener((tab) => {
  client.start();
});

// Handle the speech recognition results
client.onresult = (event) => {
  const result = event.results[event.resultIndex];
  const transcript = result[0].transcript.trim();

  // Perform an action based on the transcribed text
  if (transcript === "open Google") {
    chrome.tabs.create({ url: "https://www.google.com" });
  }

  // Log the transcribed text
  console.log(transcript);
};

// Handle any speech recognition errors
client.onerror = (event) => {
  console.error(event.error);
};

// Use the Google Cloud Speech-to-Text API to transcribe the speech
client.onaudiostart = () => {
  console.log("Speech recognition started");
};
client.onaudioend = () => {
  console.log("Speech recognition ended");
};
client.onend = () => {
  console.log("Speech recognition stopped");
};
client.onstart = () => {
  googleRequest.audio = { content: "" };
};
client.onnomatch = (event) => {
  console.log("Speech not recognized: ", event);
};
client.onsoundstart = () => {
  console.log("Sound detected");
};
client.onsoundend = () => {
  console.log("Sound ended");
};
client.onspeechstart = () => {
  console.log("Speech started");
};
client.onboundary = () => {
  const audioData = event.results[event.resultIndex][0].transcript;
  const audioBytes = new Uint8Array(audioData);
  googleRequest.audio = {
    content: Buffer.from(audioBytes).toString("base64"),
  };
  fetch(
    `https://speech.googleapis.com/v1/speech:recognize?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(googleRequest),
    }
  )
    .then((response) => response.json())
    .then((data) => {
      const transcript = data.results[0].alternatives[0].transcript.trim();
      console.log("Google transcribed:", transcript);
    })
    .catch((error) => {
      console.error("Speech-to-Text API error:", error);
    });
};
