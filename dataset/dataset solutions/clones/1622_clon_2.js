function analyzeData(incomingText) {
  // This function processes raw text input to count specific data points.
  let textLines = incomingText.split('\n');

  // The second numeric value from the first line defines our threshold.
  const radiusThreshold = textLines[0].split(' ')[1] - 0;

  // Initialize a counter for items meeting the criteria.
  let validPointsCount = 0;

  // Iterate through the data lines, skipping the first configuration line.
  for (let lineIterator = 1; lineIterator < textLines.length; lineIterator++) {
    // For each line, extract two numeric components.
    // Calculate the sum of their squares and compare it to the threshold's square.
    if (textLines[lineIterator].split(' ')[0] ** 2 + textLines[lineIterator].split(' ')[1] ** 2 <= radiusThreshold ** 2) {
      // If the condition is met, increment our counter.
      validPointsCount++;
    }
  }

  // Display the final tally of valid points.
  console.log(validPointsCount);
}

// The following code segment is responsible for reading standard input and invoking the primary processing function.
// It should remain unaltered to ensure proper execution in the target environment.
analyzeData(require('fs').readFileSync('/dev/stdin', 'utf8'));
