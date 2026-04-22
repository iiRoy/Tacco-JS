const fileSystem = require('fs');

// --- Configuration Constants ---
// Number of elements to pick from the first set of digit strings (arrA in original).
const NUM_COMPONENTS_SET_A = 16;
// Number of elements to pick from the second set of digit strings (arrB in original).
const NUM_COMPONENTS_SET_B = 9;
// The maximum allowed frequency for any single digit within a valid sequence.
// If a digit appears 5 or more times, the sequence is invalid. (Original check was `max >= 5`).
const MAX_PERMITTED_DIGIT_COUNT = 4;

/**
 * Processes a raw string of concatenated digits: splits it into individual digits,
 * converts them to numbers, sorts them numerically, and then joins them back
 * into a canonical string representation.
 *
 * @param {string} rawDigitString The input string containing concatenated digits.
 * @returns {string} The sorted and rejoined string of digits.
 */
const canonicalizeDigitSequence = (rawDigitString) => {
    // Convert the string into an array of individual character digits.
    const charDigits = rawDigitString.split('');
    // Map character digits to their numeric equivalents.
    const numericDigits = charDigits.map(Number);
    // Sort the numeric digits in ascending order.
    numericDigits.sort((valX, valY) => valX - valY);
    // Rejoin the sorted numeric digits to form the canonical pattern key.
    return numericDigits.join('');
};

/**
 * Generates a comprehensive lookup table of valid numeric sequence patterns.
 * These patterns are constructed by combining elements from two predefined sets
 * of digit strings, then normalizing the resulting combined sequence.
 *
 * @returns {Object.<string, boolean>} An object where keys are the canonical (sorted)
 *                                     digit string patterns, and values are `true`
 *                                     to indicate their validity.
 */
function buildValidationRegistry() {
    // This object will store all unique, canonically sorted digit patterns.
    const validationRegistry = {};

    // The first collection of three-digit number strings.
    const digitComponentsA = "123,234,345,456,567,678,789,111,222,333,444,555,666,777,888,999".split(',');
    // The second collection of two-digit number strings.
    const digitComponentsB = "11,22,33,44,55,66,77,88,99".split(',');

    // Execute five deeply nested loops to generate every possible combination.
    // This process concatenates four elements from `digitComponentsA` and one from `digitComponentsB`.
    for (let c1 = 0; c1 < NUM_COMPONENTS_SET_A; c1++) {
        for (let c2 = 0; c2 < NUM_COMPONENTS_SET_A; c2++) {
            for (let c3 = 0; c3 < NUM_COMPONENTS_SET_A; c3++) {
                for (let c4 = 0; c4 < NUM_COMPONENTS_SET_A; c4++) {
                    for (let c5 = 0; c5 < NUM_COMPONENTS_SET_B; c5++) {
                        // Concatenate the selected string components.
                        const rawCombinedString = digitComponentsA[c1] +
                                                  digitComponentsA[c2] +
                                                  digitComponentsA[c3] +
                                                  digitComponentsA[c4] +
                                                  digitComponentsB[c5];

                        // Normalize the combined string into its canonical sorted form.
                        const canonicalPattern = canonicalizeDigitSequence(rawCombinedString);

                        // Add the canonical pattern to our registry if it's not already present.
                        validationRegistry[canonicalPattern] = true;
                    }
                }
            }
        }
    }
    // Return the completed registry of valid patterns.
    return validationRegistry;
}

// Pre-calculate the entire set of valid patterns once when the program starts.
// This allows for very fast lookups later during input processing.
const precomputedValidPatterns = buildValidationRegistry();

// --- Input Reading and Processing ---

let rawInputContent = '';
try {
    // Attempt to read all data from standard input synchronously.
    rawInputContent = fileSystem.readFileSync('/dev/stdin', 'utf8');
} catch (readError) {
    // Log an error if input cannot be read and terminate the process.
    console.error(`Failed to read input from /dev/stdin: ${readError.message}`);
    process.exit(1);
}

// Clean and parse the raw input: remove leading/trailing whitespace, then split by newlines.
const inputSequenceLines = rawInputContent.trim().split('\n');

/**
 * Evaluates a given initial digit sequence with a candidate digit appended.
 * It checks two conditions for validity:
 * 1. No single digit appears more than `MAX_PERMITTED_DIGIT_COUNT` times.
 * 2. The resulting canonical sequence exists within the `validationSet`.
 *
 * @param {string} baseSequenceString The initial sequence of digits as a string.
 * @param {number} appendedCandidate The single digit (1-9) to append.
 * @param {Object.<string, boolean>} validationSet The precomputed set of valid patterns.
 * @returns {boolean} True if the combined sequence is valid, false otherwise.
 */
const evaluateCandidateSequence = (baseSequenceString, appendedCandidate, validationSet) => {
    // Convert the base string into an array of numeric digits.
    const currentDigits = baseSequenceString.split('').map(Number);
    // Add the new candidate digit to the array.
    currentDigits.push(appendedCandidate);

    // Sort the combined set of digits to prepare for frequency counting and canonical form.
    currentDigits.sort((a, b) => a - b);

    // Initialize an array to count occurrences of each digit (0-9).
    const digitCounts = new Array(10).fill(0);
    for (const digit of currentDigits) {
        // Basic check for digit validity (0-9).
        if (digit >= 0 && digit <= 9) {
            digitCounts[digit]++;
        } else {
            // An unexpected digit value would make the sequence invalid.
            return false;
        }
    }

    // Find the highest frequency of any single digit.
    // The spread operator `...` is used for `Math.max` for conciseness.
    const highestDigitFrequency = Math.max(...digitCounts);

    // If any digit occurs too many times, this combination is immediately invalid.
    if (highestDigitFrequency > MAX_PERMITTED_DIGIT_COUNT) {
        return false;
    }

    // Convert the sorted numeric digits back into a string for lookup.
    const finalCanonicalKey = currentDigits.join('');

    // Check if this canonical pattern exists in our precomputed validation registry.
    // Using the 'in' operator is a robust way to check for property existence.
    return finalCanonicalKey in validationSet;
};

// Process each input line sequentially.
// The `while` loop with `shift()` efficiently consumes lines from the array.
while (inputSequenceLines.length > 0) {
    const currentInputSequence = inputSequenceLines.shift(); // Get the next line.

    // Skip any potentially empty or malformed lines.
    if (!currentInputSequence || currentInputSequence.trim().length === 0) {
        continue;
    }

    // An array to collect all valid single-digit additions for the current input sequence.
    const validAppendedDigits = [];

    // Iterate through all possible digits (1 to 9) to append to the current sequence.
    for (let candidateDigitValue = 1; candidateDigitValue <= 9; candidateDigitValue++) {
        // Check if appending the current candidate digit results in a valid pattern.
        if (evaluateCandidateSequence(currentInputSequence, candidateDigitValue, precomputedValidPatterns)) {
            validAppendedDigits.push(candidateDigitValue); // If valid, add to our list.
        }
    }

    // Output the results: '0' if no valid additions were found,
    // otherwise, a space-separated string of the valid digits.
    if (validAppendedDigits.length === 0) {
        console.log('0');
    } else {
        console.log(validAppendedDigits.join(' '));
    }
}