function getInputData() {
  return require("fs").readFileSync("/dev/stdin", "utf8").trim();
}

function displayResult(outputValue) {
  console.log(outputValue);
}

function reportError(errorMessage) {
  console.error(errorMessage);
}

// This function provides various ways to process input strings.
// conversionType:
// 0: Returns the input string without modification.
// 1: Converts the input string to an integer.
// 2: Splits the input string by spaces into an array of strings.
// 3: Splits the input string by newlines into an array of strings.
// 4: Splits by spaces and converts each part to a number, returning an array of numbers.
// 5: Splits by newlines and converts each part to a number, returning an array of numbers.
// 6: Splits the input string into an array of individual characters.
// 7: Splits into individual characters and converts each to a number, returning an array of numbers.
function transformInput(inputString, conversionType) {
  switch (conversionType) {
    case 0:
      return inputString;
    case 1:
      return parseInt(inputString);
    case 2:
      return inputString.split(" ");
    case 3:
      return inputString.split("\n");
    case 4:
      return inputString.split(" ").map((elementStr) => Number(elementStr));
    case 5:
      return inputString.split("\n").map((elementStr) => Number(elementStr));
    case 6:
      return inputString.split("");
    case 7:
      return inputString.split("").map((elementStr) => Number(elementStr));
  }
}

function executeProgram(rawInputData) {
  // Split the initial raw input into lines.
  rawInputData = transformInput(rawInputData, 3);

  // Parse the first line as the total count of elements.
  var countElements = transformInput(rawInputData[0], 1);

  // Parse the second line as a list of numbers.
  var numericValues = transformInput(rawInputData[1], 4);

  // Compute the average of the numeric values.
  var averageValue = calculateMean(numericValues);

  // Initialize variables to track the index of the element closest to the average.
  var closestIndex = 0;
  var minDifference = 101; // Set an initial large difference.

  // Iterate through the numeric values to find the one closest to the average.
  for (var idx = 0; idx < countElements; idx++) {
    // Calculate the absolute difference for the current element.
    let currentDifference = Math.abs(numericValues[idx] - averageValue);

    // If this difference is smaller than the current minimum, update.
    if (minDifference > currentDifference) {
      minDifference = currentDifference;
      closestIndex = idx;
    }
  }

  // Display the index of the element found to be closest.
  displayResult(closestIndex);
}

// A helper function to determine the arithmetic mean of a collection of numbers.
function calculateMean(numberCollection) {
  var totalSum = 0;
  // Sum all numbers in the provided collection.
  for (var indexPosition = 0; indexPosition < numberCollection.length; indexPosition++) {
    totalSum += numberCollection[indexPosition];
  }
  // Return the sum divided by the total count of numbers.
  return totalSum / numberCollection.length;
}

// Start the program by fetching input and executing the main logic.
executeProgram(getInputData());
