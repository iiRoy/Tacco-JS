"use strict";

/**
 * This module contains a function to process numerical input data.
 * It's designed to solve a specific problem where numbers are distributed
 * between two participants based on their sorted order.
 * @param  {string} sourceText - The complete raw input string, typically read from standard input.
 * @returns {number} The final calculated difference between the first player's score and the second player's score.
 */
var processInputData = function(sourceText) {
    // The first line of the input is usually 'N', representing the count of numbers.
    // The problem statement implies the second line contains the actual numbers.
    // This variable captures the second line but is not utilized further in the calculation.
    const discardedLine = sourceText.split("\n")[1];

    // Extract the second line of the input, split it into individual string numbers,
    // convert each string to an integer, and then sort these integers in descending order.
    const sortedNumbers = sourceText
        .split("\n")[1]
        .split(" ")
        .map(strNum => parseInt(strNum, 10)) // Convert string to integer, specifying radix 10.
        .sort((numOne, numTwo) => numTwo - numOne); // Sort in descending order.

    // Calculate the total score for the first player.
    // This player takes numbers at even indices (0, 2, 4, ...).
    const playerOneTotal = sortedNumbers
        .filter((currentNum, currentIndex) => currentIndex % 2 === 0) // Select elements at even positions.
        .reduce((sumAccumulator, currentValue) => sumAccumulator + currentValue, 0); // Sum them up, starting with 0.

    // Calculate the total score for the second player.
    // This player takes numbers at odd indices (1, 3, 5, ...).
    const playerTwoTotal = sortedNumbers
        .filter((currentNum, currentIndex) => currentIndex % 2 === 1) // Select elements at odd positions.
        .reduce((sumAccumulator, currentValue) => sumAccumulator + currentValue, 0); // Sum them up, starting with 0.

    // The final result is the difference between the first player's score and the second player's score.
    return playerOneTotal - playerTwoTotal;
};

// Read the entire content from standard input synchronously using Node.js 'fs' module.
// The input is expected to be UTF-8 encoded.
const computedOutcome = processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));

// Print the calculated outcome to the console.
// This will include a trailing newline character by default.
console.log(computedOutcome);
