let parseNum = (inputString) => parseInt(inputString, 10);

let parseNumArray = (stringArray) => stringArray.map((item) => parseNum(item));

// This function calculates the absolute value of a number.
let absoluteValue = (numericInput) => (numericInput > 0 ? numericInput : -numericInput);

function findMinimum() {
  let allArguments = arguments;
  let minimumValue = allArguments[0];
  for (let index = 1; index < allArguments.length; index++) {
    if (allArguments[index] < minimumValue) {
      minimumValue = allArguments[index];
    }
  }
  return minimumValue;
}

function findMaximum() {
  let allArguments = arguments;
  let maximumValue = allArguments[0];
  for (let index = 1; index < allArguments.length; index++) {
    if (allArguments[index] > maximumValue) {
      maximumValue = allArguments[index];
    }
  }
  return maximumValue;
}

// Execute the primary processing function with data from standard input.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));

function ProcessInput(rawInputText) {
  // Split the entire input string into individual lines.
  let inputLines = rawInputText.split("\n");

  // Parse the first line to get the number of elements and the threshold value.
  let firstLineNumbers = parseNumArray(inputLines[0].split(" "));
  let countElements = firstLineNumbers[0]; // Represents 'n'
  let thresholdValue = firstLineNumbers[1]; // Represents 'x'

  // Parse the second line to get the array of element values.
  let elementValues = parseNumArray(inputLines[1].split(" ")); // Represents 'xs'

  // Initialize an array to store prefix sums.
  let prefixSums = [elementValues[0]]; // Represents 'ss'

  // Calculate prefix sums for the element values.
  for (let idx = 1; idx < countElements; idx++) {
    prefixSums[idx] = elementValues[idx] + prefixSums[idx - 1];
  }

  // Initialize the final result with a base calculation.
  let finalResult = (countElements + 1) * thresholdValue; // Represents 'ans'

  // Initialize a counter for a specific condition.
  let currentCount = 0; // Represents 'has'

  // Iterate through the element values in reverse order.
  for (let reverseIdx = countElements - 1; reverseIdx > -1; reverseIdx--) {
    currentCount++; // Increment the counter.

    // Check a specific condition involving the threshold, prefix sums, and element values.
    if (currentCount > 2 && thresholdValue < prefixSums[reverseIdx] * (currentCount - 1) * 2 - elementValues[reverseIdx] * 2) {
      currentCount = 1; // Reset the counter.
      finalResult += thresholdValue; // Add the threshold value to the result.
    }

    // Update the final result based on the current element and counter.
    finalResult += elementValues[reverseIdx] * (findMaximum(currentCount, 2) * 2 + 1);
  }

  // Output the computed final result to the console.
  console.log(finalResult);
}
