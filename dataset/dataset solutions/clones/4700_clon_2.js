"use strict";

// This function constructs an object capable of reading input line by line.
const buildDataStream = () => {
  const sourceContent = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
  const streamHandler = {
    lineCollection: sourceContent,
    readPointer: 0,
    maximumIndex: sourceContent.length,

    // Checks if there are more lines to process.
    hasMoreElements: function () {
      return this.readPointer < this.maximumIndex;
    },

    // Retrieves the next line from the input.
    fetchItem: function () {
      if (!this.hasMoreElements()) {
        throw "ArrayIndexOutOfBoundsException"; // Indicate end of input
      } else {
        return this.lineCollection[this.readPointer++];
      }
    },
  };
  return streamHandler;
};

const inputProcessor = buildDataStream();

// Helper function to get the next raw line.
const getNextLine = () => inputProcessor.fetchItem();

// Helper function to parse the next line as an integer.
const getNextInteger = () => parseInt(inputProcessor.fetchItem());

// Helper function to get the next line as an array of strings, split by space.
const getNextStringArray = () => inputProcessor.fetchItem().split(" ");

// Helper function to get the next line as an array of integers, split by space.
const getNextIntegerArray = () => inputProcessor.fetchItem().split(" ").map((itemStr) => parseInt(itemStr));

// Helper function to get the next line as an array of characters.
const getNextCharacterArray = () => inputProcessor.fetchItem().split("");

// Helper function to check if more data is available.
const checkIfMoreData = () => inputProcessor.hasMoreElements();

// Custom output function for logging results.
const displayOutput = (...valuesToLog) => console.log(...valuesToLog);

// The primary execution logic of the program.
const ExecuteProgram = () => {
  const [countN, limitM] = getNextIntegerArray(); // Read two integers from the first line.

  // Calculate the final result based on the given conditions.
  let calculatedValue = limitM <= 2 * countN ? Math.floor(limitM / 2) : Math.floor((2 * countN + limitM) / 4);

  displayOutput(calculatedValue); // Output the computed value.
};

// Invoke the main program function.
ExecuteProgram();
