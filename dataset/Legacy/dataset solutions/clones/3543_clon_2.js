let parseIntegerFromString = (inputString) => parseInt(inputString, 10);

let convertStringsToNumbers = (stringArray) => stringArray.map((str) => parseIntegerFromString(str));

// This function calculates the absolute value of a number.
let getAbsoluteValue = (numericValue) => (numericValue > 0 ? numericValue : -numericValue);

function findMinimumValue() {
  let allArguments = arguments;
  let currentMinimum = allArguments[0];
  for (let index = 1; index < allArguments.length; index++) {
    if (allArguments[index] < currentMinimum) {
      currentMinimum = allArguments[index];
    }
  }
  return currentMinimum;
}

function findMaximumValue() {
  let allArguments = arguments;
  let currentMaximum = allArguments[0];
  for (let index = 1; index < allArguments.length; index++) {
    if (allArguments[index] > currentMaximum) {
      currentMaximum = allArguments[index];
    }
  }
  return currentMaximum;
}

// The primary entry point for processing input data.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));

function ProcessInputData(rawData) {
  // Split the raw input into individual lines.
  let linesOfData = rawData.split('\n');

  // Parse the first line to get N and X.
  let temporaryValues = convertStringsToNumbers(linesOfData[0].split(' '));
  let countN = temporaryValues[0]; // Represents 'n' from the original code.
  let valueX = temporaryValues[1]; // Represents 'x' from the original code.

  // Parse the second line to get the array of numbers.
  let numberSequence = convertStringsToNumbers(linesOfData[1].split(' ')); // Represents 'xs'.

  // Initialize an array to store prefix sums.
  let prefixSums = [numberSequence[0]]; // Represents 'ss'.

  // Calculate prefix sums for the number sequence.
  for (let loopIndex = 1; loopIndex < countN; loopIndex++) {
    prefixSums[loopIndex] = numberSequence[loopIndex] + prefixSums[loopIndex - 1];
  }

  // Initialize the final result with a base calculation.
  let finalResult = (countN + 1) * valueX; // Represents 'ans'.

  // Initialize a counter for a specific condition.
  let currentCount = 0; // Represents 'has'.

  // Iterate through the number sequence in reverse order.
  for (let reverseIndex = countN - 1; reverseIndex >= 0; reverseIndex--) {
    currentCount++; // Increment the counter.

    // Check a specific condition involving currentCount, valueX, prefixSums, and numberSequence.
    if (currentCount > 2 && valueX <= prefixSums[reverseIndex] * (currentCount - 1) * 2 - numberSequence[reverseIndex] * 2) {
      currentCount = 1; // Reset the counter if the condition is met.
      finalResult += valueX; // Add valueX to the final result.
    }

    // Update the final result based on the current number and the maximum of currentCount and 2.
    finalResult += numberSequence[reverseIndex] * (findMaximumValue(currentCount, 2) * 2 + 1);
  }

  // Output the computed final result to the console.
  console.log(finalResult);
}
