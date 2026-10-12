'use strict';

/*
 This script processes numerical input to calculate a specific value.
 It adheres to strict mode for better code quality.
*/

function ProcessInput(rawData) {
    // Parse the raw input string into an array of integers.
    // The input is expected to be space-separated numbers.
    let parsedValues = rawData.trim().split(' ').map((item) => parseInt(item, 10));

    // Extract the first three numerical components from the parsed array.
    let firstVal = parsedValues.shift(); // Represents 'a' from the original problem.
    let secondVal = parsedValues.shift(); // Represents 'b' from the original problem.
    let timeLimit = parsedValues.shift(); // Represents 't' from the original problem.

    // Perform the core calculation:
    // Calculate how many full intervals of 'firstVal' fit into 'timeLimit + 0.5',
    // then multiply by 'secondVal'. The 0.5 is for rounding up effectively.
    let finalResult = Math.floor((timeLimit + 0.5) / firstVal) * secondVal;

    // Output the computed result to the console.
    console.log(finalResult);
}

// The following line handles reading input from standard input and invoking the main processing function.
// It should not be modified as it's part of the execution environment setup.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
