"use strict";

// This module calculates a specific budget sum based on input values.

const DEVELOPMENT_FLAG = !true; // A flag to determine the source of input data.
const initialData = DEVELOPMENT_FLAG
  ? "600\n300\n220\n420" // Hardcoded sample data for testing purposes.
  : require("fs") // Node.js file system module.
      .readFileSync("/dev/stdin", "utf8") // Read content from standard input as UTF-8.
      .trim(); // Remove any leading or trailing whitespace from the input string.

/**
 * Processes the raw input string, performs calculations, and outputs the result.
 * @param {string} unprocessedText - The raw string containing numbers separated by newlines.
 */
const computeAndDisplay = (unprocessedText) => {
  // Split the input string into an array of strings, then convert each string to an integer.
  const numericValues = unprocessedText.split("\n").map((item) => parseInt(item, 10));

  // Calculate the sum of the minimum of the first two numbers and the minimum of the next two numbers.
  console.log(
    Math.min.apply(Math, numericValues.slice(0x0, 1 + 1)) + // Finds the minimum of the first two elements.
      Math.min.apply(Math, numericValues.slice(1 + 1, 2 * 2)) // Finds the minimum of the third and fourth elements.
  );
};

// Invoke the main processing function with the prepared input data.
computeAndDisplay(initialData);
