"use strict"; // Enforce strict mode for cleaner code

/**
 * Main function to process the input and solve the problem.
 * @param {string} inputString - The raw input string from stdin.
 */
const solveProblem = (inputString) => {
    // Trim whitespace and split the input into lines.
    // For this problem, we only expect one line of input.
    const processedLines = inputString.trim().split("\n");

    // Extract the first line and convert it into an array of characters.
    const inputChars = processedLines[0].split("");

    // Define the modulus value for calculations to prevent overflow.
    const primeModulus = 1000000007;

    // Initialize a 2D array (dynamic programming table).
    // dpTable[i][j] will store the count of ways to form a number
    // using the first 'i' characters that has a remainder 'j' when divided by 13.
    let dpTable = [];

    // Populate the dpTable with arrays, each initialized with zeros.
    // The size is (inputChars.length + 1) rows by 13 columns (for remainders 0-12).
    for (let charIndex = 0; charIndex < inputChars.length + 1; charIndex++) {
        dpTable.push(Array(13).fill(0));
    }

    // Base case: An empty prefix (0 characters) has a remainder of 0,
    // and there's one way to achieve this (by having no digits).
    dpTable[0][0] = 1;

    // Iterate through each character of the input string.
    for (let charIndex = 0; charIndex < inputChars.length; charIndex++) {
        // Determine the current character's value.
        // If it's '?', it can be any digit from 0-9, so we use -1 as a flag.
        // Otherwise, parse the character to an integer.
        const parsedChar = inputChars[charIndex] === "?" ? -1 : parseInt(inputChars[charIndex]);

        // Iterate through all possible digits (0-9) that the current character could represent.
        for (let currentDigitValue = 0; currentDigitValue < 10; currentDigitValue++) {
            // If the current character is not '?' and it doesn't match the current digit value,
            // then this path is invalid, so skip to the next digit.
            if (parsedChar !== -1 && parsedChar !== currentDigitValue) {
                continue;
            }

            // Iterate through all possible previous remainders (0-12).
            for (let prevRemainder = 0; prevRemainder < 13; prevRemainder++) {
                // If there were ways to achieve 'prevRemainder' with 'charIndex' characters,
                // then we can extend those ways by appending 'currentDigitValue'.
                // Calculate the new remainder: (prevRemainder * 10 + currentDigitValue) % 13.
                // Add the count from the previous state to the current state.
                dpTable[charIndex + 1][(prevRemainder * 10 + currentDigitValue) % 13] += dpTable[charIndex][prevRemainder];
            }
        }

        // After processing all digits for the current character,
        // apply the modulus to all counts in the current row to keep numbers within bounds.
        for (let currentRemainder = 0; currentRemainder < 13; currentRemainder++) {
            dpTable[charIndex + 1][currentRemainder] %= primeModulus;
        }
    }

    // The final answer is the number of ways to form a number using all characters
    // that has a remainder of 5 when divided by 13.
    console.log(dpTable[inputChars.length][5]);
};

// Read the input from standard input and pass it to the main function.
solveProblem(require('fs').readFileSync('/dev/stdin', 'utf8'));
