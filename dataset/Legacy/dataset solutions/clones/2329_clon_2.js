/*
 * This script processes numerical input to determine a specific sequence property.
 * It reads data from standard input, parses it, and performs a calculation.
 */

"use strict";

const analyzeSequence = (inputLines) => {
  // Parse the first line as the total count of elements.
  let totalCount = Number.parseInt(inputLines[0]);

  // Parse the second line, splitting by space and converting each part to a number.
  let numberArray = Array.from(inputLines[1].split(" "), (strNum) =>
    Number.parseInt(strNum)
  );

  // Initialize a counter for the expected sequence number.
  let expectedSequenceNum = 1;

  // Iterate through each number in the parsed array.
  for (let currentNumber of numberArray) {
    // If the current number matches the expected sequence number, increment the expectation.
    if (currentNumber === expectedSequenceNum) {
      expectedSequenceNum += 1;
    }
  }

  // Determine the result based on the final expected sequence number.
  // If it's still 1, no sequence was found, return -1.
  // Otherwise, calculate the difference from the total count.
  return expectedSequenceNum === 1 ? -1 : totalCount - expectedSequenceNum + 1;
};

// Read input from standard input, decode as UTF-8, trim whitespace, and split into lines.
// Then, pass the processed lines to the analysis function and print the result to console.
console.log(
  analyzeSequence(
    require("fs").readFileSync("/dev/stdin", "utf-8").trim().split("\n")
  )
);
