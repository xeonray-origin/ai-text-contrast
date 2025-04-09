const csv = require("csv-parser");
const fs = require("fs");
const brain = require("brain.js");

/**
 * Reads a CSV file and parses its content.
 * @param {string} filePath - Path to the CSV file.
 * @returns {Promise<Array>} - Resolves with parsed CSV data.
 */
const readFile = (filePath) => {
  return new Promise((resolve, reject) => {
    console.time("readFile");
    let results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", () => {
        console.timeEnd("readFile");
        console.log("CSV file successfully processed");
        resolve(results);
      })
      .on("error", (error) => {
        console.timeEnd("readFile");
        reject(error);
      });
  });
};

/**
 * Formats the data for training the neural network.
 * @param {Array} data - Parsed CSV data.
 * @returns {Array} - Formatted data for training.
 */
const formatData = (data) => {
  console.time("formatData");
  const formattedData = data.map((row) => {
    return {
      input: { r: parseFloat(row["R"]), g: parseFloat(row["G"]), b: parseFloat(row["B"]) },
      output: { [row["TextColor"]]: 1 },
    };
  });
  console.timeEnd("formatData");
  return formattedData;
};

/**
 * Trains a neural network with the provided data.
 * @param {Array} formattedData - Data formatted for training.
 * @returns {Object} - Trained neural network instance.
 */
const trainNetwork = (formattedData) => {
  console.time("trainNetwork");
  const net = new brain.NeuralNetwork();
  net.train(formattedData);
  console.timeEnd("trainNetwork");
  return net;
};

/**
 * Runs a prediction using the trained neural network.
 * @param {Object} net - Trained neural network instance.
 * @param {Object} input - Input RGB values for prediction.
 * @returns {string} - Predicted dominant color.
 */
const runPrediction = (net, input) => {
  console.time("runPrediction");
  const resu = net.run(input);
  const dominantColor = Object.keys(resu).reduce((a, b) => (resu[a] > resu[b] ? a : b));
  console.timeEnd("runPrediction");
  return dominantColor;
};

const init = async () => {
  try {
    const data = await readFile("./datasets/rgb_small.csv");
    const formattedData = await formatData(data);
    const net = trainNetwork(formattedData);
    const dominantColor = runPrediction(net, { r: 255, g: 87, b: 51 });
    console.log(dominantColor);
  } catch (end) {
    console.log(end);
  }
};

module.exports = {
  readFile,
  formatData,
  trainNetwork,
  runPrediction,
  init
};