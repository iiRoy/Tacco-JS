"use strict";

function ProcessInputData(inputContent) {
  // Prepare the input by trimming, splitting into lines, and reversing for easy popping.
  let inputLinesReversed = inputContent.trim().split("\n").reverse();
  // Initialize an array to store all output lines.
  let outputBuffer = [];

  // Helper function to get the next line from the input.
  function retrieveLine() {
    return inputLinesReversed.pop();
  }

  // Helper function to parse a line of space-separated numbers into an array of integers.
  function parseLineOfIntegers() {
    return retrieveLine().split(" ").map(stringNumber => parseInt(stringNumber));
  }

  // Helper function to add a value to the output buffer.
  function appendToOutput(itemToProcess) {
    outputBuffer.push(itemToProcess);
  }

  // Helper function to check if an element exists in a collection.
  function isElementPresent(targetItem, sourceCollection) {
    return new Set(sourceCollection).has(targetItem);
  }

  // Helper function to find the maximum value in a numeric array.
  function findArrayMaximum(numericArray) {
    return numericArray.reduce(function(accumulatorValue, currentElement) {
      return Math.max(accumulatorValue, currentElement);
    });
  }

  // Helper function to find the minimum value in a numeric array.
  function findArrayMinimum(numericArray) {
    return numericArray.reduce(function(accumulatorValue, currentElement) {
      return Math.min(accumulatorValue, currentElement);
    });
  }

  // Helper function to calculate the sum of elements in a numeric array.
  function calculateArraySum(numericArray) {
    return numericArray.reduce(function(accumulatorValue, currentElement) {
      return accumulatorValue + currentElement;
    });
  }

  // Helper function to sort an array of arrays/objects by a specific index/key.
  function sortArrayByIndex(arrayToSort, sortKeyPosition) {
    arrayToSort.sort((elementA, elementB) => elementA[sortKeyPosition] - elementB[sortKeyPosition]);
  }

  // Helper function to check if all boolean elements in an array are true.
  function checkAllTrue(booleanCollection) {
    return booleanCollection.reduce(function(accumulatorValue, currentElement) {
      return accumulatorValue && currentElement;
    });
  }

  // Helper function to check if any boolean element in an array is true.
  function checkAnyTrue(booleanCollection) {
    return booleanCollection.reduce(function(accumulatorValue, currentElement) {
      return accumulatorValue || currentElement;
    });
  }

  // Helper function to convert an iterable to an array.
  function convertToList(sourceIterable) {
    return Array.from(sourceIterable);
  }

  // Helper function to convert an iterable of strings to an array of integers.
  function convertStringsToIntegers(sourceIterable) {
    return Array.from(sourceIterable, stringItem => parseInt(stringItem));
  }

  // Helper function to create an array filled with a specific value.
  function createFilledArray(fillElement, arraySize) {
    return Array(arraySize).fill(fillElement);
  }

  // Helper function to generate a numeric sequence.
  const generateNumericSequence = (sequenceStart, sequenceEnd, stepIncrement) => Array.from(
    { length: (sequenceEnd - sequenceStart) / stepIncrement },
    (_unused, indexCounter) => sequenceStart + (indexCounter * stepIncrement)
  );

  /* Core Logic Begins */

  // Read the initial number from input.
  let currentValue = parseInt(retrieveLine());

  // Check for base cases for the Collatz conjecture.
  if (currentValue === 1 || currentValue === 2) {
    appendToOutput(4); // Specific output for these initial values.
  } else {
    let iterationCount = 2; // Initialize step counter.
    // Loop until the value reaches 1.
    while (currentValue !== 1) {
      // Apply Collatz rules: if odd, 3n+1; if even, n/2.
      if (currentValue % 2 === 1) {
        currentValue = 3 * currentValue + 1;
      } else {
        currentValue /= 2;
      }
      iterationCount++; // Increment step counter.
    }
    appendToOutput(iterationCount); // Output the total steps.
  }

  /* Core Logic Ends */

  // Join all collected output lines with newlines.
  outputBuffer = outputBuffer.join("\n");
  // Print the final output to the console.
  console.log(outputBuffer);
  // Return the output string.
  return outputBuffer;
}

// Execute the main function with input read from stdin.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
