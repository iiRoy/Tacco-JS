"use strict";

// This function initializes a utility for reading input lines from standard input.
const makeInputReader = () => {
  // Read all content from stdin, decode as UTF-8, remove leading/trailing whitespace, and split into an array of lines.
  const sourceContent = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");

  // Create an object to manage the input lines and provide navigation methods.
  const dataProcessor = {
    linesArray: sourceContent, // Stores the array of input lines.
    currentPosition: 0,        // Tracks the current line index.
    maximumIndex: sourceContent.length, // Stores the total number of lines.

    // Checks if there are more lines to read.
    hasMoreData: function () {
      return this.currentPosition < this.maximumIndex;
    },

    // Retrieves the next line from the input.
    retrieveNext: function () {
      if (!this.hasMoreData()) {
        // If no more lines, throw an error indicating out-of-bounds access.
        throw "ArrayIndexOutOfBoundsException";
      } else {
        // Return the current line and then increment the position.
        return this.linesArray[this.currentPosition++];
      }
    }
  };
  return dataProcessor;
};

// Initialize the global input reader instance.
const inputHandler = makeInputReader();

// Helper function to get the next raw line.
const getNextLine = () => inputHandler.retrieveNext();

// Helper function to parse the next line as an integer.
const getNextInteger = () => parseInt(inputHandler.retrieveNext());

// Helper function to split the next line into an array of strings.
const readStringTokens = () => inputHandler.retrieveNext().split(" ");

// Helper function to split the next line into an array of integers.
const readIntTokens = () => inputHandler.retrieveNext().split(" ").map(el => parseInt(el));

// Helper function to split the next line into an array of characters.
const readCharTokens = () => inputHandler.retrieveNext().split("");

// Helper function to check if there's more input available.
const moreAvailable = () => inputHandler.hasMoreData();

// Helper function for printing output to the console.
const displayResult = (...outputItems) => console.log(...outputItems);

// The main logic of the program.
const executeSolution = () => {
  // Read the three initial integers N, M, K from the first line.
  let [valN, valM, valK] = readIntTokens();
  // Read array 'a' from the second line.
  let listA = readIntTokens();
  // Read array 'b' from the third line.
  let listB = readIntTokens();

  // Calculate prefix sums for array 'a'.
  let prefixSumsA = [0];
  for (let idxA = 0; idxA < listA.length; idxA++) {
    prefixSumsA.push(prefixSumsA[idxA] + listA[idxA]);
  }

  // Calculate prefix sums for array 'b'.
  let prefixSumsB = [0];
  for (let idxB = 0; idxB < listB.length; idxB++) {
    prefixSumsB.push(prefixSumsB[idxB] + listB[idxB]);
  }

  // Initialize the variable to store the maximum count of books.
  let maximumCount = 0;

  // Iterate through possible numbers of books from listA (from 0 to N).
  // Use a two-pointer approach with 'idxB' for listB.
  for (let idxA = 0, idxB = valM; idxA <= valN; idxA++) {
    // If the cumulative sum from listA already exceeds K, we can't add more from listA.
    if (prefixSumsA[idxA] > valK) {
      break;
    }

    // While the combined sum of books from listA (up to idxA) and listB (up to idxB)
    // exceeds K, reduce the number of books taken from listB.
    while (prefixSumsA[idxA] + prefixSumsB[idxB] > valK) {
      idxB--;
    }

    // Update the maximum count of books if the current combination (idxA + idxB) is greater.
    maximumCount = Math.max(maximumCount, idxA + idxB);
  }

  // Print the final maximum count of books.
  console.log(maximumCount);
};

// Execute the main solution function.
executeSolution();
