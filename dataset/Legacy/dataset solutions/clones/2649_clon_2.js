"use strict";

// This script processes input from standard input to perform array manipulations.
// It reads three lines: an integer N, and two arrays A and B.
// The goal is to transform array B into array A by repeatedly applying a specific operation.

const inputContent = require('fs').readFileSync('/dev/stdin', 'UTF-8');

// Split the entire input string into individual lines.
const contentLines = inputContent.split('\n');

// The first line contains the size of the arrays.
const arraySize = parseInt(contentLines[0]);

// The second line contains space-separated integers for the target array.
const targetArray = contentLines[1].split(' ').map(element => parseInt(element));

// The third line contains space-separated integers for the initial array.
const initialArray = contentLines[2].split(' ').map(element => parseInt(element));

let operationCount = 0; // Counter for the number of operations performed.

// Create a mutable copy of the initial array to work with.
let workingArray = [...initialArray]; // Using spread to ensure a deep copy for primitive elements.

// Main loop to transform the array.
while (true) {
    // Find the index of the maximum element in the current working array.
    // This is the element that will be modified in this iteration.
    const peakIndex = workingArray.indexOf(Math.max(...workingArray));

    // Apply the transformation rule based on the position of the maximum element.
    if (peakIndex === 0) {
        // If the maximum is at the beginning, subtract the second and last elements.
        workingArray[peakIndex] = workingArray[peakIndex] - workingArray[1] - workingArray[arraySize - 1];
    } else if (peakIndex === (arraySize - 1)) {
        // If the maximum is at the end, subtract the second-to-last and first elements.
        workingArray[peakIndex] = workingArray[peakIndex] - workingArray[arraySize - 2] - workingArray[0];
    } else {
        // If the maximum is in the middle, subtract its immediate neighbors.
        workingArray[peakIndex] = workingArray[peakIndex] - workingArray[peakIndex - 1] - workingArray[peakIndex + 1];
    }

    // Increment the operation counter after each transformation.
    operationCount++;

    // Check if the current working array matches the target array.
    // JSON.stringify is used for deep comparison of array contents.
    if (JSON.stringify(workingArray) === JSON.stringify(targetArray)) {
        console.log(operationCount); // If matched, print the count and exit.
        break;
    }

    // Check if any element in the working array has become less than 1.
    // This indicates an impossible transformation.
    if (workingArray.find(val => val < 1)) {
        console.log(-1); // Print -1 to indicate failure and exit.
        break;
    }
}
