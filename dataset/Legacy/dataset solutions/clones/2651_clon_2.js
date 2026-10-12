"use strict";

// This script reads input from stdin, processes arrays based on specific rules,
// and counts the operations required to transform one array into another.

// Import the 'fs' module for file system operations, specifically reading stdin.
const inputContent = require('fs').readFileSync('/dev/stdin', 'UTF-8');

// Split the entire input string by newline characters to get individual lines.
const inputLines = inputContent.split('\n');

// The first line of input represents the size of the arrays.
// We parse it to ensure it's treated as a number.
const arraySize = parseInt(inputLines[0]);

// The second line contains space-separated numbers that form the target array.
// Each string number is converted to an integer.
const targetArray = inputLines[1].split(' ').map(val => parseInt(val));

// The third line contains space-separated numbers that form the initial array.
// Each string number is converted to an integer.
const initialArray = inputLines[2].split(' ').map(val => parseInt(val));

// Initialize a counter to keep track of the number of transformation operations.
let operationCount = 0;

// Create a mutable copy of the initial array to perform operations on.
// Using the spread operator ensures a new array instance is created.
let workingArray = [...initialArray];

// Begin an infinite loop that will continue until the working array matches the target array.
while (true) {
    // Find the index of the largest element in the current working array.
    // Math.max with spread operator finds the maximum value, then indexOf finds its first occurrence.
    const peakIndex = workingArray.indexOf(Math.max(...workingArray));

    // Apply a specific transformation to the element at 'peakIndex' based on its position.
    if (peakIndex === 0) {
        // If the maximum element is the first element, subtract the second and the last elements from it.
        workingArray[peakIndex] = workingArray[peakIndex] - workingArray[1] - workingArray[arraySize - 1];
    } else if (peakIndex === (arraySize - 1)) {
        // If the maximum element is the last element, subtract the second-to-last and the first elements from it.
        workingArray[peakIndex] = workingArray[peakIndex] - workingArray[arraySize - 2] - workingArray[0];
    } else {
        // If the maximum element is anywhere in the middle, subtract its immediate left and right neighbors.
        workingArray[peakIndex] = workingArray[peakIndex] - workingArray[peakIndex - 1] - workingArray[peakIndex + 1];
    }

    // Increment the operation counter after each transformation.
    operationCount++;

    // Compare the current state of the working array with the target array.
    // JSON.stringify is used for a deep comparison of array contents.
    if (JSON.stringify(workingArray) === JSON.stringify(targetArray)) {
        // If the arrays match, the transformation is complete, so break out of the loop.
        break;
    }
}

// Output the total number of operations performed to reach the target array.
console.log(operationCount);
