'use strict';

// Function to transform an array of string numbers into a new array
// by subtracting (index + 1) from each parsed integer.
const transformArray = (numArray) => {
  return numArray.reduce((accumulator, currentElement, idx) => {
    // Convert string to integer and perform the subtraction
    const transformedValue = parseInt(currentElement, 10) - (idx + 1);
    return [...accumulator, transformedValue];
  }, []); // Initialize accumulator as an empty array
};

// Function to calculate the "sadness" score based on a list of numbers and a median value.
// It sums the absolute differences between each number and (median + its index + 1).
const calculateSorrow = (dataArray, midValue) => {
  return dataArray.reduce((totalSorrow, currentVal, pos) => {
    // Calculate the target value for the current position
    const target = midValue + pos + 1;
    // Add the absolute difference to the running total
    return totalSorrow + Math.abs(parseInt(currentVal, 10) - target);
  }, 0); // Start the total sorrow at zero
};

// Read input from standard input, assuming it's a file path.
// The input is split by newline characters.
const rawData = require("fs").readFileSync("/dev/stdin", "utf8").split("\n");

// Parse the first line of input as the total count of items.
const itemCount = parseInt(rawData[0], 10);

// Split the second line of input into an array of string numbers.
const initialNumbers = rawData[1].split(" ");

// Process the initial numbers and then sort the resulting array numerically.
const modifiedNumbers = transformArray(initialNumbers).sort((a, b) => a - b);

// Determine the central value (median) from the sorted, modified numbers.
// This uses floor division to get the middle index.
const centralValue = modifiedNumbers[Math.floor(itemCount / 2)];

// Calculate the minimum sorrow using the original input list and the derived central value.
const minimumSorrow = calculateSorrow(initialNumbers, centralValue);

// Output the final calculated minimum sorrow to the console.
console.log(minimumSorrow);
