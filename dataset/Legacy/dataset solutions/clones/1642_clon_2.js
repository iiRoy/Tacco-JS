"use strict"; // Enforces stricter parsing and error handling in the code.

/**
 * Processes a raw input string, extracts a numeric value, and categorizes it
 * based on predefined ranges, printing the corresponding category.
 * @param {string} rawData - The initial string input, potentially containing whitespace.
 */
function processInput(rawData) {
  // First, remove any leading or trailing whitespace from the input string.
  let cleanedData = rawData.trim();

  // Convert the cleaned string into an integer. This integer will be used for categorization.
  let scoreValue = parseInt(cleanedData);

  // Series of conditional checks to determine the category based on the 'scoreValue'.
  // Each 'if' block represents a distinct range for the score.
  if (scoreValue >= 400 && scoreValue <= 599) {
    console.log("8"); // Output "8" if the score falls within this specific range.
  }

  if (scoreValue >= 600 && scoreValue <= 799) {
    console.log("7"); // Output "7" for scores in this bracket.
  }

  if (scoreValue >= 800 && scoreValue <= 999) {
    console.log("6"); // Output "6" for scores between 800 and 999.
  }

  if (scoreValue >= 1000 && scoreValue <= 1199) {
    console.log("5"); // Output "5" for scores from 1000 to 1199.
  }

  if (scoreValue >= 1200 && scoreValue <= 1399) {
    console.log("4"); // Output "4" for scores in the 1200-1399 range.
  }

  if (scoreValue >= 1400 && scoreValue <= 1599) {
    console.log("3"); // Output "3" for scores between 1400 and 1599.
  }

  if (scoreValue >= 1600 && scoreValue <= 1799) {
    console.log("2"); // Output "2" for scores from 1600 to 1799.
  }

  if (scoreValue >= 1800 && scoreValue <= 1999) {
    console.log("1"); // Output "1" for scores in the highest range, 1800 to 1999.
  }
}

/**
 * Sorts an array of numbers in ascending order using a custom comparison function.
 * This function is defined but not invoked within the primary execution flow of this script.
 * @param {Array<number>} numericCollection - The array of numbers that needs to be sorted.
 * @returns {Array<number>} The same array, but with its elements sorted numerically in ascending order.
 */
function arrangeNumericArray(numericCollection) {
  numericCollection.sort(ascendingComparator); // Applies the 'ascendingComparator' to sort the array.
  return numericCollection; // Returns the now sorted array.
}

/**
 * A constant function expression that serves as a comparator for sorting numbers.
 * It's designed for use with Array.prototype.sort() to achieve ascending numerical order.
 * @param {number} valA - The first number to compare.
 * @param {number} valB - The second number to compare.
 * @returns {number} A negative value if valA should come before valB,
 *                   a positive value if valA should come after valB,
 *                   or zero if they are considered equal.
 */
const ascendingComparator = function (valA, valB) {
  return valA - valB; // Standard comparison for ascending numeric sort.
};

// The main entry point of the script:
// Reads content from standard input, decodes it as UTF-8, and passes it to the 'processInput' function.
processInput(require("fs").readFileSync("/dev/stdin", "utf-8"));
