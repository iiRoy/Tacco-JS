/*
 * This JavaScript module provides functions for processing input data
 * to calculate common subsequences using dynamic programming,
 * and includes a helper for browser-based testing.
 */

// Main function to compute the number of common subsequences between two integer sequences.
// It takes a string of raw input, parses it, performs calculations, and prints the result.
function ProcessInput(sourceDataString) {
  // Divide the entire input string into an array of lines.
  sourceDataString = sourceDataString.split("\n");

  // Extract the first sequence's length from the initial line.
  let firstSequenceLength = Number.parseInt(sourceDataString[0].split(" ")[0]);
  // Extract the second sequence's length from the initial line.
  let secondSequenceLength = Number.parseInt(sourceDataString[0].split(" ")[1]);

  // Convert the second line of input into an array of integers representing the first sequence.
  let sequenceOne = sourceDataString[1].split(" ").map(entry => Number.parseInt(entry));
  // Convert the third line of input into an array of integers representing the second sequence.
  let sequenceTwo = sourceDataString[2].split(" ").map(entry => Number.parseInt(entry));

  // Define a large prime number to use as a modulus for all arithmetic operations,
  // preventing integer overflow in calculations.
  const largePrimeModulus = Math.pow(10, 9) + 7;

  // Initialize a 2D array, often referred to as a dynamic programming table (DP table).
  // Its dimensions are (firstSequenceLength + 1) by (secondSequenceLength + 1).
  let dpCalculationTable = new Array(firstSequenceLength + 1).fill(null);

  // Set up the base cases for the DP table.
  // The first row and column represent the number of common subsequences with an empty prefix.
  for (let currentTableRows = 0; currentTableRows < firstSequenceLength + 1; currentTableRows++) {
    let temporaryRowContainer; // A temporary array to construct each row.

    // For the very first row (representing an empty first sequence),
    // fill it with 1s, indicating one way to form an empty common subsequence.
    if (currentTableRows === 0) {
      temporaryRowContainer = new Array(secondSequenceLength + 1).fill(1);
    } else {
      // For all other rows, initialize with 0s.
      temporaryRowContainer = new Array(secondSequenceLength + 1).fill(0);
    }
    // Explicitly set the first element of each row to 1,
    // as there's always one way to form an empty common subsequence.
    temporaryRowContainer[0] = 1;
    // Assign the completed row to its position in the main DP table.
    dpCalculationTable[currentTableRows] = temporaryRowContainer;
  }

  // Populate the DP table using nested loops, iterating through both sequences.
  // This calculates the number of common subsequences for all prefixes.
  for (let i_index = 0; i_index < firstSequenceLength; i_index++) {
    for (let j_index = 0; j_index < secondSequenceLength; j_index++) {
      // If the current elements from both sequences match,
      // the number of common subsequences at this position is the sum of:
      // 1. Common subsequences when ignoring the current element of `sequenceOne`.
      // 2. Common subsequences when ignoring the current element of `sequenceTwo`.
      // This implicitly counts subsequences ending with the current matching pair.
      if (sequenceOne[i_index] === sequenceTwo[j_index]) {
        dpCalculationTable[i_index + 1][j_index + 1] = (dpCalculationTable[i_index][j_index + 1] + dpCalculationTable[i_index + 1][j_index]) % largePrimeModulus;
      } else {
        // If the current elements do not match, the number of common subsequences is derived from:
        // (Common subsequences ignoring current `sequenceOne` element)
        // + (Common subsequences ignoring current `sequenceTwo` element)
        // - (Common subsequences ignoring both current elements, to correct for double-counting).
        // The `+ largePrimeModulus` ensures the result is always non-negative before the final modulo.
        dpCalculationTable[i_index + 1][j_index + 1] = (dpCalculationTable[i_index][j_index + 1] + dpCalculationTable[i_index + 1][j_index] - dpCalculationTable[i_index][j_index] + largePrimeModulus) % largePrimeModulus;
      }
    }
  }

  // The final answer, representing the total number of common subsequences
  // for the full sequences, is located at the bottom-right corner of the DP table.
  let finalComputedAnswer = dpCalculationTable[firstSequenceLength][secondSequenceLength];

  // Print the calculated result to the standard output.
  console.log('%s', finalComputedAnswer);
  // Return the computed value for potential further use.
  return finalComputedAnswer;
}

// Auxiliary function designed for browser-based testing and verification.
// It retrieves input from HTML elements, processes it, and displays a status.
function VerifyOutput(caseNumberIdentifier) {
  // Fetch the input string from an HTML element identified by its ID.
  let currentTestInputString = document.getElementById("input" + caseNumberIdentifier).value;
  // Invoke the main processing function with the obtained input.
  let resultFromProcessing = ProcessInput(currentTestInputString);

  // Initialize the test case status as "Wrong Answer".
  let testCaseEvaluation = "WA";
  // Compare the computed result with the expected output, also retrieved from an HTML element.
  if (resultFromProcessing == document.getElementById("output" + caseNumberIdentifier).value.split("\n")[0]) {
    // If the computed result matches the expected output, set the status to "Accepted".
    testCaseEvaluation = "AC";
  }

  // Update the inner HTML of the result element to show the evaluation status.
  document.getElementById("result" + caseNumberIdentifier).innerHTML = testCaseEvaluation;
}

// This line serves as the entry point for execution in a Node.js environment,
// typically used in competitive programming platforms.
// It reads all input from standard input (/dev/stdin) and passes it to the `ProcessInput` function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));