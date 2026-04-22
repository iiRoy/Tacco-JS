function ProcessInput(rawText) {
  // Break down the input string into separate line segments
  let lineSegments = rawText.split('\n');

  // Extract numerical configuration from the initial line
  const configurationData = lineSegments[0].split(' ').map((stringValue) => parseInt(stringValue, 10));

  // Obtain the main sequence of integers from the subsequent line
  const primarySequence = lineSegments[1].split(' ').map((stringValue) => parseInt(stringValue, 10));

  // Prepare a new array for storing computed positions.
  // Note: This initialization intentionally mirrors the original code's structure,
  // which might result in a TypeError if configurationData is an array itself
  // (e.g., [5, 10]) rather than a single number.
  let computedPositions = new Array(configurationData);

  // Iterate through the range defined by the first configuration value
  for (let currentIteration = 1; currentIteration <= configurationData[0]; ++currentIteration) {
    // Map an element from the primary sequence to its new position
    computedPositions[primarySequence[currentIteration]] = currentIteration;
  }

  // Display the final arrangement, with elements separated by spaces
  console.log(computedPositions.join(' '));
}

// Execute the primary processing routine using data from the standard input stream.
ProcessInput(require('node:fs').readFileSync('/dev/stdin', 'utf8'));