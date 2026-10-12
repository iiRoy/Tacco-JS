"use strict";

const processInput = (inputData) => {
    const parsedLimit = parseInt(inputData.trim().split("\n")[0]);

    let foundCount = 0;

    // Utility function to determine if a number contains all required digits (3, 5, 7).
    // This uses a bitmask approach, which is different from the original's string-based indexOf.
    const verifyDigits = (currentValue) => {
        let digitFlags = 0; // Bit 0 for '3', Bit 1 for '5', Bit 2 for '7'
        let tempValue = currentValue;

        if (tempValue === 0) return false; // Zero doesn't contain digits 3, 5, 7

        while (tempValue > 0) {
            const digit = tempValue % 10;
            if (digit === 3) {
                digitFlags |= (1 << 0); // Set 0th bit
            } else if (digit === 5) {
                digitFlags |= (1 << 1); // Set 1st bit
            } else if (digit === 7) {
                digitFlags |= (1 << 2); // Set 2nd bit
            } else {
                // If any other digit is present, it's not a valid 753-number candidate
                // This check is actually redundant if the generation logic only uses 3,5,7
                // but it's a robust check for the digit presence.
            }
            tempValue = Math.floor(tempValue / 10);
        }
        // Check if all three bits are set (binary 111, which is decimal 7)
        return digitFlags === 7;
    };

    // Recursive function to generate numbers composed of 3, 5, 7 and count valid ones.
    // This replaces the original's iterative array building and separate filtering loops.
    const generateNumbersRecursively = (currentNumber) => {
        // If the current number exceeds the overall limit, stop this branch of recursion.
        if (currentNumber > parsedLimit) {
            return;
        }

        // If the current number is valid (not 0 and contains all 3, 5, 7), increment the counter.
        if (currentNumber > 0 && verifyDigits(currentNumber)) {
            foundCount++;
        }

        // Define the digits to append.
        const nextDigits = [3, 5, 7];

        // Recursively call for each possible next digit.
        // The condition `currentNumber === 0` ensures that initial single-digit numbers (3, 5, 7)
        // are always generated, even if they are greater than `parsedLimit` (e.g., if parsedLimit is 1).
        // The `currentNumber > parsedLimit` check at the start of the next call will handle pruning.
        for (const digit of nextDigits) {
            const nextValue = currentNumber * 10 + digit;
            if (currentNumber === 0 || nextValue <= parsedLimit) {
                generateNumbersRecursively(nextValue);
            }
        }
    };

    // Initiate the recursive generation process.
    // Starting with 0 conceptually represents an empty number, from which 3, 5, 7 will be built.
    generateNumbersRecursively(0);

    console.log(foundCount);
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
