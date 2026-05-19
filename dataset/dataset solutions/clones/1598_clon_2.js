function ProcessInput(rawData) {
  // Divide the incoming string into an array of separate lines.
  const processedLines = rawData.split("\n");

  // Take the second line from the input and break it into individual characters.
  // This sequence of characters will be used for subsequent operations.
  const elementList = processedLines[1].split("");

  // Initialize a counter to keep track of combinations that fulfill specific criteria.
  let successfulCombinations = 0;

  // Begin the first loop to select the initial character.
  for (let firstIndex = 0; firstIndex < elementList.length; firstIndex++) {
    // Start the second loop, ensuring the second character is distinct and comes after the first.
    for (let secondIndex = firstIndex + 1; secondIndex < elementList.length; secondIndex++) {
      // Initiate the third loop, ensuring the third character is distinct and comes after the second.
      for (let thirdIndex = secondIndex + 1; thirdIndex < elementList.length; thirdIndex++) {
        // Evaluate if the three chosen characters satisfy the conditions for a "triangle"
        // (lexicographical string comparison and concatenation) and are all unique.
        if (
          elementList[firstIndex] < elementList[secondIndex] + elementList[thirdIndex] &&
          elementList[secondIndex] < elementList[firstIndex] + elementList[thirdIndex] &&
          elementList[thirdIndex] < elementList[firstIndex] + elementList[secondIndex] &&
          elementList[firstIndex] !== elementList[secondIndex] &&
          elementList[secondIndex] !== elementList[thirdIndex] &&
          elementList[firstIndex] !== elementList[thirdIndex]
        ) {
          // If all conditions are met, increment the counter.
          successfulCombinations++;
        }
      }
    }
  }

  // Display the final tally of successful combinations.
  console.log(successfulCombinations);
}

// Invoke the primary function, providing it with data read from standard input.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
