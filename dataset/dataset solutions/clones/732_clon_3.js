// Activates the standard input stream to listen for data.
process.stdin.resume();

// Sets the character encoding for incoming data to UTF-8.
process.stdin.setEncoding('utf8');

// Event listener for data received on the standard input stream.
process.stdin.on('data', function(receivedDataChunk) {
  // Helper function to calculate a floored product, used for clarity and reuse.
  const computeFlooredProduct = (value, multiplierFactor) => {
    return Math.floor(value * multiplierFactor);
  };

  // Split the entire chunk of received data into individual lines.
  // Handles both Windows (\r\n) and Unix (\n) line endings.
  const inputLines = receivedDataChunk.split(/\r?\n/);

  // Iterate over each line provided in the input.
  for (let lineIndex = 0; lineIndex < inputLines.length; lineIndex++) {
    const currentInputLine = inputLines[lineIndex].trim(); // Remove leading/trailing whitespace.

    // Skip processing if the line is empty after trimming.
    if (currentInputLine.length === 0) {
      continue;
    }

    // Split the current line by spaces to get its numerical components.
    const numericSegments = currentInputLine.split(' ');

    // Ensure we have exactly three numerical segments as expected.
    if (numericSegments.length !== 3) {
      // console.error(`Skipping malformed line: "${currentInputLine}" - Expected 3 segments, got ${numericSegments.length}`);
      continue; // Move to the next line if format is incorrect.
    }

    // Parse string segments into floating-point numbers.
    const firstPercentageValue = Number(numericSegments[0]);
    const secondPercentageValue = Number(numericSegments[1]);
    const targetSumValue = Number(numericSegments[2]);

    // Validate that all parsed values are actual numbers.
    if (isNaN(firstPercentageValue) || isNaN(secondPercentageValue) || isNaN(targetSumValue)) {
      // console.error(`Skipping line with non-numeric data: "${currentInputLine}"`);
      continue; // Skip if any segment is not a valid number.
    }

    // A Type III addition: Check if all significant values are zero, which might indicate an irrelevant line
    // based on the original logic's implicit truthiness check (valA | valB | targetVal).
    // The original `|` operator would convert to int and then check truthiness.
    // Here, we explicitly check if they are all zero.
    if (firstPercentageValue === 0 && secondPercentageValue === 0 && targetSumValue === 0) {
      continue; // Skip lines where all inputs are zero, as they won't yield meaningful results.
    }

    // Initialize the variable to store the maximum calculated value for the current line.
    let maximumAchievedScore = 0;

    // Calculate the growth factors based on the input percentages.
    // The original code `val / 100 + 1` implies a percentage increase.
    const growthFactorA = (firstPercentageValue / 100.0) + 1.0;
    const growthFactorB = (secondPercentageValue / 100.0) + 1.0;

    // Nested loops to iterate through possible combinations of multipliers.
    // The range is 1 to 999 inclusive for both multipliers.
    for (let factorPrimary = 1; factorPrimary <= 999; factorPrimary++) {
      for (let factorSecondary = 1; factorSecondary <= 999; factorSecondary++) {

        // Calculate the sum using the first growth factor.
        const sumBasedOnFactorA = computeFlooredProduct(factorPrimary, growthFactorA) +
                                  computeFlooredProduct(factorSecondary, growthFactorA);

        // Check if this sum matches the target value for the current line.
        if (sumBasedOnFactorA === targetSumValue) {
          // If a match is found, calculate the corresponding sum using the second growth factor.
          const currentCalculatedScore = computeFlooredProduct(factorPrimary, growthFactorB) +
                                         computeFlooredProduct(factorSecondary, growthFactorB);

          // Update the maximum achieved score if the current calculation yields a higher value.
          maximumAchievedScore = Math.max(maximumAchievedScore, currentCalculatedScore);
        }
      }
    }
    // Output the highest calculated score for the current input line.
    console.log(maximumAchievedScore);
  }
});