"use strict";

// This module provides utilities for interacting with the file system.
const fileSystemModule = require("fs");

// Synchronously read the entire content from the standard input stream.
// The path "/dev/stdin" is a common convention for standard input in Unix-like systems.
// The "utf8" encoding ensures that text data is correctly interpreted.
let rawInputContent = fileSystemModule.readFileSync("/dev/stdin", "utf8");

// Divide the raw input string into an array of individual lines.
// Each line is separated by a newline character.
let inputLinesArray = rawInputContent.split("\n");

// The first line of input is expected to contain the total number of elements.
// This value will be used as the upper bound for iteration.
let totalElementsCount = inputLinesArray[0];

// The second line contains a sequence of numbers, separated by spaces.
// First, split this line into an array of string representations of numbers.
// Then, use the `map` function with the `Number` constructor to convert each string to an actual number.
let numbersCollection = inputLinesArray[1].split(" ").map(Number);

// Initialize a variable to store the final computed result.
// This variable will accumulate the count of specific elements.
let resultAccumulator = 0;

// Begin a loop that iterates through the `numbersCollection` array.
// The loop runs from the first element (index 0) up to, but not including, `totalElementsCount`.
for (let currentIdx = 0; currentIdx < totalElementsCount; currentIdx++) {
  // Check two conditions simultaneously for the current element:
  // 1. Is the current index an even number? (i.e., remainder when divided by 2 is 0)
  // 2. Is the number at the current index in `numbersCollection` an odd number? (i.e., remainder when divided by 2 is 1)
  if (currentIdx % 2 === 0 && numbersCollection[currentIdx] % 2 === 1) {
    // If both conditions are met, increment the `resultAccumulator`.
    // This means we found an odd number at an even position.
    resultAccumulator++;
  }
}

// Print the final accumulated result to the console.
// This is the required output of the program.
console.log(resultAccumulator);
