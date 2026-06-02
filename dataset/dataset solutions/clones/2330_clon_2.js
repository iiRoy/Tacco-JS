"use strict";

/*
 * This module processes a sequence of numbers to find a specific pattern.
 * It identifies how many elements need to be removed to achieve a consecutive sequence starting from 1.
 */
const processInput = (inputData) => {
    // Clean up the raw input string and split it into lines.
    // The first line contains the count of numbers, the second line contains the numbers themselves.
    inputData = inputData.trim().split("\n");

    // Parse the first line to get the total number of elements.
    const totalElements = parseInt(inputData[0], 10); // Explicitly specify radix 10 for safety.

    // Parse the second line, splitting by space and converting each part to an integer.
    const numberArray = inputData[1].split(" ").map((currentNum) => parseInt(currentNum, 10));

    // Initialize a counter to track the expected consecutive number.
    // This counter represents the next number we are looking for in the sequence (1, 2, 3, ...).
    let matchCount = 0;

    // Iterate through each element of the number array.
    for (let idx = 0; idx < totalElements; idx++) {
        // Check if the current array element matches the value we are currently expecting in our sequence.
        // For example, if matchCount is 0, we expect 1. If matchCount is 1, we expect 2, and so on.
        if (numberArray[idx] === (matchCount + 1)) {
            // If a match is found, increment our expected sequence counter.
            // This means we successfully found the next number in the 1-based consecutive sequence.
            matchCount++;
        }
    }

    // After checking all numbers, determine the output based on the matchCount.
    if (matchCount !== 0) {
        // If matchCount is not zero, it means we found at least one number in the sequence (i.e., '1').
        // The result is the total number of elements minus the count of successfully matched consecutive numbers.
        // This represents the number of elements that are "out of place" or need to be removed.
        console.log(totalElements - matchCount);
    } else {
        // If matchCount is zero, it means we didn't even find the number '1' in the array.
        // In this scenario, no consecutive sequence starting from 1 can be formed.
        // The problem specifies outputting -1 for this case.
        console.log(-1);
    }
};

// Read input from standard input and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
