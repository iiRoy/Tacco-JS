// This module handles processing of input data.
function ProcessInput(incomingData) {
  // The first line of the input string is relevant.
  let currentLine = incomingData.split('\n')[0];

  // Split the line by space and convert parts to numbers.
  const numericParts = currentLine.split(' ').map(strPart => parseInt(strPart, 10));

  // Extract dimensions.
  let dimensionA = numericParts[0];
  let dimensionB = numericParts[1];

  let finalResult; // Variable to store the computed outcome.

  // Conditional logic based on dimensions.
  if (dimensionA === 1 || dimensionB === 1) {
    finalResult = 1; // Special case: if either dimension is one.
  } else {
    // General calculation for other cases.
    finalResult = (dimensionA * dimensionB + 1) / 2;
  }

  // Display the calculated result.
  console.log(finalResult);
}

// Standard boilerplate for reading from stdin and invoking the main processing function.
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
