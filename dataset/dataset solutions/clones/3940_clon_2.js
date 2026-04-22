'use strict'; // Enforces strict code parsing for better error detection.

/*
 * This segment is responsible for acquiring raw input data.
 * It uses Node.js's file system module to read from standard input.
 */
const fileSystemModule = require('node:fs'); // Accesses Node.js built-in file system functionalities.

const inputDataCollection = fileSystemModule
  .readFileSync('/dev/stdin', 'utf8') // Reads the entire content of stdin as a UTF-8 string.
  .split(/\s/); // Divides the string into an array of substrings using any whitespace character as a separator.

/**
 * A dedicated function to print the calculated numerical outcome to the standard output.
 * This abstracts the direct call to console.log.
 * @param {number} valueToDisplay The final numeric result that needs to be shown.
 */
const outputToTerminal = (valueToDisplay) => {
    // Prints the provided numeric value to the console.
    console.log(valueToDisplay);
};

/*
 * The primary logic handler for processing the input values.
 * It determines the minimum costs for two separate categories and sums them up.
 * @param {string[]} inputStringArray An array of string representations of numbers.
 */
const processInputValues = (inputStringArray) => {

    // Converts the first four string elements of the array into numbers.
    // Using parseFloat allows for potential decimal inputs, making it a subtle type handling change.
    const [
        firstOptionCost,  // Represents the first cost alternative for the initial item.
        secondOptionCost, // Represents the second cost alternative for the initial item.
        thirdOptionCost,  // Represents the first cost alternative for the subsequent item.
        fourthOptionCost  // Represents the second cost alternative for the subsequent item.
    ] = inputStringArray.map(currentStringValue => parseFloat(currentStringValue)); // Transforms each string to a floating-point number.

    // Calculates the lowest charge for the first service category (e.g., train travel).
    const railwayServiceCharge = firstOptionCost < secondOptionCost
        ? firstOptionCost  // If the first choice is more economical.
        : secondOptionCost; // Otherwise, the second choice is selected.

    // Calculates the lowest charge for the second service category (e.g., bus travel).
    const roadServiceCharge = thirdOptionCost < fourthOptionCost
        ? thirdOptionCost  // If the third choice is more economical.
        : fourthOptionCost; // Otherwise, the fourth choice is selected.

    // Computes the grand total of the two minimum service charges.
    const finalCombinedCharge = railwayServiceCharge + roadServiceCharge;

    // Utilizes the custom output function to display the aggregated result.
    outputToTerminal(finalCombinedCharge);
};

// Initiates the entire data processing workflow by invoking the main logic function
// with the previously collected input data.
processInputValues(inputDataCollection);