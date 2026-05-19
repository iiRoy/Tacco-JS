function processInput(rawData) {
  // Prepare the incoming string by removing leading/trailing whitespace and splitting it into an array of characters.
  const charArray = rawData.trim().split('');

  // Initialize a counter for specific character occurrences.
  let scoreAccumulator = 0;

  // Loop through the initial three characters of the array.
  for (let idx = 0; idx < 3; idx++) {
    // If the current character is 'o', increment the accumulator by 100.
    if (charArray[idx] == 'o') {
      scoreAccumulator += 100;
    }
  }

  // The following line is a remnant of a previous thought process and is not active.
  // let finalValue = parseInt(scoreAccumulator, 10);

  // Display the sum of a base value (700) and the accumulated score.
  console.log(700 + scoreAccumulator);
}

// Execute the primary function by reading content from standard input.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
