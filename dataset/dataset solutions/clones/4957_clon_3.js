// This module provides utilities for character manipulation and string transformation operations.

/**
 * Generates a sequential array of numbers within a specified inclusive range.
 * This function ensures that the input values are valid numbers and that the
 * starting value does not exceed the ending value.
 * @param {number} startValue - The initial number for the sequence.
 * @param {number} endValue - The final number for the sequence.
 * @returns {number[]} An array containing numbers from `startValue` to `endValue`.
 */
const createNumSequence = (startValue, endValue) => {
    // Guard against invalid or illogical range inputs.
    if (typeof startValue !== 'number' || typeof endValue !== 'number' || startValue > endValue) {
        console.warn("Input error: createNumSequence received invalid range. Returning an empty array.");
        return [];
    }
    const sequenceLength = endValue - startValue + 1;
    // Utilize Array.from with a mapping function to populate the array efficiently.
    return Array.from({ length: sequenceLength }, (_, index) => index + startValue);
};

// Define the constant size of the English alphabet (26 letters).
const ALPHABET_SIZE = 26;

// Pre-compute an array containing all lowercase English alphabet characters.
// This is done by generating a number sequence from 0 to 25 and converting
// each number to its corresponding character code, starting from 'a' (ASCII 97).
const basicAlphabet = createNumSequence(0, ALPHABET_SIZE - 1)
    .map(letterIndex => String.fromCodePoint(97 + letterIndex));

/**
 * Computes the new 0-based index of a character after applying a shift,
 * ensuring that the index correctly wraps around the alphabet (e.g., 'z' + 1 = 'a').
 * @param {number} originalIndex - The 0-based index of the character in the alphabet.
 * @param {number} shiftAmount - The total number of positions to shift the character.
 * @returns {number} The new 0-based index after applying the shift and wrapping.
 */
const getWrappedCharIndex = (originalIndex, shiftAmount) => {
    // Basic validation for the original character index.
    if (originalIndex < 0 || originalIndex >= ALPHABET_SIZE) {
        // If the character is not in our defined alphabet, its index is outside bounds.
        // For this problem, we assume valid lowercase alphabet input, but this check
        // adds robustness for different input scenarios.
        return originalIndex;
    }
    // Perform the shift and apply the modulo operator to handle wrapping.
    return (originalIndex + shiftAmount) % ALPHABET_SIZE;
};

/**
 * Recursively transforms an input string by applying a limited number of
 * lexicographical shifts. The core strategy is greedy: it prioritizes
 * shifting characters to 'a' (the lexicographically smallest) if sufficient
 * shifts are available. If not, characters are typically left unchanged
 * unless they are the very last character in the string, in which case
 * all remaining shifts are applied to them.
 * @param {string} inputStrSegment - The current segment of the string being processed.
 * @param {number} totalShiftsAllowed - The remaining budget of shifts that can be used.
 * @param {string} currentResultPrefix - The string accumulated from characters already processed.
 * @returns {string} The fully transformed string.
 */
