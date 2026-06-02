'use strict';

/**
 * Processes the raw input string to calculate and output a sorted list of sums.
 * @param {string} rawInputString - The raw input data as a single string.
 */
function processData(rawInputString) {
  // Step 1: Initial parsing of the input string
  const trimmedLines = rawInputString.trim();
  let linesArray = trimmedLines.split('\n');

  // Step 2: Extract configuration values (counts for dimensions and slice limit)
  const configValuesString = linesArray.shift();
  const dimensionConfig = configValuesString.split(' ').map(str => parseInt(str, 10));

  // Step 3: Parse remaining lines into arrays of numbers (as strings initially)
  const dataSets = linesArray.map(currentLine => currentLine.split(' '));

  // Step 4: Sort each data set in descending order (as numbers)
  dataSets.forEach(stringItems => {
    stringItems.sort((elementA, elementB) => {
      const numA = parseInt(elementA, 10);
      const numB = parseInt(elementB, 10);
      return numB - numA; // Descending order
    });
  });

  let computedSums = []; // Array to store the calculated sums

  // Extract loop bounds and product limit for clarity
  const limitA = dimensionConfig[0];
  const limitB = dimensionConfig[1];
  const limitC = dimensionConfig[2];
  const productThreshold = 3000;

  // Step 5: Iterate through combinations and calculate sums
  for (let indexA = 0; indexA < limitA; indexA++) {
    const valueA = parseInt(dataSets[0][indexA], 10); // Get value from first set
    const factorA = indexA + 1; // (i + 1)

    for (let indexB = 0; indexB < limitB; indexB++) {
      const valueB = parseInt(dataSets[1][indexB], 10); // Get value from second set
      const factorB = indexB + 1; // (j + 1)

      for (let indexC = 0; indexC < limitC; indexC++) {
        const valueC = parseInt(dataSets[2][indexC], 10); // Get value from third set
        const factorC = indexC + 1; // (k + 1)

        // Check the product condition
        const currentProduct = factorA * factorB * factorC;
        if (currentProduct <= productThreshold) {
          const currentSum = valueA + valueB + valueC;
          computedSums.push(currentSum);
        } else {
          // If the product exceeds the threshold, further increments of indexC
          // will also exceed it (since factors are increasing).
          // So, we can break from this innermost loop.
          break;
        }
      }
    }
  }

  // Step 6: Sort the computed sums in descending order
  computedSums.sort((elementA, elementB) => elementB - elementA);

  // Step 7: Slice the array to keep only the top N sums
  const numberOfResultsToKeep = dimensionConfig[3];
  const finalResults = computedSums.slice(0, numberOfResultsToKeep);

  // Step 8: Output the final results, each on a new line
  console.log(finalResults.join('\n'));
}

// Entry point for execution, reading from standard input
processData(require('fs').readFileSync('/dev/stdin', 'utf8'));
