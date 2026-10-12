'use strict';

// This class helps in processing input data line by line.
function InputProcessor(inputContent) {
  let rawLines = inputContent.split('\n');
  // Remove the last element if it's an empty string (common with readFileSync)
  if (rawLines[rawLines.length - 1] === '') {
    rawLines.pop();
  }
  this.dataLines = rawLines; // Stores all input lines
  this.currentLineIndex = 0; // Tracks the current line being processed
}

// Prototype method to read a line, split by spaces, and convert to numbers.
InputProcessor.prototype.readNumbers = function() {
  // Get the current line, then advance the index for the next read.
  return this.dataLines[this.currentLineIndex++].split(' ').map(val => +val);
};

// Prototype method to read all remaining lines and convert them to numbers.
InputProcessor.prototype.readAllNumbers = function() {
  const initialIndex = this.currentLineIndex;
  // Set the index to the end, indicating all lines have been processed.
  this.currentLineIndex = this.dataLines.length;
  return this.dataLines.slice(initialIndex).map(val => +val);
};

// Prototype method to read all remaining lines as strings.
InputProcessor.prototype.readAllStrings = function() {
  const initialIndex = this.currentLineIndex;
  // Set the index to the end, indicating all lines have been processed.
  this.currentLineIndex = this.dataLines.length;
  return this.dataLines.slice(initialIndex);
};

// Prototype method to read a specific number of lines as strings.
InputProcessor.prototype.readNStrings = function(count) {
  const initialIndex = this.currentLineIndex;
  // Advance the index by the number of lines read.
  this.currentLineIndex += count;
  return this.dataLines.slice(initialIndex, initialIndex + count);
};

// Create an instance of InputProcessor, reading from standard input.
const inputReader = new InputProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));

// Main execution block using an Immediately Invoked Function Expression (IIFE).
(() => {
  // Read the first number from the input, which represents the total count of elements.
  const totalElements = inputReader.readNumbers()[0];
  // Read the next line, which contains the array of numbers.
  const numberArray = inputReader.readNumbers();

  let totalSum = 0; // Initialize a variable to accumulate the sum of elements.
  // Iterate through the array to calculate the sum of all its elements.
  for (let currentElement of numberArray) {
    totalSum += currentElement;
  }

  // Calculate the average value of the numbers in the array.
  let averageValue = totalSum / totalElements;

  // Initialize 'closestValue' with the first element of the array.
  let closestValue = numberArray[0];
  // Initialize 'closestIndex' with the index of the first element.
  let closestIndex = 0;

  // Loop through the array starting from the second element (index 1).
  for (let idx = 1; idx < totalElements; idx++) {
    // Compare the absolute difference between the current element and the average
    // with the absolute difference between the 'closestValue' found so far and the average.
    if (Math.abs(numberArray[idx] - averageValue) < Math.abs(closestValue - averageValue)) {
      // If the current element is closer to the average, update 'closestValue' and 'closestIndex'.
      closestValue = numberArray[idx];
      closestIndex = idx;
    }
  }

  // Output the index of the element that is closest to the average value.
  console.log(closestIndex);
})();
