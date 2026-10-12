"use strict";

// This function processes the raw input string to determine a specific product.
const processInput = (inputContent) => {
  // First, we clean the input by removing leading/trailing whitespace
  // and then splitting it into individual lines.
  inputContent = inputContent.trim().split("\n");

  // The first line of input typically contains a count, though it's not
  // directly used in the subsequent calculation for this particular problem.
  const firstLineValue = parseInt(inputContent[0], 10); // Parse as base-10 integer.

  // The second line contains space-separated numbers. We parse these,
  // convert them to integers, and then sort them in ascending order.
  const sortedNumericData = inputContent[1]
    .split(" ") // Split the string by spaces into an array of number-strings.
    .map((strNum) => parseInt(strNum, 10)) // Convert each string to an integer.
    .sort((valOne, valTwo) => valOne - valTwo); // Sort the numbers numerically.

  // An array to store numbers that appear consecutively, indicating a pair.
  let identifiedPairs = [];

  // We iterate through the sorted numeric data to find adjacent identical values.
  for (let currentIdx in sortedNumericData) {
    // Convert the string index from 'for...in' to a numeric type for arithmetic.
    const numericIndex = Number(currentIdx);

    // Check if the current number is the same as the next number in the sequence.
    if (sortedNumericData[numericIndex] === sortedNumericData[numericIndex + 1]) {
      // If they are identical, it means we've found a pair, so we add this number to our list.
      identifiedPairs.push(sortedNumericData[numericIndex]);
    }
  }

  // After finding all pairs, we sort them in descending order.
  // This makes it easy to pick the largest values later.
  identifiedPairs.sort((valOne, valTwo) => valTwo - valOne);

  // To ensure we only consider distinct numbers for the final product,
  // we create a Set from our identified pairs.
  const uniqueIdentifiedPairs = new Set(identifiedPairs);

  // Finally, we output the result.
  // If there are at least two unique numbers that formed pairs,
  // we multiply the two largest distinct ones. Otherwise, the result is zero.
  console.log(
    identifiedPairs.length // Check if any pairs were found at all.
      ? [...uniqueIdentifiedPairs][0] * [...uniqueIdentifiedPairs][1] // Product of the two largest distinct numbers.
      : 0 // If fewer than two distinct pairs, the result is 0.
  );
};

// Read the entire content from standard input (usually a file in competitive programming)
// and then pass it to our processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
