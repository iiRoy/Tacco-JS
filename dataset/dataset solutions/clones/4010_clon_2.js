"use strict";

// This utility function is designed to produce all distinct combinations of a specified size
// from a given array of elements. It ensures that no element is repeated within a combination
// and that all generated combinations are unique.
const generateUniqueCombinations = (sourceElements, desiredLength) => {
  // Base case: If the target length is one, each individual element forms a combination.
  if (desiredLength === 1) {
    return sourceElements.map(singleElement => [singleElement]);
  }

  // Initialize an array to accumulate all the resulting combination sets.
  const outcomeCollections = [];

  // Iterate over each element in the provided collection.
  sourceElements.forEach((currentSelectionItem, currentPosition) => {
    // Recursively determine combinations of a reduced length from the subsequent elements.
    // The slice method is used to exclude elements already processed in the current path,
    // thereby ensuring combinations remain distinct and without internal repetitions.
    const nestedCollections = generateUniqueCombinations(
      sourceElements.slice(currentPosition + 1), // Only consider elements occurring after the present one
      desiredLength - 1                          // Reduce the required length by one unit
    );

    // For each smaller combination obtained from the recursion, prepend the current item
    // to construct a new, complete combination.
    nestedCollections.forEach((nestedCollection) => {
      outcomeCollections.push([currentSelectionItem].concat(nestedCollection));
    });
  });

  // Return the comprehensive list of all unique combinations.
  return outcomeCollections;
};


const executeMainLogic = (inputStringContent) => {
    // Prepare the raw input by removing leading/trailing whitespace and segmenting it into lines.
    inputStringContent = inputStringContent.trim().split('\n');

    // Extract the numerical value from the very first line, representing the total number of entries.
    const numEntries = parseInt(inputStringContent[0], 10);

    // Retrieve the actual names from the input lines, starting from the second line.
    // The 'splice' operation modifies the original array and returns the removed elements.
    const entityLabels = inputStringContent.splice(1, numEntries + 1);

    // Establish three arrays of predefined indices for subsequent calculations.
    // These arrays will map to positions within another tally array.
    const indexSetA = [0, 0, 0, 0, 0, 0, 1, 1, 1, 2];
    const indexSetB = [1, 1, 1, 2, 2, 3, 2, 2, 3, 3];
    const indexSetC = [2, 3, 4, 3, 4, 4, 3, 4, 4, 4];

    // Initialize an array to maintain counts for specific initial letters.
    // Indices 0 through 4 are designated for 'M', 'A', 'R', 'C', 'H' respectively.
    let letterTallies = [0, 0, 0, 0, 0];

    // Iterate over each label to tally the occurrences of its first character.
    for (const entryKey in entityLabels) {
        // Evaluate the initial character of the current label.
        if (entityLabels[entryKey][0] === 'M') {
            letterTallies[0]++; // Increment the counter for 'M'.
        }

        if (entityLabels[entryKey][0] === 'A') {
            letterTallies[1]++; // Increment the counter for 'A'.
        }

        if (entityLabels[entryKey][0] === 'R') {
            letterTallies[2]++; // Increment the counter for 'R'.
        }

        if (entityLabels[entryKey][0] === 'C') {
            letterTallies[3]++; // Increment the counter for 'C'.
        }

        if (entityLabels[entryKey][0] === 'H') {
            letterTallies[4]++; // Increment the counter for 'H'.
        }
    }

    // Set up a variable to store the final aggregated numerical output.
    let finalCalculatedSum = 0;

    // Execute a specific computational routine using the gathered tallies and index arrays.
    // This loop computes a sum of products based on the pre-defined index sets.
    for (let currentCalcIndex = 0; currentCalcIndex < 10; currentCalcIndex++) {
        finalCalculatedSum +=
            letterTallies[indexSetA[currentCalcIndex]] *
            letterTallies[indexSetB[currentCalcIndex]] *
            letterTallies[indexSetC[currentCalcIndex]];
    }

    // Display the ultimate computed sum to the standard output.
    console.log(finalCalculatedSum);
};

// Initiate the primary execution flow by reading data from the standard input stream.
executeMainLogic(require('fs').readFileSync('/dev/stdin', 'utf8'));