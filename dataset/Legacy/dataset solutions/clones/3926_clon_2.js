'use strict'
function getInputData() {
  // This function is responsible for reading all input from standard input.
  return require("fs").readFileSync("/dev/stdin", "utf8").trim();
}

function displayResult(resultValue) {
  // This function prints the final calculated result to the console.
  console.log(resultValue);
}

// A helper function to convert or split input strings based on a specified method.
// The 'conversionType' parameter dictates the transformation:
//   0: Return the string as is.
//   1: Parse the string into an integer.
//   2: Split the string by spaces into an array.
//   3: Split the string by newlines into an array.
//   4: Split by spaces, then convert each part to a number.
//   5: Split by newlines, then convert each part to a number.
//   6: Split the string into an array of individual characters.
//   7: Split into characters, then convert each character to a number.
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
      return inputString.split(" ").map((item) => Number(item));
    case 5:
      return inputString.split("\n").map((item) => Number(item));
    case 6:
      return inputString.split("");
    case 7:
      return inputString.split("").map((item) => Number(item));
  }
  // If conversionType is not 0-7, the original function would implicitly return undefined.
  // We maintain this behavior by not having a default case or explicit return here.
}

function ProcessData(rawData) {
  // Convert the multi-line input string into an array of strings, one per line.
  rawData = transformInput(rawData, 3);

  // Remove the first line of the input, which is often a count or header.
  rawData.shift();

  // Initialize a variable to store the cumulative sum of selected numbers.
  var totalSum = 0;

  // Iterate over each remaining line in the processed input array.
  for (var idx = 0; idx < rawData.length; idx++) {
    // Split the current line into two parts based on space.
    var currentLineParts = rawData[idx].split(" ");
    // Parse the first part as an integer.
    var firstNum = parseInt(currentLineParts[0]);
    // Parse the second part as an integer.
    var secondNum = parseInt(currentLineParts[1]);

    // Check if the first number is strictly less than the second number.
    if (firstNum < secondNum) {
      // If true, add the second number to our running total.
      totalSum += secondNum;
    }
  }

  // Output the final calculated sum.
  displayResult(totalSum);
}

// The entry point of the script:
// First, retrieve the raw input data, then pass it to the main processing function.
ProcessData(getInputData());
