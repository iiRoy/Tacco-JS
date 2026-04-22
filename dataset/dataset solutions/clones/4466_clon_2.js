"use strict"; /* This directive enforces strict parsing and error handling in the JavaScript runtime. */

// This function calculates the greatest common divisor (GCD) for a collection of integer values.
const findGreatestCommonDivisorOfCollection = (numericCollection) => {
    let collectionLength;       /* Stores the total number of items in the input collection. */
    let currentCommonDivisor;   /* An accumulator variable for the GCD computation. */
    let nextElementValue;       /* Holds the value of the current element being processed during iteration. */

    collectionLength = numericCollection.length;            /* Retrieve the total count of elements. */
    currentCommonDivisor = numericCollection[0];            /* Initialize the GCD with the first number in the collection. */

    // Iterate through the remaining elements of the collection, starting from the second one.
    for (let indexCounter = 1; indexCounter < collectionLength; indexCounter++) {
        nextElementValue = numericCollection[indexCounter]; /* Get the value of the next number in the sequence. */
        currentCommonDivisor = determineGreatestCommonDivisor(currentCommonDivisor, nextElementValue); /* Update the GCD by computing it with the next element. */
    }

    return currentCommonDivisor; /* Return the final computed greatest common divisor of all numbers. */
};

// A recursive helper function to compute the greatest common divisor of two individual integers using the Euclidean algorithm.
const determineGreatestCommonDivisor = (val1, val2) => {
    // If the first value is not zero, recursively call with (remainder of val2 / val1, val1).
    // Otherwise, the second value is the GCD.
    return val1
        ? determineGreatestCommonDivisor(val2 % val1, val1)
        : val2;
};

// The primary function responsible for processing input, executing the main logic, and producing an output.
const executeSolution = (rawInputData) => {
    rawInputData = rawInputData.trim().split("\n"); /* Clean up input: remove leading/trailing whitespace and split into an array of lines. */

    /* Parse the first line of the input to extract two important integer parameters. */
    const countVal = parseInt(rawInputData[0].split(" ")[0]);    // The first numeric parameter (often 'N').
    const targetValue = parseInt(rawInputData[0].split(" ")[1]); // The second numeric parameter (often 'K').

    // Process the second line of input: split by spaces, convert each part to an integer, and sort the resulting numbers in descending order.
    let sortedNumbers = rawInputData[1].split(" ")
                                       .map(parsedNumber => parseInt(parsedNumber))
                                       .sort((first, second) => second - first);

    const highestValue = sortedNumbers[0]; // Identify the largest number from the sorted collection.
    let resultantGcd = findGreatestCommonDivisorOfCollection(sortedNumbers); // Calculate the GCD of all numbers in the collection.

    /* Check a specific condition: if the largest number is less than the target value. */
    if (highestValue < targetValue) {
        console.log("IMPOSSIBLE"); // Print "IMPOSSIBLE" if the condition is met.
        return;                    // Exit the function early.
    }

    // Finally, determine if the target value is perfectly divisible by the computed GCD.
    // Output "POSSIBLE" if it is, otherwise "IMPOSSIBLE".
    console.log(targetValue % resultantGcd === 0 ? "POSSIBLE" : "IMPOSSIBLE");
};

// Invoke the main solution function, providing it with input read synchronously from standard input.
executeSolution(require('fs').readFileSync('/dev/stdin', 'utf8'));