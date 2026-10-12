"use strict";

/**
 * This function serves as the primary entry point for processing input data.
 * It takes a raw string, parses it, performs a specific calculation,
 * and then outputs the final computed value.
 *
 * @param {string} rawData - The complete input string received, typically from standard input.
 */
function processInput(rawData) {
  // First, we split the incoming raw data by newline characters.
  // Then, we filter out any resulting empty strings to ensure we only process meaningful lines.
  const parsedLines = rawData.split("\n").filter(function(lineContent) {
    return lineContent !== ""; // Keep only lines that are not empty.
  });

  // The problem statement implies that the first non-empty line is the one we need to analyze.
  const targetString = parsedLines[0];

  // We now perform a sequence of operations on the target string to derive the final outcome.
  // This involves splitting, mapping, filtering, and finally reducing the data.
  const finalOutcome = targetString
    .split("") // Break the string into an array of individual characters.
    .map((charElement, charPosition) => {
      // For each character, if it's 'W', we record its original index (position).
      // Otherwise, if it's any other character, we record a zero.
      return charElement === "W" ? charPosition : 0;
    })
    .filter(function(numericValue) {
      // We then filter this array, keeping only the non-zero values.
      // These non-zero values represent the indices of all 'W' characters.
      return numericValue !== 0;
    })
    .reduce((accumulator, currentValue, reducePosition) => {
      // Finally, we reduce the array of 'W' indices to a single number.
      // The calculation is: sum of (index of 'W' - its sequential position in the filtered array).
      return accumulator + currentValue - reducePosition;
    });

  // The calculated final outcome is then printed to the console.
  console.log(finalOutcome);
}

// This line initiates the entire process.
// It reads the content of standard input synchronously, using UTF-8 encoding,
// and passes it to our `processInput` function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
