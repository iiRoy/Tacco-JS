function computeMagicPoints(currentLevel, totalItems, targetValues, currentSums, itemLengths) {
  // Base case: if we have processed all items
  if (currentLevel === totalItems) {
    // Check if all current sums are positive
    if (Math.min(...currentSums) > 0) {
      // Calculate magic points based on absolute differences and a penalty
      const magicPoints = Math.abs(targetValues[0] - currentSums[0]) +
                          Math.abs(targetValues[1] - currentSums[1]) +
                          Math.abs(targetValues[2] - currentSums[2]) - 30;
      return magicPoints;
    } else {
      // Return a very large number if any sum is not positive (invalid state)
      const largeNumber = 1000 * 1000;
      return largeNumber * largeNumber * largeNumber; // A sufficiently large value
    }
  }

  // Recursive calls for different options at the current level

  // Option 0: Do not use the current item (itemLengths[currentLevel])
  const resultOptionA = computeMagicPoints(currentLevel + 1, totalItems, targetValues, currentSums, itemLengths);

  // Option 1: Add current item to the first sum (currentSums[0])
  var resultOptionB = computeMagicPoints(currentLevel + 1, totalItems, targetValues,
                                         [currentSums[0] + itemLengths[currentLevel], currentSums[1], currentSums[2]],
                                         itemLengths) + 10; // Cost for using an item

  // Option 2: Add current item to the second sum (currentSums[1])
  var resultOptionC = computeMagicPoints(currentLevel + 1, totalItems, targetValues,
                                         [currentSums[0], currentSums[1] + itemLengths[currentLevel], currentSums[2]],
                                         itemLengths) + 10; // Cost for using an item

  // Option 3: Add current item to the third sum (currentSums[2])
  var resultOptionD = computeMagicPoints(currentLevel + 1, totalItems, targetValues,
                                         [currentSums[0], currentSums[1], currentSums[2] + itemLengths[currentLevel]],
                                         itemLengths) + 10; // Cost for using an item

  // Return the minimum magic points among all possible options
  return Math.min(resultOptionA, resultOptionB, resultOptionC, resultOptionD);
}

// Main function to process input and orchestrate the calculation
function processInput(rawData) {
  // Split the raw input into individual lines
  const inputLines = rawData.split('\n');

  // Parse the first line for N, A, B, C
  const firstLineParts = inputLines[0].split(' ').map(x => parseInt(x));
  const totalItems = firstLineParts[0];
  const targetA = firstLineParts[1];
  const targetB = firstLineParts[2];
  const targetC = firstLineParts[3];

  // Parse the remaining lines for item lengths
  var lengthList = inputLines.map(x => parseInt(x));
  lengthList.shift(); // Remove the first element (which was the N,A,B,C line parsed as NaN)

  // Call the recursive function to find the minimum magic points
  const finalScore = computeMagicPoints(0, totalItems, [targetA, targetB, targetC], [0, 0, 0], lengthList);

  // Output the final result to the console
  console.log(finalScore);
}

// Read input from stdin and pass it to the main processing function
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
