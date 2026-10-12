'use strict';

// Define constants for parsing input data
const SEP_CHAR = " "; // Character used to separate values in the input string
const FIRST_POS = 0; // Array index for the initial value 'a'
const SECOND_POS = 1; // Array index for the initial value 'b'
const THIRD_POS = 2; // Array index for the initial value 'c' (not used in final computation)
const MOD_CHECK_POS = 3; // Array index for the value 'K' used in the modulus check

/**
 * Processes a raw input string to perform a specific calculation.
 * @param {string} rawData - The input string containing space-separated numbers.
 */
const handleInputData = (rawData) => {
    // Split the input string into an array of string values
    const parsedValues = rawData.split(SEP_CHAR);

    // Parse the required values from the array into integers
    let valA = parseInt(parsedValues[FIRST_POS], 10); // First operand
    let valB = parseInt(parsedValues[SECOND_POS], 10); // Second operand
    let valC = parseInt(parsedValues[THIRD_POS], 10); // Third operand (not used in the final calculation)

    // Calculate the initial difference
    let resultDiff = valA - valB;

    // Get the modulus check value
    const modulusVal = parseInt(parsedValues[MOD_CHECK_POS], 10);

    // Determine the final output based on whether modulusVal is even or odd
    // If modulusVal is even, output resultDiff; otherwise, output the negative of resultDiff
    console.log(modulusVal % 2 === 0 ? resultDiff : -resultDiff);
};

// Read input from standard input and pass it to the processing function
handleInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
