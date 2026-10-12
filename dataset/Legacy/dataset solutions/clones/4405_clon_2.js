"use strict";

// This function processes the input string to find products of repeated numbers.
const processInputData = (rawInput) => {
  // Trim whitespace and split the input into lines.
  rawInput = rawInput.trim().split("\n");

  // Parse the first line as the total count of elements (though not directly used in logic).
  const totalCount = parseInt(rawInput[0], 10);

  // Parse the second line, split by space, convert to numbers, and sort in ascending order.
  const numericValues = rawInput[1]
    .split(" ")
    .map((val) => parseInt(val, 10))
    .sort((valA, valB) => valA - valB);

  // Initialize an array to store numbers that appear consecutively (pairs).
  let repeatedNumbers = [];

  // Iterate through the sorted array to find adjacent identical numbers.
  for (let currentIdx in numericValues) {
    // Check if the current number is the same as the next number.
    if (numericValues[currentIdx] === numericValues[parseInt(currentIdx, 10) + 1]) {
      // If they are the same, add the number to our list of repeated numbers.
      repeatedNumbers.push(numericValues[currentIdx]);
    }
  }

  // Sort the found repeated numbers in descending order.
  repeatedNumbers.sort((valA, valB) => valB - valA);

  // Create a Set to get unique values from the repeated numbers array.
  const uniqueRepeats = new Set(repeatedNumbers);

  // Convert the Set back to an array to easily access elements by index.
  const distinctRepeatsArray = [...uniqueRepeats];

  // If there is only one unique repeated number, print its square.
  if (distinctRepeatsArray.length === 1) {
    console.log(distinctRepeatsArray[0] * distinctRepeatsArray[0]);
    return; // Exit the function after printing.
  }

  // If there are multiple unique repeated numbers, or none:
  // If there are any repeated numbers found, print the product of the two largest unique ones.
  // Otherwise (if repeatedNumbers is empty), print 0.
  console.log(
    repeatedNumbers.length ? distinctRepeatsArray[0] * distinctRepeatsArray[1] : 0
  );
};

// Read input from standard input and pass it to the processing function.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
