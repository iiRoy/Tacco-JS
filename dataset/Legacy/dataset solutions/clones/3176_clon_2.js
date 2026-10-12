function computeMinPenalty(currentIdx, totalItems, targetLengths, currentLengths, itemLengths) {
  // Base case: If all items have been processed, calculate the penalty
  // based on the absolute differences between current and target lengths.
  if (currentIdx === totalItems) {
    return Math.abs(targetLengths[0] - currentLengths[0]) +
           Math.abs(targetLengths[1] - currentLengths[1]) +
           Math.abs(targetLengths[2] - currentLengths[2]);
  }

  // Recursive calls for different options:

  // Option 1: Skip the current item.
  // No change to currentLengths, no penalty added.
  const optionOne = computeMinPenalty(currentIdx + 1, totalItems, targetLengths, currentLengths, itemLengths);

  // Option 2: Add the current item's length to the first target length.
  // A penalty of 10 is incurred for using the item.
  const optionTwo = computeMinPenalty(
    currentIdx + 1,
    totalItems,
    targetLengths,
    [currentLengths[0] + itemLengths[currentIdx], currentLengths[1], currentLengths[2]],
    itemLengths
  ) + 10;

  // Option 3: Add the current item's length to the second target length.
  // A penalty of 10 is incurred.
  const optionThree = computeMinPenalty(
    currentIdx + 1,
    totalItems,
    targetLengths,
    [currentLengths[0], currentLengths[1] + itemLengths[currentIdx], currentLengths[2]],
    itemLengths
  ) + 10;

  // Option 4: Add the current item's length to the third target length.
  // A penalty of 10 is incurred.
  const optionFour = computeMinPenalty(
    currentIdx + 1,
    totalItems,
    targetLengths,
    [currentLengths[0], currentLengths[1], currentLengths[2] + itemLengths[currentIdx]],
    itemLengths
  ) + 10;

  // Return the minimum penalty found among all these options.
  return Math.min(optionOne, optionTwo, optionThree, optionFour);
}

// Main function to handle input parsing and initiate the calculation.
function processInput(inputData) {
  // Split the raw input string into an array of lines.
  const inputLines = inputData.split('\n');

  // Parse the first line to extract N, A, B, and C.
  const firstLineValues = inputLines[0].split(' ').map(val => parseInt(val, 10));
  const totalItems = firstLineValues[0];
  const targetA = firstLineValues[1];
  const targetB = firstLineValues[2];
  const targetC = firstLineValues[3];

  // Parse the remaining lines to get the individual bamboo segment lengths.
  // Note: The first element of inputLines (N A B C) is also mapped,
  // but will be removed shortly.
  let lengthSegments = inputLines.map(val => parseInt(val, 10));
  // Remove the first element, which corresponds to the N A B C line,
  // leaving only the actual segment lengths.
  lengthSegments.shift();

  // Call the recursive function to calculate the minimum penalty.
  // Initial state: start at index 0, with target lengths [A,B,C],
  // and current combined lengths initialized to [0,0,0].
  const finalScore = computeMinPenalty(0, totalItems, [targetA, targetB, targetC], [0, 0, 0], lengthSegments);

  // Output the final result, subtracting 30 as per problem specification.
  console.log(finalScore - 30);
}

// Read input from standard input and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
