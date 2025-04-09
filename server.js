const express = require("express");
const path = require("path");
const { readFile, formatData, trainNetwork, runPrediction } = require("./lib");

const app = express();
const PORT = 3000;

// Serve the index.html file
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// GET route that accepts an 'rgb' parameter and returns a string
// Route for training the network
app.get("/train", async (req, res) => {
  try {
    const rgbInput = req.query.rgb;
    if (!rgbInput) {
        throw new Error("Missing 'rgb' query parameter");
    }
    console.time("totalProcess");
    const filePath = path.join(__dirname, "/datasets/rgb_contrast_dataset.csv");
    const data = await readFile(filePath);
    const formattedData = formatData(data);
    const net = trainNetwork(formattedData);
    // Measure performance before training
    console.time("trainingProcess");
    const startTime = Date.now();
    net.train(formattedData);
    const endTime = Date.now();
    console.timeEnd("trainingProcess");
    // Measure performance after training
    const performance = {
        durationMs: endTime - startTime,
    };
    // Call the runPrediction function with an input that will be passed in the query parameters called 'rgb'
    const prediction = runPrediction(net, rgbInput);
    performance.prediction = prediction;
    console.timeEnd("totalProcess");
    res.json({ message: "Training completed", performance, prediction });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "An error occurred during processing" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});