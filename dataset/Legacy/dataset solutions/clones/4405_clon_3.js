"use strict";

const parseAndSortNumbers = (inputLine) => {
  return inputLine.split(" ").map(strValue => parseInt(strValue, 10)).sort((a, b) => a - b);
};

const processInputData = (rawInputString) => {
  const inputLines = rawInputString.trim().split("\n");
  // The first line (N) is parsed in the original but never used.
  // const numberOfElements = parseInt(inputLines[0], 10);
  
  const sortedNumericArray = parseAndSortNumbers(inputLines[1]);

  let foundDuplicateValues = [];

  // Iterate through the sorted array to identify adjacent identical numbers.
  // Changed 'for...in' to a standard 'for' loop for explicit index control.
  for (let currentIndex = 0; currentIndex < sortedNumericArray.length - 1; ++currentIndex) {
    const currentElement = sortedNumericArray[currentIndex];
    const nextElement = sortedNumericArray[currentIndex + 1];

    if (currentElement === nextElement) {
      foundDuplicateValues.push(currentElement);
    }
  }

  // Sort the collected duplicate values in descending order.
  foundDuplicateValues.sort((val1, val2) => val2 - val1);

  // Extract unique values from the sorted duplicates.
  const uniqueSortedDuplicates = new Set(foundDuplicateValues);
  const uniqueSortedDuplicatesArray = Array.from(uniqueSortedDuplicates); // Using Array.from for variety

  let calculatedProduct = 0; // Initialize the result variable

  const countOfUniqueDuplicates = uniqueSortedDuplicatesArray.length;

  // Determine the final product based on the number of unique duplicate values found.
  if (countOfUniqueDuplicates === 0) {
    calculatedProduct = 0; // No duplicates, so product is 0.
  } else if (countOfUniqueDuplicates === 1) {
    const singleUniqueDuplicate = uniqueSortedDuplicatesArray[0];
    calculatedProduct = singleUniqueDuplicate * singleUniqueDuplicate;
  } else {
    // If there are at least two unique duplicates, multiply the two largest.
    const largestUniqueDuplicate = uniqueSortedDuplicatesArray[0];
    const secondLargestUniqueDuplicate = uniqueSortedDuplicatesArray[1];
    calculatedProduct = largestUniqueDuplicate * secondLargestUniqueDuplicate;
  }

  console.log(calculatedProduct);
};

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
