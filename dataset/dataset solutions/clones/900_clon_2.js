process.stdin.resume();
process.stdin.setEncoding('utf8');

// Event listener for incoming data from standard input
process.stdin.on('data', function(inputData) {
  // Split the incoming data into individual lines
  var currentInputLine,
      processedInputLines = inputData.split('\n'),
      lineIterator,
      totalLineCount = processedInputLines.length,
      charIterator,
      currentLineLength,
      calculatedAngle,
      exponentValue,
      maximumAngle;

  // Iterate through each line received
  for (lineIterator = 0; lineIterator < totalLineCount; lineIterator++) {
    currentInputLine = processedInputLines[lineIterator];

    // Check for the termination character
    if (currentInputLine === '#') {
      break; // Exit the loop if '#' is encountered
    }

    // Replace specific string patterns with numeric values
    currentInputLine = currentInputLine.replace(/north/g, 0);
    currentInputLine = currentInputLine.replace(/west/g, 1);

    // Initialize the angle calculation variable
    calculatedAngle = 0;

    // Determine the length of the current line
    currentLineLength = currentInputLine.length;
    // Set the initial exponent for power calculations
    exponentValue = currentInputLine.length - 1;
    // Calculate the maximum possible angle based on the line length
    maximumAngle = 90 * Math.pow(2, exponentValue);

    // Iterate through the characters of the line in reverse
    for (charIterator = currentLineLength; charIterator >= 0; charIterator--) {
      // Convert character to number and check its truthiness (0 or 1)
      if (currentInputLine[charIterator] * 1) {
        // If the character represents '1' (or true), add to the angle
        if (calculatedAngle < maximumAngle) {
          calculatedAngle += 90 * Math.pow(2, charIterator);
        }
      } else {
        // If the character represents '0' (or false), subtract from the angle
        if (calculatedAngle > 0) {
          calculatedAngle -= 90 * Math.pow(2, charIterator);
        }
      }
    }

    // Simplify the fraction by dividing by 2 as long as both are even
    while (exponentValue > 0 && calculatedAngle % 2 === 0) {
      calculatedAngle = calculatedAngle / 2;
      exponentValue--;
    }

    // Output the result, either as a fraction or a whole number
    if (exponentValue > 0) {
      console.log(calculatedAngle + "/" + Math.pow(2, exponentValue));
    } else {
      console.log(calculatedAngle);
    }
  }
});
