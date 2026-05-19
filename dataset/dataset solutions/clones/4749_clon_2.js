"use strict";

// This module provides utilities for reading input from standard input.
const dataFactory = () => {
  // Read all lines from stdin, trim whitespace, and split into an array of strings.
  const sourceLines = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");

  // Create an object to manage input reading state.
  const dataProcessor = {
    linesCollection: sourceLines, // The array of input lines.
    linePointer: 0,               // Current index in the linesCollection.
    totalLines: sourceLines.length, // Total number of lines available.

    // Checks if there are more lines to read.
    hasMoreData: function () {
      return this.linePointer < this.totalLines;
    },

    // Retrieves the next line from the input.
    retrieveNext: function () {
      if (!this.hasMoreData()) {
        // If no more data, throw an error indicating out-of-bounds access.
        throw "InputDataExhaustedError";
      } else {
        // Return the current line and advance the pointer.
        return this.linesCollection[this.linePointer++];
      }
    },
  };
  return dataProcessor; // Return the configured data processor.
};

// Initialize the input handler.
const inputHandler = dataFactory();

// Helper function to get the next raw line.
const fetchNextItem = () => inputHandler.retrieveNext();

// Helper function to parse the next line as an integer.
const parseNextInt = () => parseInt(inputHandler.retrieveNext());

// Helper function to split the next line into an array of strings.
const splitNextLine = () => inputHandler.retrieveNext().split(" ");

// Helper function to split the next line, parse elements as integers, and return an array.
const parseNextIntArray = () => inputHandler.retrieveNext().split(" ").map((element) => parseInt(element));

// Helper function to split the next line into an array of characters.
const splitNextChars = () => inputHandler.retrieveNext().split("");

// Helper function to check if more input is available.
const moreInputAvailable = () => inputHandler.hasMoreData();

// Custom function for printing output to the console.
const displayOutput = (...outputArgs) => console.log(...outputArgs);

// The main program logic.
const executeProgram = () => {
  // Read the number of elements.
  let numElements = parseNextInt();

  // Initialize an array to store adjustment values, filled with zeros.
  let adjustmentValues = new Array(numElements).fill(0);

  // Arrays to store the first and second values from input pairs.
  let initialAmounts = [];
  let multipliers = [];

  // Loop through the remaining input lines to populate initialAmounts and multipliers.
  while (moreInputAvailable()) {
    let currentPair = parseNextIntArray(); // Read a pair of integers.
    initialAmounts.push(currentPair[0]);   // Store the first value.
    multipliers.push(currentPair[1]);      // Store the second value.
  }

  // Variable to accumulate adjustments.
  let cumulativeAdjustment = 0;

  // Iterate backwards through the elements to calculate adjustments.
  for (let i = numElements - 1; i >= 0; i--) {
    let factor = 1; // Initialize a factor for calculation.

    // Determine the smallest factor that satisfies the condition.
    while (factor * multipliers[i] < initialAmounts[i] + cumulativeAdjustment) {
      factor++;
    }

    // Calculate the adjustment for the current element.
    adjustmentValues[i] = factor * multipliers[i] - initialAmounts[i] - cumulativeAdjustment;

    // Add the current adjustment to the cumulative sum.
    cumulativeAdjustment += adjustmentValues[i];
  }

  // Calculate the total sum of all adjustment values.
  let totalAdjustment = adjustmentValues.reduce((accumulator, currentVal) => accumulator + currentVal);

  // Print the final result to the console.
  console.log(totalAdjustment);
};

// Execute the main program.
executeProgram();
