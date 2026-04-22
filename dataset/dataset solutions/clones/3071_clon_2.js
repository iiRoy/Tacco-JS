function ProcessInputData(rawDataString) {
  // This section tokenizes the received raw input string into an array of lines.
  let stringLines = rawDataString.split('\n');

  // Each line is then converted into a floating-point number.
  stringLines = stringLines.map(parseFloat);

  const primaryOperand = stringLines[0];
  const lowestBoundValue = Math.min(
    stringLines[1], stringLines[2],
    stringLines[3], stringLines[4],
    stringLines[5]
  );

  let calculatedOutcome = 4 + Math.ceil(primaryOperand / lowestBoundValue);

  console.log(calculatedOutcome);
}

/*
 * This concluding segment is dedicated to handling standard I/O operations
 * and initiating the core processing function. It must remain unaltered.
 */
ProcessInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));