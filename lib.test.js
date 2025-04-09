const fs = require("fs");
const path = require("path");
const { readFile, formatData, trainNetwork, runPrediction } = require("./lib");
const brain = require("brain.js");

jest.mock("fs");
jest.mock("brain.js", () => {
  return {
    NeuralNetwork: jest.fn().mockImplementation(() => ({
      train: jest.fn(),
      run: jest.fn(() => ({ white: 0.9, black: 0.1 })),
    })),
  };
});

describe("AI Text Hue Library", () => {
  const mockCSVData = [
    { R: "255", G: "87", B: "51", TextColor: "white" },
    { R: "0", G: "0", B: "0", TextColor: "black" },
  ];

  const mockFormattedData = [
    { input: { r: 255, g: 87, b: 51 }, output: { white: 1 } },
    { input: { r: 0, g: 0, b: 0 }, output: { black: 1 } },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("readFile", () => {
    it("should read and parse a CSV file", async () => {
      const mockFilePath = path.join(__dirname, "datasets/rgb_small.csv");
      const mockStream = {
        pipe: jest.fn().mockReturnThis(),
        on: jest.fn((event, callback) => {
          if (event === "data") {
            callback(mockCSVData[0]);
            callback(mockCSVData[1]);
          }
          if (event === "end") {
            callback();
          }
          return mockStream;
        }),
      };

      fs.createReadStream.mockReturnValue(mockStream);

      const data = await readFile(mockFilePath);
      expect(data).toEqual(mockCSVData);
      expect(fs.createReadStream).toHaveBeenCalledWith(mockFilePath);
    });

    it("should handle errors during file reading", async () => {
      const mockFilePath = path.join(__dirname, "datasets/rgb_small.csv");
      const mockStream = {
        pipe: jest.fn().mockReturnThis(),
        on: jest.fn((event, callback) => {
          if (event === "error") {
            callback(new Error("File read error"));
          }
          return mockStream;
        }),
      };

      fs.createReadStream.mockReturnValue(mockStream);

      await expect(readFile(mockFilePath)).rejects.toThrow("File read error");
    });
  });

  describe("formatData", () => {
    it("should format CSV data for training", () => {
      const formattedData = formatData(mockCSVData);
      expect(formattedData).toEqual(mockFormattedData);
    });
  });

  describe("trainNetwork", () => {
    it("should train a neural network with formatted data", () => {
      const net = trainNetwork(mockFormattedData);
      expect(brain.NeuralNetwork).toHaveBeenCalled(); // Ensure the mock was called
      expect(net.train).toHaveBeenCalledWith(mockFormattedData); // Ensure training was called
    });
  });

  describe("runPrediction", () => {
    it("should predict the dominant text color for given RGB values", () => {
      const net = new brain.NeuralNetwork();
      net.train(mockFormattedData);

      const input = { r: 255, g: 87, b: 51 };
      const prediction = runPrediction(net, input);

      expect(prediction).toBe("white");
    });
  });
});