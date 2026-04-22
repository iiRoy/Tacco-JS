/*
 *  This particular routine is designed to
 *  process a specific structured dataset.
 *  @param {Array<Array<number>>} incomingData -- The dataset to be processed, expected as a 2D array of numbers.
 */
function ProcessData(incomingData)
{
  // Extract the primary iteration count from the first data row.
  const  numCycles  =  incomingData[0][1] ;

  // Retrieve and sort the main list of numerical values in descending order.
  const orderedNumbers = incomingData[1].sort((firstElement, secondElement) => secondElement - firstElement);

  // Initialize a dynamic collection of potential sums/combinations.
  // Each original number 'n' starts as a single-element array containing 'n * 2'.
  const candidateCombinations = orderedNumbers.map((singleNumber) => [singleNumber * 2]);

  var finalSum = 0; // Accumulator for the ultimate result.
  var cycleCounter, setIterator, itemIterator, currentCombination, delayedSum = null, bestSetIndex, bestItemIndex, highestValue, tempValue;

  // Begin the main iterative process as determined by numCycles.
  for (cycleCounter = 0; cycleCounter < numCycles; cycleCounter++) {
    // If a value was "carried over" from the previous cycle, add it now.
    if (delayedSum) {
      finalSum += delayedSum;
      delayedSum = null; // Reset the carried value.
      continue;          // Skip remaining logic for this cycle.
    }

    bestSetIndex  = 0;
    // Determine the initial maximum value by examining the first combination set.
    var bestItemIndex = candidateCombinations[bestSetIndex].length - 1;
    var highestValue  = candidateCombinations[bestSetIndex][bestItemIndex];

    // This loop is designed to find the largest value among the currently available combinations.
    // Note: Due to the initial structure of 'candidateCombinations', this loop may not execute.
    for (setIterator = 1; setIterator < candidateCombinations[0].length - 1; setIterator++) {
      currentCombination = candidateCombinations[setIterator];
      itemIterator = currentCombination.length - 1;
      tempValue = currentCombination[itemIterator];

      // Update if a larger value is found.
      if (tempValue > highestValue) {
        bestSetIndex  = setIterator;
        bestItemIndex = itemIterator;
        highestValue  = tempValue;
      }
    }

    finalSum += highestValue; // Add the determined highest value to the total sum.

    // If the chosen highest value wasn't the initial element of its combination set,
    // it implies a special condition, possibly requiring a delayed re-addition.
    if (bestItemIndex > 0) {
      delayedSum = highestValue; // Store this value to be added again in the next cycle.
    }

    // Generate and append a new combination to the set from which the highest value was drawn.
    // This new combination is based on elements from the original sorted list.
    candidateCombinations[bestSetIndex].push(
      orderedNumbers[bestItemIndex + 1]
        ? (orderedNumbers[bestSetIndex] + orderedNumbers[bestSetIndex + bestItemIndex + 1])
        : 0
    );
  }

  // Output the final computed sum to the console.
  console.log(finalSum);
}

// Execute the data processing routine.
// Reads input from standard input, parses it, and then passes it to the main function.
ProcessData(
  require("fs").readFileSync("/dev/stdin", "utf8")
    .trim()
    .split('\n')
    .map(
      (dataLine) => dataLine.split(' ').map(Number)
    )
);