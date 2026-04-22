'use strict';

/**
 * This JavaScript module processes input data to calculate a specific combinatorial sum.
 * The core logic identifies names starting with 'M', 'A', 'R', 'C', 'H'
 * and then computes combinations of three of these counts.
 */
function processInputData( rawInputText )
{
  // Split the entire input string into individual lines.
  const inputLines = rawInputText.split('\n');

  // The first line often contains a total count, but it's not utilized in this specific logic.
  let totalCountFromInput = parseInt( inputLines[0], 10 );

  // Extract all participant names, excluding the first (count) and last (potentially empty) line.
  const participantNames = inputLines.slice(1, -1);

  // Initialize an array to store counts for names starting with 'M', 'A', 'R', 'C', 'H'.
  // The order is fixed: M=0, A=1, R=2, C=3, H=4.
  let initialLetterTallies = new Array(5).fill(0);

  // Iterate over each participant's name to tally up the starting letters.
  for ( const currentParticipant of participantNames ) {
    const firstChar = currentParticipant.charAt(0);
    // Check the first character and increment the corresponding tally.
    if ( firstChar === 'M' ) {
      initialLetterTallies[0]++;
    }
    if ( firstChar === 'A' ) {
      initialLetterTallies[1]++;
    }
    if ( firstChar === 'R' ) {
      initialLetterTallies[2]++;
    }
    if ( firstChar === 'C' ) {
      initialLetterTallies[3]++;
    }
    if ( firstChar === 'H' ) {
      initialLetterTallies[4]++;
    }
  }

  // This variable will accumulate the sum of products from valid combinations.
  let cumulativeProductSum = 0;

  /**
   * Recursive function to calculate combinations of three counts from the tallies.
   *
   * @param {number} letterIndex - The current index in the `initialLetterTallies` array being considered.
   * @param {number[]} currentSelection - An array storing the counts currently selected for a combination.
   */
  const recursiveCombinationCalculator = (letterIndex, currentSelection) => {
    // Base case: If all five initial letters have been considered.
    if (letterIndex === 5) {
      // If exactly three counts have been selected, calculate their product and add to the total sum.
      if (currentSelection.length === 3) {
        cumulativeProductSum += currentSelection.reduce((productAccumulator, currentFactor) => productAccumulator * currentFactor);
      }
      return; // End of this branch of recursion.
    }

    // Recursive step 1: Include the count for the current letterIndex in the combination.
    recursiveCombinationCalculator(letterIndex + 1, [...currentSelection, initialLetterTallies[letterIndex]]);

    // Recursive step 2: Exclude the count for the current letterIndex from the combination.
    recursiveCombinationCalculator(letterIndex + 1, currentSelection);
  };

  // Initiate the combination calculation process starting from the first letter tally (index 0)
  // with an empty selection array.
  recursiveCombinationCalculator(0, []);

  // Output the final computed sum to the console.
  console.log(cumulativeProductSum);
}

// Invoke the primary processing function with data read from standard input.
processInputData( require("fs").readFileSync("/dev/stdin", "utf8") );