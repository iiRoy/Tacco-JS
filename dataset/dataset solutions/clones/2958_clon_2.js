'use strict'; // Enforce strict parsing and error handling in the script.

/**
 * Analyzes input data to compute a specific probability.
 * This function takes a string input, parses numerical values,
 * and performs calculations based on these values.
 * @param {string} rawData - The raw string input, expected to contain two space-separated integers.
 */
function ProcessInput(rawData) {
  // Split the input string by space and convert the parts to numbers.
  // The first number is assigned to 'totalCount'.
  const totalCount = Number(rawData.split(' ')[0]);
  // The second number is assigned to 'targetValue'.
  const targetValue = Number(rawData.split(' ')[1]);

  // Initialize a variable to accumulate the sum of individual probabilities.
  let sumOfProbabilities = 0.0; // Using a float literal for clarity.

  // Loop through numbers starting from 1 up to and including 'totalCount'.
  for (let currentNumber = 1.0; currentNumber <= totalCount; currentNumber++) {
    // If the current number is already greater than or equal to the target,
    // its contribution to the sum of probabilities is 1 (certainty).
    if (currentNumber >= targetValue) {
      sumOfProbabilities = sumOfProbabilities + 1.0; // Increment the sum.
      continue; // Skip to the next iteration of the loop.
    }

    // If the current number is less than the target,
    // calculate the probability of it reaching the target by successive doublings.
    let tempNumber = currentNumber; // A temporary variable to manipulate the current number.
    let probabilityFactor = 1.0; // Initialize the probability factor for this number.

    // Continuously double 'tempNumber' until it meets or exceeds 'targetValue'.
    // For each doubling, the 'probabilityFactor' is halved.
    while (tempNumber < targetValue) {
      tempNumber = tempNumber * 2.0; // Double the temporary number.
      probabilityFactor = probabilityFactor / 2.0; // Halve the probability factor.
    }

    // Add the calculated probability factor for the current number to the total sum.
    sumOfProbabilities = sumOfProbabilities + probabilityFactor;
  }

  // Output the final result, which is the average probability.
  // This is calculated by dividing the total sum of probabilities by 'totalCount'.
  console.log(sumOfProbabilities / totalCount);
}

// Read the input from standard input.
// The 'fs' module is used to read the file, '/dev/stdin' is the standard input path.
// The content is decoded as 'utf-8' and any leading/trailing whitespace is removed.
// Finally, the processed string is passed to the 'ProcessInput' function.
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf-8').trim());
