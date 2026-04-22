// This module handles processing a single numerical input to perform a specific calculation.
// It computes the sum of greatest common divisors for all possible triplets within a given range.

function executeCalculation(rawInputData) {

  // Helper function to ascertain the greatest common divisor among three integers.
  // This is a direct search method, iterating from 1 up to the smallest of the three numbers.
  const determineCommonFactor = (firstNum, secondNum, thirdNum) => {
    let largestFoundDivisor = 1; // The smallest possible common divisor is 1.

    // The maximum possible common divisor cannot exceed the smallest of the three numbers.
    const maximumSearchBound = Math.min(firstNum, secondNum, thirdNum);

    for (let currentCandidate = 1; currentCandidate <= maximumSearchBound; currentCandidate++) {
      // Check if the current candidate divides all three numbers without remainder.
      if (firstNum % currentCandidate === 0 && secondNum % currentCandidate === 0 && thirdNum % currentCandidate === 0) {
        largestFoundDivisor = currentCandidate; // Update if a larger common divisor is identified.
      }
    }
    return largestFoundDivisor;
  };

  // --- Input Data Handling Block ---

  // Validate the presence of input data.
  if (!rawInputData || rawInputData.trim().length === 0) {
    console.error("Processing halted: Input data is either missing or empty.");
    return; // Terminate execution if no valid input is provided.
  }

  const processedInputLines = rawInputData.split('\n');

  // Extract the upper limit value from the first line of input.
  const stringifiedLimit = processedInputLines[0];
  const numericalUpperLimit = Number(stringifiedLimit);

  // Perform validation on the parsed numerical upper limit.
  // It must be a finite number, not NaN, and at least 1.
  if (isNaN(numericalUpperLimit) || !Number.isFinite(numericalUpperLimit) || numericalUpperLimit < 1) {
    console.error(`Processing halted: Invalid or non-positive numerical limit received: '${stringifiedLimit}'.`);
    return; // Terminate if the upper limit is not valid.
  }

  // --- Primary Computational Logic ---

  let cumulativeSumOfGCDs = 0; // Accumulator for the final result.

  // Commence a triple-nested iteration to cover all combinations of (valA, valB, valC)
  // where each value ranges from 1 up to the specified numericalUpperLimit.
  for (let valA = 1; valA <= numericalUpperLimit; valA++) {
    for (let valB = 1; valB <= numericalUpperLimit; valB++) {
      for (let valC = 1; valC <= numericalUpperLimit; valC++) {
        // Calculate the greatest common divisor for the current triplet.
        const currentTripletGCD = determineCommonFactor(valA, valB, valC);
        // Add this computed GCD to the running total.
        cumulativeSumOfGCDs += currentTripletGCD;
      }
    }
  }

  // Display the final aggregated sum to standard output.
  console.log(cumulativeSumOfGCDs);
}

// --- Standard Input/Output Interface ---

// Acquire the necessary Node.js 'fs' module for file system operations.
const fileSystemModule = require("fs");
// Specify the standard input file path.
const stdinFilePath = "/dev/stdin";
// Define the character encoding for reading the file.
const inputEncoding = "utf8";

// Read the complete content from the standard input file synchronously.
const collectedInputContent = fileSystemModule.readFileSync(stdinFilePath, inputEncoding);

// Initiate the main calculation process with the obtained input.
executeCalculation(collectedInputContent);