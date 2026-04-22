"use strict"; // Enforce strict parsing and error handling for robust code execution

// This is the core function designed to process an incoming textual argument.
const primaryProcessor = (rawInputData) => {
  // First, determine the total number of characters within the provided raw input.
  const charCount = rawInputData.toString().length;

  // Convert the cleaned input string into an integer for numerical operations.
  let parsedNumericValue = parseInt(rawInputData.trim());

  // Initialize a dynamic scaling factor, crucial for extracting individual digits.
  let scalingFactor = Math.pow(10, charCount - 1);
  // Prepare an array to sequentially store each extracted numerical component.
  let individualDigits = [];

  // Iterate through each character position to decompose the number into its constituent digits.
  for (let iterationIndex = 0; iterationIndex < charCount; iterationIndex++) {
    // Extract the most significant digit and append it to our collection.
    individualDigits.push(Math.floor(parsedNumericValue / scalingFactor));
    // Update the remaining numeric value by removing the digit just processed.
    parsedNumericValue = parsedNumericValue % scalingFactor;
    // Adjust the scaling factor downwards for the extraction of the next digit.
    scalingFactor /= 10;
  }

  // Compute the total sum of all the individual digits that were extracted.
  let computedSum = individualDigits.reduce((runningTotal, currentDigit) => runningTotal + currentDigit);

  // Apply a specific conditional re-evaluation if the initial sum is a single unit.
  if (computedSum === 1) {
    computedSum = 10;
  }

  // Display the final, processed numerical result to the standard output.
  console.log(computedSum);
};

// Initiate the processing by reading the content from standard input and passing it to our main function.
primaryProcessor(require('fs').readFileSync('/dev/stdin', 'utf8'));