const csv = require("csv-parser");
const fs = require("fs");
const brain = require("brain.js");

const readFile = (filePath) => {
  return new Promise((resolve, reject) => {
    let results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", () => {
        console.log("CSV file successfully processed");
        resolve(results);
      })
      .on("error", (error) => {
        reject(error);
      });
  });
};

const formatData = (data) => {
  const formattedData = data.map((row) => {
    return {
      input: { r: row["R"], g: row["G"], b: row["B"] },
      output: { [row["TextColor"]]: 1 },
    };
  });
  return formattedData;
};

const init = async () => {
  try {
    const data = await readFile("./rgb_small.csv");
    const formattedData = await formatData(data);
    const net = new brain.NeuralNetwork();
    console.info("training started");
    net.train(formattedData);
    console.info("training ended");
    const resu = net.run([255, 87, 51]);
    const dominantColor = Object.keys(resu).reduce((a, b) =>
      resu[a] > resu[b] ? a : b
    );
    console.log(dominantColor);
  } catch (end) {
    console.log(end);
  }
};

init();
