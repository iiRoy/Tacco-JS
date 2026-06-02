'use strict';

// This function processes the raw input data to solve a specific combinatorial problem.
const processInput = (rawData) => {
  // Trim whitespace and split the input into individual lines.
  let processedLines = rawData.trim().split('\n');

  // Find the line indicating the end of the problem sets.
  const terminationPoint = processedLines.indexOf('0 0');

  // Extract the actual problem sets, excluding the termination marker.
  const problemSets = processedLines.slice(0, terminationPoint);

  // Initialize an array to store the counts for each problem set.
  // It's pre-filled with zeros, matching the number of problem sets.
  const finalCounts = [...Array(problemSets.length)].map((_) => 0);

  /**
   * Recursive helper function to find combinations of numbers that sum to a target.
   * @param {number[]} currentCombination - The current array of numbers being built.
   * @param {number} upperBound - The maximum number allowed in a combination.
   * @param {number} desiredSum - The target sum to achieve.
   * @param {number} setIndex - The index of the current problem set in `finalCounts`.
   */
  const findCombinations = (currentCombination, upperBound, desiredSum, setIndex) => {
    // Base case: If the combination already has 3 or more elements, stop exploring this path.
    // This condition seems to be a constraint for the problem.
    if (currentCombination.length >= 3) {
      return;
    }

    // Iterate through numbers starting from the last number in the current combination plus one,
    // up to the maximum allowed number.
    for (let currentNumber = currentCombination[currentCombination.length - 1] + 1; currentNumber <= upperBound; currentNumber++) {
      // Create a new combination by extending the current one with the new number.
      const extendedCombination = [...currentCombination];
      extendedCombination.push(currentNumber);

      // Calculate the sum of the numbers in the extended combination.
      const currentSum = extendedCombination.reduce((accumulator, currentValue) => accumulator + currentValue);

      // Optimization: If the combination length exceeds 100, it's likely too long or an edge case,
      // so we break out of this inner loop.
      if (100 < extendedCombination.length) {
        break;
      }

      // If the current sum matches the desired sum:
      if (currentSum === desiredSum) {
        // Check if the combination has at least 3 elements. If not, it's not a valid solution.
        if (extendedCombination.length < 3) {
          break; // Stop exploring this path if it's too short.
        }
        // If it's a valid combination, increment the counter for the current problem set.
        finalCounts[setIndex]++;
      }

      // If the current sum is less than the desired sum, continue exploring recursively.
      if (currentSum < desiredSum) {
        findCombinations(extendedCombination, upperBound, desiredSum, setIndex);
      } else {
        // If the current sum exceeds the desired sum, any further additions will also exceed it,
        // so we can stop exploring this branch.
        break;
      }
    }
  };

  // Iterate over each problem set to find solutions.
  problemSets.forEach((dataSetLine, dataSetIndex) => {
    // Parse the line into two integers: N (maxValue) and X (targetValue).
    const parsedValues = dataSetLine.split(' ').map((numericString) => parseInt(numericString, 10));
    const maxValue = parsedValues[0];
    const targetValue = parsedValues[1];

    // Start the recursive search for combinations.
    // For each possible starting number from 1 up to maxValue:
    for (let startingNumber = 1; startingNumber <= maxValue; startingNumber++) {
      // Initiate the recursive combination search with the starting number.
      findCombinations([startingNumber], maxValue, targetValue, dataSetIndex);
    }
  });

  // Output the final counts, each on a new line.
  console.log(finalCounts.join('\n'));
};

// Read input from standard input and pass it to the main processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
