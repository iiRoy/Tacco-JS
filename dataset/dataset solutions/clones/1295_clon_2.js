'use strict';

const processInput = rawData => {
  // Normalize the incoming text data by removing leading/trailing whitespace
  // and splitting it into an array of individual lines.
  var parsedLines = rawData.trim().split("\n");

  // Locate the specific line that signals the end of valid problem statements.
  const terminatorPosition = parsedLines.indexOf("0 0");

  // Extract only the relevant problem statements, excluding the terminator.
  const problemStatements = parsedLines.slice(0, terminatorPosition);

  // Initialize an array to store the counts of valid combinations for each problem.
  // The array is pre-filled with zeros, one for each problem statement.
  const solutionCounts = [...Array(problemStatements.length)].map(_ => (0));

  /**
   * Recursively searches for combinations of numbers that sum up to a target value.
   * This function explores possible number sequences starting from a given base.
   * @param {number[]} currentCombination - The sequence of numbers built so far.
   * @param {number} upperBound - The maximum allowed number in the combination.
   * @param {number} desiredSum - The target sum to achieve.
   * @param {number} statementIndex - The index of the current problem statement
   *                                  in the original list, used to update results.
   * @returns {void}
   */
  const findCombinations = (currentCombination, upperBound, desiredSum, statementIndex) => {
    // If the current combination already has 3 or more elements, we stop exploring this path.
    // This is a specific constraint of the problem.
    if (currentCombination.length >= 3) {
      return;
    }

    // Iterate through possible next numbers, starting from one greater than the last
    // number in the current combination, up to the overall upper bound.
    for (var currentValue = currentCombination[currentCombination.length - 1] + 1; currentValue <= upperBound; currentValue++) {
      // Create a new combination by extending the current one with the new number.
      const extendedCombination = [...currentCombination];
      extendedCombination.push(currentValue);

      // Calculate the sum of numbers in the extended combination.
      const currentSum = extendedCombination.reduce((accumulator, currentElement) => accumulator + currentElement);

      // A safety break: if the combination becomes excessively long, something might be wrong
      // or we're exploring an unfeasible path.
      if (100 < extendedCombination.length) {
        break;
      }

      // Check if the current combination sums up to the desired target.
      if (currentSum === desiredSum) {
        // If it matches the target, ensure it meets the minimum length requirement.
        if (extendedCombination.length < 3) {
          break; // If too short, this path is invalid, so break.
        }
        // Increment the counter for this specific problem statement.
        // Previous console logging for debugging was located here.
        solutionCounts[statementIndex]++;
      }

      // If the current sum is less than the desired sum, continue exploring
      // by making a recursive call with the extended combination.
      if (currentSum < desiredSum) {
        findCombinations(extendedCombination, upperBound, desiredSum, statementIndex);
      } else {
        // If the current sum already exceeds the desired sum,
        // then adding more positive numbers will only increase it further.
        // Therefore, this path cannot lead to a solution, so we break.
        break;
      }
    }
  };

  // Process each problem statement individually.
  problemStatements.forEach((problemString, problemIdx) => {
    // Parse the numbers from the current problem string.
    const parsedNumbers = problemString.split(" ").map(numberString => parseInt(numberString, 10));

    // Extract the upper limit (n) and the target value (x) for this problem.
    const upperLimit = parsedNumbers[0];
    const targetValue = parsedNumbers[1];

    // Initiate the search for combinations. For each possible starting number
    // from 1 up to the upper limit, begin a new combination sequence.
    for (var startingPoint = 1; startingPoint <= upperLimit; startingPoint++) {
      findCombinations([startingPoint], upperLimit, targetValue, problemIdx);
    }
  });

  // Output the final counts of valid combinations, each on a new line.
  console.log(solutionCounts.join("\n"));
};

// Read the input from standard input (typically a file or pipe)
// and pass it to the main processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));