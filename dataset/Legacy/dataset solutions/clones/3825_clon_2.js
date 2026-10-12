'use strict';

function ProcessInput(rawData) {
    // Parse the incoming string data into an integer value
    let numericValue = Number.parseInt(rawData.trim());

    // If the processed number is less than one, exit early
    if (numericValue < 1) {
        return;
    }

    // Iterate downwards from the given number to find the largest perfect square
    for (let currentNumber = numericValue; currentNumber > 0; currentNumber--) {
        // Check if the square root of the current number is an integer
        if (Math.sqrt(currentNumber) % 1 === 0) {
            // If it is a perfect square, print it and terminate the function
            console.log('%d', currentNumber);
            return;
        }
    }
}

// The following line handles reading from standard input and invoking the main processing function.
// It should not be altered to maintain compatibility with the execution environment.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
