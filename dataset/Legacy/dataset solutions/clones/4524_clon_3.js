"use strict";

function checkDivisibilityByFour(valueToCheck) {
    const requiredDivisor = 4;
    return valueToCheck % requiredDivisor === 0;
}

function processInputData(rawInputString) {
    // Step 1: Remove all whitespace characters from the raw input string.
    const trimmedInputString = rawInputString.replace(/\s/g, '');

    // Step 2: Convert the cleaned string into a numerical representation.
    const numericalValue = Number(trimmedInputString);

    // Step 3: Determine if the numerical value is perfectly divisible by four using a helper.
    const isPerfectlyDivisible = checkDivisibilityByFour(numericalValue);

    // Step 4: Prepare the final output message based on the divisibility check.
    let finalResponseMessage;
    if (isPerfectlyDivisible) {
        finalResponseMessage = 'YES';
    } else {
        finalResponseMessage = 'NO';
    }

    // Step 5: Print the determined message to the console.
    console.log(finalResponseMessage);
}

// Entry point: Read input from standard input and pass it to the processing function.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
