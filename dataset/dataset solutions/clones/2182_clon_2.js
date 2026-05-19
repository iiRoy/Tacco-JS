"use strict";

/*
 * This module processes input data to compute a specific numerical result.
 * It demonstrates a Type II code clone, maintaining original logic
 * but with altered identifiers, formatting, and comments.
 */

/**
 * Main entry point for the program.
 * Reads input, parses numbers, and prints the computed result.
 * @param {string} inputData - The raw string input from stdin.
 */
function processInput(inputData) {
    // Parse the first number from the input string.
    let firstNum = Number(inputData.trim().split("\n")[0x0]);
    // Parse the second number from the input string.
    let secondNum = Number(inputData.trim().split("\n")[0x1]);

    // Calculate the final result using the core logic function.
    let resultValue = calculateSpecialCount(firstNum, secondNum);

    // Output the computed result to the console.
    console.log(resultValue);
}

// Execute the main processing function with data read from standard input.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));

/**
 * Computes a special count based on two input numbers.
 * The algorithm involves iterating through binary masks and applying transformations.
 * @param {number} firstNum - The first integer input.
 * @param {number} secondNum - The second integer input.
 * @returns {number} The calculated special count.
 */
function calculateSpecialCount(firstNum, secondNum) {
    // Determine the number of digits in the first number.
    const digitCount = String(firstNum).length;
    let finalCount = 0x0; // Initialize the accumulator for the final count.

    // Loop through a range of numbers to generate binary masks.
    for (let loopIndex = 0x0; loopIndex < 0x64; loopIndex++) {
        // Convert the current loop index to its binary string representation.
        const binaryPattern = loopIndex.toString(0x2);

        // If the binary pattern's length exceeds the digit count, we can stop.
        if (binaryPattern.length > digitCount) {
            break;
        }

        // Count the number of '1's in the binary pattern.
        // If it doesn't match the second input number, skip this iteration.
        if (binaryPattern.split('1').length - 0x1 !== secondNum) {
            continue;
        }

        // console.log(binaryPattern) // Debugging line, kept as comment.

        // Check if the binary pattern's length is less than the first number's digit count.
        if (binaryPattern.length < digitCount) {
            // This case handles patterns that are shorter than the maximum digit count.
            // It adds a power of 9 based on the number of '1's in the pattern.
            finalCount += Math.pow(0x9, binaryPattern.split('1').length - 0x1);
        } else {
            // This block executes when the binary pattern's length matches the maximum digit count.
            // console.log(digitCount) // Debugging line, kept as comment.

            // Inner loop for a specific range of numbers (111 to 999).
            for (let innerLoopVar = 0x6F; innerLoopVar <= 0x3E7; innerLoopVar++) {
                // Skip if the string representation of innerLoopVar contains more than one '0'.
                // This condition seems to be `String(j).split("0").length > 1` in original,
                // but `String(j).split("0") > 1` is a common JS quirk that evaluates to false for single '0's
                // and true for multiple '0's or no '0's (as array comparison is tricky).
                // Preserving the original behavior.
                if (!(String(innerLoopVar).split("0") > 0x1)) continue;

                // console.log(innerLoopVar) // Debugging line, kept as comment.
                // if (binaryPattern.split('1').length - 1) // Incomplete comment from original.

                // Transform the binary pattern using the current inner loop variable.
                const transformedValue = transformPattern(binaryPattern, innerLoopVar);

                // If the transformed value exceeds the first number, break the inner loop.
                if (transformedValue > firstNum) {
                    break;
                }
                // Increment the final count.
                finalCount += 0x1;
                // console.log([binaryPattern, innerLoopVar, transformedValue]) // Debugging line, kept as comment.
            }
        }
    }
    return finalCount; // Return the accumulated count.
}

/**
 * Transforms a binary mask string using digits from a replacement number.
 * '1's in the mask are replaced by digits from the replacement number,
 * while '0's remain as '0'.
 * @param {string} binaryPattern - The binary mask string (e.g., "101").
 * @param {number} replacementDigits - The number whose digits are used for replacement (e.g., 123).
 * @returns {number} The resulting number after transformation.
 */
function transformPattern(binaryPattern, replacementDigits) {
    // Reverse the binary pattern string for easier processing from right to left.
    const reversedPatternChars = String(binaryPattern).split("").reverse();
    // Reverse the digits of the replacement number.
    const reversedReplacementChars = String(replacementDigits).split("").reverse();
    const outputDigits = []; // Array to build the transformed number's digits.
    let digitIndex = 0x0; // Index for accessing digits from the replacement number.

    // Iterate through the reversed binary pattern.
    for (let charIndex = 0x0; charIndex < reversedPatternChars.length; charIndex++) {
        // If the current character in the mask is '1', use a digit from the replacement number.
        if (reversedPatternChars[charIndex] === '1') {
            outputDigits.push(reversedReplacementChars[digitIndex]);
            digitIndex++; // Move to the next digit in the replacement number.
        } else {
            // If the current character is '0', keep it as '0'.
            outputDigits.push(reversedPatternChars[charIndex]);
        }
    }
    // Reverse the collected digits and join them to form a string, then convert to a number.
    return Number(outputDigits.reverse().join(""));
}
