'use strict'; // Enable strict mode for better error handling and cleaner code

// Define constants for parsing the input string
const TOKEN_BREAKER = " "; // Separator character for input values

const ALPHA_POS = 0; // Index for the first numerical component
const BETA_POS = 1;  // Index for the second numerical component
const GAMMA_POS = 2; // Index for the third numerical component
const KEY_POS = 3;   // Index for the key factor determining the sign

/**
 * Processes a given string of numerical data, performs a calculation,
 * and prints the result to the console.
 * @param {string} dataString - The input string containing space-separated numbers.
 */
const handleInputData = dataString => {
    // Split the input string into individual string components
    const componentStrings = dataString.split(TOKEN_BREAKER);

    // Convert the string components to integer numbers
    let firstNum = parseInt(componentStrings[ALPHA_POS], 10);
    let secondNum = parseInt(componentStrings[BETA_POS], 10);
    let thirdNum = parseInt(componentStrings[GAMMA_POS], 10); // This value is parsed but not used in the final calculation
    let computedDifference = firstNum - secondNum; // Calculate the initial difference

    // Get the key value that determines the final sign
    const parityCheckVal = parseInt(componentStrings[KEY_POS], 10);

    // Output the result based on the parity of the key value
    console.log(
        (parityCheckVal % 2 === 0)
            ? computedDifference
            : -computedDifference
    );
};


handleInputData(
    require("fs").readFileSync("/dev/stdin", "utf8") // Read input from standard input
);