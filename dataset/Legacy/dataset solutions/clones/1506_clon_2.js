"use strict"; // Enforce strict parsing and error handling

/**
 * Processes the raw input data to determine if a specific condition is met.
 * This function analyzes pairs of numbers from the input.
 * @param {string} rawData The complete input string received from standard input.
 */
function processInput(rawData) {
  // Clean up the input string and split it into individual lines.
  let processedLines = rawData.trim().split("\n");

  // The first line indicates the total number of subsequent data lines to process.
  const firstLineValue = Number(processedLines[0]);

  // Initialize a counter for consecutive matching pairs.
  let consecutiveMatches = 0;

  // Iterate through the data lines, starting from the second line (index 1).
  for (let idx = 1; idx <= firstLineValue; idx++) {
    // Split the current line into two parts, assuming they are space-separated.
    const currentPair = processedLines[idx].split(" ");

    // Check if the two parts of the current pair are identical.
    if (currentPair[0] == currentPair[1]) {
      // If they match, increment the consecutive match counter.
      consecutiveMatches++;
    } else {
      // If they don't match, reset the counter.
      consecutiveMatches = 0;
    }

    // If three or more consecutive matches are found, print "Yes" and exit.
    if (consecutiveMatches >= 3) {
      console.log("Yes");
      return; // Terminate execution early.
    }
  }

  // If the loop completes without finding three consecutive matches, print "No".
  console.log("No");
}

/**
 * Sorts an array of numbers in ascending order.
 * This function is currently not utilized in the main logic.
 * @param {number[]} dataCollection The array of numbers to be sorted.
 * @returns {number[]} The sorted array.
 */
function numericArraySorter(dataCollection) {
  dataCollection.sort(comparisonFunction); // Use the custom comparison function.
  return dataCollection;
}

// A comparison function for sorting numbers in ascending order.
var comparisonFunction = function (valA, valB) {
  return valA - valB; // Standard numeric comparison.
};

// Read input from standard input and pass it to the main processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf-8"));
