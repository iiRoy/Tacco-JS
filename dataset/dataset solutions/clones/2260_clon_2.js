function ProcessInput(rawData) {
  // Define a large prime number for modulo operations
  const moduloVal = 1000000007;

  // Parse the raw input string into a structured array of integers
  const parsedData = convertToIntArrays(parseInputString(rawData));

  // Generate all possible combinations based on the first line of input
  const combinations = generateCombinations(parsedData[0][0], parsedData[0][1]);

  // Initialize a variable to accumulate the sum of results
  let totalResult = 0;

  // Iterate through each generated combination
  for (let idx = 0; idx < combinations.length; idx++) {
    // Calculate the range difference for the current combination and add to total
    totalResult += calculateRangeDiff(parsedData[1], combinations[idx]) % moduloVal;
  }

  // Output the final sum modulo the defined value
  console.log(totalResult % moduloVal);
}

function calculateRangeDiff(valueArray, indexCombination) {
  // Initialize minimum and maximum values with the first element of the combination
  let minimumValue = valueArray[indexCombination[0] - 1];
  let maximumValue = valueArray[indexCombination[0] - 1];

  // Iterate through the rest of the combination to find true min and max
  for (let k = 1; k < indexCombination.length; k++) {
    minimumValue = Math.min(minimumValue, valueArray[indexCombination[k] - 1]);
    maximumValue = Math.max(maximumValue, valueArray[indexCombination[k] - 1]);
  }

  // Return the difference between the maximum and minimum values
  return maximumValue - minimumValue;
}

function parseInputString(rawText) {
  // Split the input string by newline characters
  rawText = rawText.split("\n");
  const linesSplit = [];

  // Iterate through each line and split it by spaces
  for (let lineIndex = 0; lineIndex < rawText.length; lineIndex++) {
    linesSplit[lineIndex] = rawText[lineIndex].split(" ");
  }
  return linesSplit;
}

function convertToIntArrays(stringArrays) {
  const integerArrays = [];

  // Iterate through the outer array (lines)
  for (let outerIdx = 0; outerIdx < stringArrays.length; outerIdx++) {
    integerArrays[outerIdx] = [];
    // Iterate through the inner array (elements in a line)
    for (let innerIdx = 0; innerIdx < stringArrays[outerIdx].length; innerIdx++) {
      integerArrays[outerIdx][innerIdx] = parseInt(stringArrays[outerIdx][innerIdx]);
    }
  }
  return integerArrays;
}

function generateCombinations(upperBound, combinationSize) {
  const allCombinations = [];
  const currentCombination = [];

  // Initialize the first combination (1, 2, ..., combinationSize)
  for (let startVal = 1; startVal <= combinationSize; startVal++) {
    currentCombination[currentCombination.length] = startVal;
  }

  // Loop to generate all subsequent combinations
  for (;;) {
    allCombinations[allCombinations.length] = currentCombination.concat(); // Add a copy of the current combination

    let resetPoint = currentCombination.length - 1;

    // Find the rightmost element that can be incremented
    for (let checkIdx = currentCombination.length - 1; checkIdx >= 0; checkIdx--) {
      if (currentCombination[checkIdx] !== upperBound - (currentCombination.length - checkIdx - 1)) {
        break;
      } else {
        resetPoint = checkIdx - 1;
      }
    }

    // If a reset point is found, generate the next combination
    if (resetPoint >= 0) {
      const baseValue = currentCombination[resetPoint];
      for (let offsetIdx = 0; offsetIdx < currentCombination.length - resetPoint; offsetIdx++) {
        currentCombination[resetPoint + offsetIdx] = baseValue + offsetIdx + 1;
      }
    } else {
      // No more combinations can be generated
      break;
    }
  }
  return allCombinations;
}

// Standard input/output handling
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
