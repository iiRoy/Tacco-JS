"use strict";

// This function initializes a data stream handler for reading input.
let buildInputReader = () => {
  // Read raw data from standard input, decode as UTF-8, remove leading/trailing whitespace,
  // and then split the content into an array of individual lines.
  let sourceLines = require("fs")
    .readFileSync("/dev/stdin", "utf8")
    .trim()
    .split("\n");

  // Construct an object that provides methods to manage input line access.
  let dataStream = {
    // The collection of all input lines read.
    contentList: sourceLines,
    // Pointer to the current line being processed.
    readPointer: 0,
    // Total quantity of lines available in the input.
    maxLines: sourceLines.length,

    // Determines if there are still unread lines in the stream.
    hasRemaining: function() {
      return this.readPointer < this.maxLines;
    },

    // Retrieves the subsequent line from the input stream.
    fetchNextItem: function() {
      // If no more lines are available, signal an error.
      if (!this.hasRemaining()) {
        throw "EndOfInputReachedException";
      }
      // Return the current line and then increment the pointer for the next read.
      return this.contentList[this.readPointer++];
    },
  };
  return dataStream; // Return the fully configured stream handler.
};

// Instantiate the global input stream object for program-wide access.
let globalInputStream = buildInputReader();

// Auxiliary functions to simplify common input parsing tasks.

// Obtains the next raw line from the input.
let getLine = () => globalInputStream.fetchNextItem();

// Reads the next line and converts it into an integer.
let parseInteger = () => parseInt(globalInputStream.fetchNextItem());

// Reads the next line and splits it into an array of string tokens using space as a delimiter.
let fetchWords = () => globalInputStream.fetchNextItem().split(" ");

// Reads the next line, splits it by spaces, and maps each token to an integer.
let fetchIntegers = () =>
  globalInputStream
    .fetchNextItem()
    .split(" ")
    .map((val) => parseInt(val));

// Reads the next line and converts it into an array of individual characters.
let fetchCharacters = () => globalInputStream.fetchNextItem().split("");

// Provides a simple check for whether more input data is available.
let moreInput = () => globalInputStream.hasRemaining();

// A utility function for logging results to the console.
let printOutput = (...messages) => console.log(...messages);

// The primary execution routine for the program's logic.
let RunSolution = () => {
  // Read the initial integer, which specifies the number of subsequent data pairs.
  let dataCount = parseInteger();

  // A placeholder array, included for structural similarity, though it's not actively used.
  let unusedContainer = new Array(dataCount).fill(0);

  // Arrays to store the first and second components of each input pair.
  let firstValues = [];
  let secondValues = [];

  // Continuously process input lines until no more are available.
  while (moreInput()) {
    let currentPair = fetchIntegers(); // Retrieve the next line as a pair of integers.
    firstValues.push(currentPair[0]); // Add the first integer to its respective collection.
    secondValues.push(currentPair[1]); // Add the second integer to its respective collection.
  }

  // Initialize a counter to accumulate the total required adjustment.
  let cumulativeAdjustment = 0;

  // Iterate through the collected data pairs in reverse order.
  for (let iterIndex = dataCount - 1; iterIndex >= 0; iterIndex--) {
    // Calculate a temporary value by adding the current cumulative adjustment to the first value.
    let tempCalculatedVal = firstValues[iterIndex] + cumulativeAdjustment;

    // Check for perfect divisibility of the temporary value by the second value.
    if (tempCalculatedVal % secondValues[iterIndex] === 0) {
      // If perfectly divisible, no change is needed for this pair; proceed to the next.
      continue;
    } else if (tempCalculatedVal < secondValues[iterIndex]) {
      // If the temporary value is less, add the difference to make it equal to the second value.
      cumulativeAdjustment += secondValues[iterIndex] - tempCalculatedVal;
    } else {
      // If the temporary value is greater and not perfectly divisible,
      // add the amount needed to reach the next multiple of the second value.
      cumulativeAdjustment +=
        secondValues[iterIndex] - (tempCalculatedVal % secondValues[iterIndex]);
    }
  }

  // Display the final computed total adjustment.
  printOutput(cumulativeAdjustment);
};

// Initiate the main program logic.
RunSolution();