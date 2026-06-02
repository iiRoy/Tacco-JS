'use strict';

/**
 * Computes the probability of having at least (N/2 + 1) successes
 * given N trials and an array of individual success probabilities.
 * This uses dynamic programming to calculate probabilities of exactly
 * 'j' successes in 'i' trials.
 *
 * @param {number} numElements - The total number of trials (N).
 * @param {number[]} probabilities - An array of probabilities P[0]...P[N-1] for each trial.
 * @returns {number} The cumulative probability of having more than N/2 successes.
 */
function calculateProbability(numElements, probabilities) {
  // Initialize a 2D array (DP table) to store probabilities.
  // dynamicProgrammingTable[i][j] will store the probability of getting exactly 'j' successes in 'i' trials.
  // The table size is (numElements + 1) x (numElements + 1).
  const dynamicProgrammingTable = new Array(numElements + 1)
    .fill(0)
    .map(() => new Array(numElements + 1).fill(0));

  // Populate the dynamic programming table.
  // Iterate through each trial count from 0 to numElements.
  for (let rowIdx = 0; rowIdx <= numElements; rowIdx++) {
    // Iterate through each possible number of successes from 0 to rowIdx.
    for (let colIdx = 0; colIdx <= numElements; colIdx++) {
      // Base case: 0 trials, 0 successes. Probability is 1 (certainty).
      if (rowIdx === 0 && colIdx === 0) {
        dynamicProgrammingTable[rowIdx][colIdx] = 1;
        continue; // Move to the next iteration.
      }

      // If the number of successes (colIdx) is greater than the number of trials (rowIdx),
      // this state is impossible, so probability is 0.
      if (colIdx > rowIdx) {
        dynamicProgrammingTable[rowIdx][colIdx] = 0;
      }
      // If the number of successes equals the number of trials,
      // all previous trials must have been successes.
      else if (colIdx === rowIdx) {
        // The probability is the probability of the current trial being a success
        // multiplied by the probability of (colIdx-1) successes in (rowIdx-1) trials.
        dynamicProgrammingTable[rowIdx][colIdx] = probabilities[rowIdx - 1] * dynamicProgrammingTable[rowIdx - 1][colIdx - 1];
      }
      // If the number of successes is less than the number of trials.
      else {
        // Case: 0 successes in 'rowIdx' trials.
        // This means the current trial must be a failure, and there were 0 successes in (rowIdx-1) trials.
        if (colIdx === 0) {
          dynamicProgrammingTable[rowIdx][colIdx] = (1 - probabilities[rowIdx - 1]) * dynamicProgrammingTable[rowIdx - 1][colIdx];
        }
        // General case: 'colIdx' successes in 'rowIdx' trials.
        // This can happen in two ways:
        // 1. Current trial is a success: P[rowIdx-1] * (colIdx-1 successes in rowIdx-1 trials)
        // 2. Current trial is a failure: (1-P[rowIdx-1]) * (colIdx successes in rowIdx-1 trials)
        else {
          dynamicProgrammingTable[rowIdx][colIdx] =
            probabilities[rowIdx - 1] * dynamicProgrammingTable[rowIdx - 1][colIdx - 1] +
            (1 - probabilities[rowIdx - 1]) * dynamicProgrammingTable[rowIdx - 1][colIdx];
        }
      }
    }
  }

  // Calculate the sum of probabilities for having more than N/2 successes.
  // The problem asks for N/2 + 1 or more successes.
  const startColumnIndex = Math.floor(numElements / 2) + 1;
  let finalResult = 0.0; // Use float for precision.

  // Sum probabilities from startColumnIndex up to numElements for the last row (N trials).
  for (let currentColumn = startColumnIndex; currentColumn <= numElements; currentColumn++) {
    finalResult += dynamicProgrammingTable[numElements][currentColumn];
  }

  return finalResult;
}

/**
 * Reads input from stdin, parses it, calls the main calculation function,
 * and prints the result to stdout.
 *
 * @param {string} rawData - The raw input string from stdin.
 */
function processInput(rawData) {
  // Split the input string into individual lines.
  const inputLines = rawData.split('\n');

  // Parse the first line to get the number of elements (N).
  const numElements = parseInt(inputLines[0], 10); // Specify radix for safety.

  // Parse the second line to get the array of probabilities (P).
  // Each probability is a space-separated float.
  const probabilities = inputLines[1].split(' ').map(probString => parseFloat(probString));

  // Call the core logic function to get the answer.
  const solution = calculateProbability(numElements, probabilities);

  // Output the computed result to the console.
  console.log(solution);
}

// Read the entire input from standard input and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
