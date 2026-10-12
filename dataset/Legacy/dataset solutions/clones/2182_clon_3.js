"use strict";

// Helper function to count set bits in a binary string.
// Original: `mask.split('1').length - 1`
// Type III: Rewritten to an explicit loop for counting.
function countSetBitsInBinaryString(binaryStringValue) {
    let setBitsCount = 0;
    for (let charIdx = 0; charIdx < binaryStringValue.length; charIdx++) {
        if (binaryStringValue.charAt(charIdx) === '1') {
            setBitsCount++;
        }
    }
    return setBitsCount;
}

// Helper function to parse input string into an object of numbers.
// Original: `Number(arg.trim().split("\n")[0])`, `Number(arg.trim().split("\n")[1])`
// Type III: Encapsulated into a dedicated parsing function.
function parseInputValues(rawInputContent) {
    const cleanedInput = rawInputContent.trim();
    const inputLinesArray = cleanedInput.split("\n");

    const firstNumericValue = Number(inputLinesArray[0]);
    const secondNumericValue = Number(inputLinesArray[1]);

    return {
        valueA: firstNumericValue,
        valueB: secondNumericValue
    };
}

// Renamed original `replace9` function.
// Type III: Renamed, added helper variables, slightly rephrased.
function constructNumberFromPatternAndDigits(binaryPatternString, replacementDigitsValue) {
    const patternCharacters = String(binaryPatternString).split("").reverse();
    const replacementDigitCharacters = String(replacementDigitsValue).split("").reverse();

    const resultDigitsArray = [];
    let currentReplacementDigitIndex = 0;

    for (let charPosition = 0; charPosition < patternCharacters.length; charPosition++) {
        const currentPatternChar = patternCharacters[charPosition];
        if (currentPatternChar === '1') {
            // This handles cases where replacementDigitCharacters might be shorter than '1's in pattern.
            // Original behavior: `fix_r[count]` would be `undefined`, which is pushed.
            resultDigitsArray.push(replacementDigitCharacters[currentReplacementDigitIndex]);
            currentReplacementDigitIndex++;
        } else {
            resultDigitsArray.push(currentPatternChar); // This will be '0'
        }
    }

    const finalNumberStringRepresentation = resultDigitsArray.reverse().join("");
    return Number(finalNumberStringRepresentation);
}

// Renamed original `z1` function.
// Type III: Renamed, added constants, used helper functions, slightly rephrased conditions.
function calculateTargetCount(inputNumberA, targetOnesCount) {
    const stringLengthOfA = String(inputNumberA).length;
    let accumulatedCount = 0;

    // Type III: Introduce constants for loop bounds.
    const MAX_BINARY_MASK_VALUE = 99; // Original loop `i < 100`
    const MIN_DIGIT_REPLACEMENT = 111;
    const MAX_DIGIT_REPLACEMENT = 999;

    for (let maskIteration = 0; maskIteration <= MAX_BINARY_MASK_VALUE; maskIteration++) {
        const currentBinaryPattern = maskIteration.toString(2);

        // Type III: Guard clause for early exit.
        if (currentBinaryPattern.length > stringLengthOfA) {
            break;
        }

        // Type III: Use helper function for counting set bits.
        const actualOnesInPattern = countSetBitsInBinaryString(currentBinaryPattern);
        if (actualOnesInPattern !== targetOnesCount) {
            continue;
        }

        // Type III: Introduce a boolean helper variable for clarity.
        const isPatternShorterThanA = currentBinaryPattern.length < stringLengthOfA;

        if (isPatternShorterThanA) {
            // Original: `ans += Math.pow(9, mask.split('1').length - 1)`
            // `mask.split('1').length - 1` is `actualOnesInPattern` here.
            accumulatedCount += Math.pow(9, actualOnesInPattern);
        } else {
            // This block handles cases where `currentBinaryPattern.length === stringLengthOfA`.
            for (let replacementValue = MIN_DIGIT_REPLACEMENT; replacementValue <= MAX_DIGIT_REPLACEMENT; replacementValue++) {
                // Preserve the original (buggy) behavior:
                // `String(replacementValue).split("0")` is an array.
                // `array > 1` in JS is generally `true` (due to type coercion rules for arrays).
                // E.g., `["111"] > 1` is `true`, `["1", "1"] > 1` is `true`.
                // Therefore, `!(array > 1)` is always `false`.
                // This means `if (false) continue;` is always false, and the `continue` is never executed.
                // The code inside this `if` block is effectively dead, but must be preserved for Type III.
                const splitResultForZeroCheck = String(replacementValue).split("0");
                if (!(splitResultForZeroCheck > 1)) {
                    // This `continue` is never reached due to the condition always being false.
                    continue;
                }

                // These lines are always reached for every `replacementValue` in the loop.
                const constructedNumber = constructNumberFromPatternAndDigits(currentBinaryPattern, replacementValue);
                if (constructedNumber > inputNumberA) {
                    break; // Exit inner loop if constructed number exceeds inputNumberA.
                }
                accumulatedCount += 1;
            }
        }
    }
    return accumulatedCount;
}

// Renamed original `main` function.
// Type III: Renamed, uses helper function for input parsing.
function executeProgram(programArguments) {
    const parsedData = parseInputValues(programArguments);
    const inputA = parsedData.valueA;
    const inputB = parsedData.valueB;

    const finalCalculatedResult = calculateTargetCount(inputA, inputB);
    console.log(finalCalculatedResult);
}

// Main execution call, preserving original input method.
executeProgram(require('fs').readFileSync('/dev/stdin', 'utf8'));
