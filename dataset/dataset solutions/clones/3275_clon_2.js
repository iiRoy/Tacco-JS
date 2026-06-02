"use strict";

// This function processes the input data to solve a specific problem.
function processInput(rawData) {
  // Split the raw input string into individual lines.
  var inputLines = rawData.split('\n');

  // Parse the number of elements from the first line.
  var countElements = parseInt(inputLines[0]);

  // Parse the first array of numbers, taking only 'countElements' items.
  var firstArray = parseNumbersFromString(inputLines[1]).slice(0, countElements);

  // Parse the second array of numbers, also taking 'countElements' items.
  var secondArray = parseNumbersFromString(inputLines[2]).slice(0, countElements);

  // Calculate the differences between corresponding elements of the two arrays.
  var differenceValues = firstArray.map(function (valA, idx) {
    return valA - secondArray[idx];
  });

  // Sort the differences in descending order.
  differenceValues.sort(function (elemX, elemY) {
    return elemY - elemX;
  });

  // Initialize an array to track which elements have been modified.
  var modifiedIndices = differenceValues.map(function (_unused) {
    return false;
  });

  // Set up two pointers for the two-pointer approach.
  var leftPointer = 0;
  var rightPointer = countElements - 1;

  // Iterate while the left pointer is less than the right pointer.
  while (leftPointer < rightPointer) {
    // Get the current difference value from the right end.
    var currentDiff = differenceValues[rightPointer];

    // If the current difference is non-negative, we're done with negative differences.
    if (currentDiff >= 0) {
      // All remaining differences are non-negative, so we can stop.
      break;
    }

    // Check if the positive difference at the left pointer can compensate the negative difference at the right pointer.
    if (differenceValues[leftPointer] >= -currentDiff) {
      // Mark both elements as modified.
      modifiedIndices[leftPointer] = true;
      modifiedIndices[rightPointer] = true;

      // Adjust the left pointer's difference.
      differenceValues[leftPointer] += currentDiff;
      // The right pointer's difference is now zero.
      differenceValues[rightPointer] = 0;

      // Move the right pointer inwards.
      rightPointer--;
    } else {
      // If the left pointer's difference is positive, mark it as modified.
      if (differenceValues[leftPointer] > 0) {
        modifiedIndices[leftPointer] = true;
        modifiedIndices[rightPointer] = true;
      }

      // Add the left pointer's difference to the right pointer's difference.
      differenceValues[rightPointer] += differenceValues[leftPointer];
      // The left pointer's difference is now zero.
      differenceValues[leftPointer] = 0;

      // Move the left pointer inwards.
      leftPointer++;
    }
  }

  // After the loop, check if the last remaining difference (or the one at rightPointer) is still negative.
  if (differenceValues[rightPointer] < 0) {
    // If it's negative, it's impossible to make all differences non-negative.
    console.log(-1);
  } else {
    // Otherwise, count the number of modified elements.
    console.log(modifiedIndices.reduce(function (accumulator, isModified) {
      return accumulator + isModified;
    }, 0));
  }

  return;
}

// This function calculates the greatest common divisor of two numbers.
// Note: This function is defined but not used in the main logic.
function greatestCommonDivisor(num1, num2) {
  if (num1 < num2) return greatestCommonDivisor(num1, num2);
  if (num2 === 0) return num1;
  var remainder = num1 % num2;
  return greatestCommonDivisor(num2, remainder);
}

// Execute the main processing function by reading input from stdin.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));

// Helper function to parse a space-separated string of numbers into an array of integers.
function parseNumbersFromString(inputLineString) {
  return inputLineString.split(/\s+/).map(function (parsedNumber) {
    return parseInt(parsedNumber);
  });
}
