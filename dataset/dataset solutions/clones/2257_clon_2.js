function ProcessInputData(inputString) {
  // Define a constant for modulo operation, ensuring it's a number.
  const moduloConstant = 1000000007;

  // Parse the input string into a 2D array of integers.
  let parsedInputData = convertStringsToNumbers(processRawInput(inputString));

  // Extract 'n' and 'k' from the first row of the parsed data.
  const totalElements = parsedInputData[0][0];
  const selectionCount = parsedInputData[0][1];

  // Sort the second row of the parsed data in descending order.
  // The comparison function (b - a) ensures a reverse numerical sort.
  parsedInputData[1].sort(function(elementA, elementB) {
    return elementB - elementA;
  });

  // Initialize an object to store the maximum and minimum calculated values.
  let resultContainer = {
    maximumValue: 0,
    minimumValue: 0
  };

  // Calculate the maximum value based on combinations.
  // This loop iterates through the sorted array to pick elements for the maximum sum.
  for (let currentIdx = 0; currentIdx <= parsedInputData[1].length - selectionCount; currentIdx++) {
    resultContainer.maximumValue += parsedInputData[1][currentIdx] * calculateCombinations(totalElements - currentIdx - 1, selectionCount - 1);
  }

  // Calculate the minimum value based on combinations.
  // This loop iterates through the sorted array to pick elements for the minimum sum.
  for (let currentIdx = selectionCount - 1; currentIdx < parsedInputData[1].length; currentIdx++) {
    resultContainer.minimumValue += parsedInputData[1][currentIdx] * calculateCombinations(currentIdx, selectionCount - 1);
  }

  // Output the difference between maximum and minimum values, modulo the constant.
  // The result is printed to standard output.
  console.log((resultContainer.maximumValue - resultContainer.minimumValue) % moduloConstant);
}

// Function to calculate combinations (nCk).
// Note: This implementation might have precision issues for very large numbers due to floating-point division.
function calculateCombinations(upperBound, lowerBound) {
  // Debugging output for the combination parameters.
  console.log(upperBound + "," + lowerBound);

  let numeratorProduct = 1; // Stores the product of (n-i) terms.
  let denominatorProduct = 1; // Stores the product of (i+1) terms.

  // Calculate the numerator and denominator parts of the combination formula.
  for (let loopCounter = 0; loopCounter < lowerBound; loopCounter++) {
    numeratorProduct *= upperBound - loopCounter;
    denominatorProduct *= loopCounter + 1;
  }

  // Debugging output for the intermediate calculation.
  console.log(numeratorProduct + "/" + denominatorProduct + "=" + (numeratorProduct / denominatorProduct));

  // Return the calculated combination value.
  return numeratorProduct / denominatorProduct;
}

// Helper function to process raw input string into a 2D array of strings.
function processRawInput(rawInputString) {
  // Split the entire input string by newline characters.
  let lines = rawInputString.split("\n");
  let lineSplitData = []; // Array to hold split data.

  // Iterate through each line and split it by spaces.
  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    lineSplitData[lineIndex] = lines[lineIndex].split(" ");
  }
  return lineSplitData;
}

// Helper function to convert a 2D array of strings to a 2D array of integers.
function convertStringsToNumbers(stringMatrix) {
  let numericArray = []; // Array to hold parsed integer data.

  // Iterate through rows.
  for (let rowIndex = 0; rowIndex < stringMatrix.length; rowIndex++) {
    numericArray[rowIndex] = []; // Initialize inner array for the current row.
    // Iterate through columns in the current row.
    for (let colIndex = 0; colIndex < stringMatrix[rowIndex].length; colIndex++) {
      // Parse each string element to an integer.
      numericArray[rowIndex][colIndex] = parseInt(stringMatrix[rowIndex][colIndex]);
    }
  }
  return numericArray;
}

// This section handles reading from standard input and invoking the main processing function.
// It should not be modified to ensure compatibility with the execution environment.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
// Example usage with hardcoded input (commented out):
// ProcessInputData("6 3\n10 10 10 -10 -10 -10");
// ProcessInputData("10 6\n1000000000 1000000000 1000000000 1000000000 1000000000 0 0 0 0 0");