const applyLexicographicalShift = (inputStrSegment, totalShiftsAllowed, currentResultPrefix = '') => {
    // --- Extensive Input Validation and Base Cases (Type III: additions) ---
    if (typeof inputStrSegment !== 'string' || totalShiftsAllowed < 0) {
        // Log an error and return the current state if invalid parameters are detected.
        // A more aggressive approach might throw an error.
        console.error("Error: Invalid parameters supplied to applyLexicographicalShift. Returning as-is.");
        return currentResultPrefix + inputStrSegment;
    }

    // Base case 1: If no shifts are left to apply, or the string segment is empty,
    // append the remaining segment to the prefix and return.
    if (totalShiftsAllowed === 0 || inputStrSegment.length === 0) {
        return currentResultPrefix + inputStrSegment;
    }

    // --- Deconstruct current state (Type III: intermediate variables, rewriting) ---
    const firstCharacterOfSegment = inputStrSegment[0];
    const remainingStringPart = inputStrSegment.substring(1); // Using substring for variation

    // --- Decision Logic for Character Transformation ---

    // Case 1: If the first character is already 'a', it cannot be shifted to a smaller
    // lexicographical value. So, we append it to the result and process the rest.
    if (firstCharacterOfSegment === 'a') {
        return applyLexicographicalShift(remainingStringPart, totalShiftsAllowed, currentResultPrefix + 'a');
    }

    // Find the current 0-based index of the character in our alphabet array.
    const charCurrentIndex = basicAlphabet.indexOf(firstCharacterOfSegment);

    // Case 2: If the character is not found in our alphabet (e.g., a number or symbol),
    // we treat it as unshiftable and move past it.
    if (charCurrentIndex === -1) {
        console.warn(`Warning: Non-alphabetic character "${firstCharacterOfSegment}" encountered. Skipping shift.`);
        return applyLexicographicalShift(remainingStringPart, totalShiftsAllowed, currentResultPrefix + firstCharacterOfSegment);
    }

    // Calculate the number of shifts required to transform the current character to 'a'.
    // For 'b' (index 1), it's 25 shifts (26 - 1). For 'z' (index 25), it's 1 shift (26 - 25).
    const shiftsRequiredToReachA = ALPHABET_SIZE - charCurrentIndex;

    // Case 3: Check if we have enough shifts to transform the current character to 'a'.
    if (totalShiftsAllowed >= shiftsRequiredToReachA) {
        // If yes, apply the transformation, decrement the shift budget, and recurse.
        const updatedShiftsRemaining = totalShiftsAllowed - shiftsRequiredToReachA;
        return applyLexicographicalShift(remainingStringPart, updatedShiftsRemaining, currentResultPrefix + 'a');
    } else {
        // Case 4: We do not have enough shifts to transform the current character to 'a'.
        // This is where the greedy strategy comes into play.
        const isCurrentCharacterTheLast = (inputStrSegment.length === 1);

        if (isCurrentCharacterTheLast) {
            // If this is the final character in the string, we must apply all
            // remaining shifts to it, even if it doesn't reach 'a'.
            const newCharIndex = getWrappedCharIndex(charCurrentIndex, totalShiftsAllowed);
            const finalProcessedCharacter = basicAlphabet[newCharIndex];
            return currentResultPrefix + finalProcessedCharacter; // `remainingStringPart` is empty here.
        } else {
            // If it's not the last character, and we couldn't shift it to 'a',
            // we preserve the character as is. This saves the shift budget for
            // subsequent characters or the very last character, which might benefit more.
            return applyLexicographicalShift(remainingStringPart, totalShiftsAllowed, currentResultPrefix + firstCharacterOfSegment);
        }
    }
};

/**
 * The primary function that orchestrates reading input, parsing parameters,
 * and executing the string transformation logic. This function also includes
 * robust validation for the input data.
 * @param {string} fullInputString - The complete raw input string, typically from stdin,
 *                                   containing the target string on the first line
 *                                   and the shift count on the second line.
 */
function executeTransformation(fullInputString) {
    // --- Input Parsing and Validation (Type III: additions, destructuring) ---
    const inputLines = fullInputString.split("\n");

    // Ensure there are at least two lines for the target string and shift count.
    if (inputLines.length < 2) {
        console.error("Input Error: Expected at least two lines (target string, shift count).");
        return; // Terminate execution if input is malformed.
    }

    const [targetString, rawShiftCount] = inputLines; // Destructuring for clarity
    const maxShiftOperations = parseInt(rawShiftCount, 10); // Explicitly specify radix 10.

    // Validate the parsed shift count.
    if (Number.isNaN(maxShiftOperations) || maxShiftOperations < 0) {
        console.error(`Input Error: Invalid shift count "${rawShiftCount}". Must be a non-negative integer.`);
        return; // Terminate if shift count is invalid.
    }
    // Validate the target string itself.
    if (typeof targetString !== 'string' || targetString.length === 0) {
        console.error("Input Error: The target string for transformation is empty or not a valid string.");
        return; // Terminate if target string is invalid.
    }

    // --- Core Logic Execution ---
    const finalTransformedResult = applyLexicographicalShift(targetString, maxShiftOperations);
    console.log(finalTransformedResult);
}

// Standard boilerplate for competitive programming in Node.js:
// Reads all input from standard input and passes it to the main processing function.
// This line should not be modified as per typical problem constraints.
executeTransformation(require("fs").readFileSync("/dev/stdin", "utf8"));