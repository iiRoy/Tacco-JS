// This module handles numerical processing from standard input.
function processInput (rawData) {
  const processedData = dataExtractor(rawData); // Parse the raw input string
  console.info(calculateMaximumValue(processedData.firstNum,
                                processedData.secondNum,
                                processedData.upperBound));
}

// Extracts numerical parameters from a single string.
function dataExtractor(inputStringData) {
  const tokenizedInput = inputStringData.split(' '); // Split the string by spaces
  return {
    firstNum: Number(tokenizedInput[0]),  // Convert first token to a number
    secondNum: Number(tokenizedInput[1]), // Convert second token to a number
    upperBound: Number(tokenizedInput[2]), // Convert third token to a number
  };
}

// Computes the maximum possible value based on given parameters.
function calculateMaximumValue(valA, valB, limitN) {
  let currentMaxResult = 0; // Initialize the maximum result found
  // Determine the effective upper limit for the iteration, considering valB
  const loopUpperLimit = limitN < valB ? limitN : limitN / valB;

  for (let iteratorVar = 1; iteratorVar <= loopUpperLimit + 1; iteratorVar++) {
    // Perform a specific calculation involving integer division
    let intermediateCalculation = (((valA * iteratorVar) / valB) | 0) - valA * ((iteratorVar / valB) | 0);
    // Update the maximum result if the current calculation is greater
    if (currentMaxResult < intermediateCalculation) {
      currentMaxResult = intermediateCalculation;
    }
  }
  return currentMaxResult; // Return the overall maximum value
}

// Execute the main processing logic using data from standard input.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));