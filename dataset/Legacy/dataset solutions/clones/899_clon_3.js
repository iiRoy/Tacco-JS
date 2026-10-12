process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function(inputData) {
  const BASE_ANGLE_UNIT = 90; // Define a constant for the base angle value

  // Helper function to calculate powers of 2
  const calculatePowerOfTwo = (exponent) => Math.pow(2, exponent);

  let inputLines = inputData.split("\n");
  let totalLines = inputLines.length;

  for (let lineIndex = 0; lineIndex < totalLines; lineIndex++) {
    let currentLine = inputLines[lineIndex];

    // Terminate processing if the line is the '#' sentinel
    if (currentLine === "#") {
      break;
    }

    // Pre-process the line: replace direction strings with numeric characters
    // 'north' becomes '0', 'west' becomes '1'
    let processedLine = currentLine
      .replace(/north/g, '0')
      .replace(/west/g, '1');

    let currentDegree = 0;
    let lineLength = processedLine.length;
    let initialPower = lineLength - 1; // The highest power of 2 for this line's length

    // Calculate the maximum possible degree value for this line's length
    let maxDegreeValue = BASE_ANGLE_UNIT * calculatePowerOfTwo(initialPower);

    // Iterate through each character to calculate the initial degree
    for (let charIndex = 0; charIndex < lineLength; charIndex++) {
      // Convert the character ('0' or '1') to a number
      const charNumericValue = Number(processedLine[charIndex]);

      // Determine the power of 2 for the current character's position
      const positionPower = initialPower - charIndex;
      const angleContribution = BASE_ANGLE_UNIT * calculatePowerOfTwo(positionPower);

      if (charNumericValue === 1) { // If the character represents 'west' (add to degree)
        // Add to degree, ensuring it does not exceed the maximum allowed value
        if (currentDegree < maxDegreeValue) {
          currentDegree += angleContribution;
        }
      } else { // If the character represents 'north' (subtract from degree)
        // Subtract from degree, ensuring it does not go below zero
        if (currentDegree > 0) {
          currentDegree -= angleContribution;
        }
      }
    }

    // Simplify the fraction (currentDegree / 2^simplifiedPower) by dividing by 2
    // as long as both currentDegree is even and simplifiedPower is greater than 0
    let simplifiedPower = initialPower;
    while (simplifiedPower > 0 && currentDegree % 2 === 0) {
      currentDegree /= 2;
      simplifiedPower--;
    }

    // Output the result based on whether the power has been simplified to 0
    if (simplifiedPower > 0) {
      console.log(currentDegree + "/" + calculatePowerOfTwo(simplifiedPower));
    } else {
      console.log(currentDegree);
    }
  }
});
