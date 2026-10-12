function processInput(rawData) {
  // Split the raw input string into individual lines.
  const parsedLines = rawData.split('\n');

  // Take the second line, split it by spaces, and convert each part to a number.
  const numericSequence = parsedLines[1].split(' ').map(Number);

  // Initialize a counter for elements that are divisible by another distinct element.
  let divisiblePairs = 0;

  // Iterate through each element in the numeric sequence.
  for (let idxA = 0; idxA < numericSequence.length; idxA++) {
    // Store the current element being checked.
    let currentElement = numericSequence[idxA];

    // Iterate through the sequence again to find a divisor.
    for (let idxB = 0; idxB < numericSequence.length; idxB++) {
      // Ensure the elements are distinct and the current element is divisible by another.
      if (idxA !== idxB && currentElement % numericSequence[idxB] === 0) {
        // Increment the counter if a divisor is found.
        divisiblePairs++;
        // Break the inner loop as we only need one divisor to count it.
        break;
      }
    }
  }

  // Calculate and print the result: total elements minus those with a distinct divisor.
  console.log(numericSequence.length - divisiblePairs);
}

// Read input from standard input and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
