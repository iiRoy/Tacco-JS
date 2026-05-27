function ProcessInput(rawData) {
  // This function processes the raw input string to calculate a final score.
  // The input is expected to contain numerical data across multiple lines.

  // Split the entire input string into an array of lines.
  rawData = rawData.split("\n");

  // Parse the first line to extract two key numerical parameters.
  var firstLineParts = rawData[0].split(" ");
  var numElements = firstLineParts[0] - 0; // Convert string to number
  var numIterations = firstLineParts[1] - 0; // Convert string to number

  // Parse the second line to get an array of integer values.
  var elementValues = rawData[1].split(" ").map(strVal => parseInt(strVal, 10));

  // Initialize two arrays to store calculated scores and their properties.
  // The size is determined by a combination formula N*(N+1)/2.
  var scoreCombinations = Array(numElements * (numElements + 1) / 2);
  var isDiagonalPair = Array(numElements * (numElements + 1) / 2);

  // Populate the scoreCombinations and isDiagonalPair arrays.
  // This involves iterating through pairs of elements from elementValues.
  var currentIndex = 0;
  for (var outerLoopCounter = 0; outerLoopCounter < numElements; outerLoopCounter++) {
    for (var innerLoopCounter = 0; innerLoopCounter <= outerLoopCounter; innerLoopCounter++) {
      // Calculate the sum of two element values.
      scoreCombinations[currentIndex] = elementValues[outerLoopCounter] + elementValues[innerLoopCounter];

      // Determine if the pair consists of the same element (diagonal).
      if (outerLoopCounter === innerLoopCounter) {
        isDiagonalPair[currentIndex] = true;
      } else {
        isDiagonalPair[currentIndex] = false;
      }
      // Move to the next index for the arrays.
      currentIndex++;
    }
  }

  // Initialize variables for the main processing loop.
  var iterationCount = 0;
  var totalScore = 0;

  // Main loop to process scores based on numIterations.
  while (iterationCount < numIterations) {
    // Find the index of the maximum score in the current scoreCombinations array.
    var maxScoreIndex = scoreCombinations.indexOf(Math.max.apply(null, scoreCombinations));

    // Apply scoring rules based on whether it's a diagonal pair or the last iteration.
    if (isDiagonalPair[maxScoreIndex] || iterationCount + 1 === numIterations) {
      totalScore += scoreCombinations[maxScoreIndex];
      iterationCount++; // Increment by one for non-diagonal or last iteration.
    } else {
      totalScore += 2 * scoreCombinations[maxScoreIndex];
      iterationCount += 2; // Increment by two for non-diagonal pairs (special rule).
    }

    // Remove the processed score and its corresponding property from the arrays.
    scoreCombinations.splice(maxScoreIndex, 1);
    isDiagonalPair.splice(maxScoreIndex, 1);
  }

  // Output the final calculated total score.
  console.log(totalScore);
}

// This section handles reading input from standard input and invoking the main processing function.
// It should not be modified as per the problem statement.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
