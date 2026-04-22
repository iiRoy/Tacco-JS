let registeredPatternsCache; // Cache for the generated patterns

/**
 * Normalizes a raw string sequence into a canonical sorted digit string.
 * This helper function ensures consistent representation for pattern matching.
 * @param {string} inputSequence - The string to normalize.
 * @returns {string} - The sorted, joined digit string.
 */
const normalizePatternSequence = (inputSequence) => {
    // Ensure all characters are treated as individual digits, converted to numbers,
    // then sorted numerically, and finally joined back into a string.
    return inputSequence.split("").map(Number).sort((numA, numB) => numA - numB).join("");
};

/**
 * Generates a comprehensive set of valid numeric patterns.
 * This function explores various combinations of predefined segments
 * to build a registry of sorted digit sequences.
 * It's a computationally intensive task, typically run once.
 * @returns {Object.<string, number>} An object where keys are normalized pattern strings
 *                                   and values indicate their presence (e.g., 1).
 */
function createPatternRegistry() {
    // If patterns are already generated, return the cached version for efficiency.
    if (registeredPatternsCache) {
        return registeredPatternsCache;
    }

    const compiledPatterns = {}; // Stores the unique, normalized patterns.

    // Primary building blocks for patterns.
    // These are strings representing groups of three digits.
    const primaryComponents = "123,234,345,456,567,678,789,111,222,333,444,555,666,777,888,999".split(",");
    const primaryComponentCount = primaryComponents.length; // Max index for primary components is 15.

    // Secondary building blocks, single or double digits, appended to primary combinations.
    const secondaryComponents = "11,22,33,44,55,66,77,88,99".split(",");
    const secondaryComponentCount = secondaryComponents.length; // Max index for secondary components is 8.

    let patternGenerationCounter = 0; // Tracks the number of patterns processed.

    // Iterate through all possible combinations of four primary components
    // and one secondary component. This results in a very large number of combinations.
    for (let p1Idx = 0; p1Idx < primaryComponentCount; p1Idx++) {
        for (let p2Idx = 0; p2Idx < primaryComponentCount; p2Idx++) {
            for (let p3Idx = 0; p3Idx < primaryComponentCount; p3Idx++) {
                for (let p4Idx = 0; p4Idx < primaryComponentCount; p4Idx++) {
                    for (let s1Idx = 0; s1Idx < secondaryComponentCount; s1Idx++) {
                        // Construct the raw string by concatenating the chosen components.
                        const currentRawSequence = primaryComponents[p1Idx] +
                                                   primaryComponents[p2Idx] +
                                                   primaryComponents[p3Idx] +
                                                   primaryComponents[p4Idx] +
                                                   secondaryComponents[s1Idx];

                        // Normalize this sequence to its canonical sorted form.
                        const normalizedKey = normalizePatternSequence(currentRawSequence);

                        // Register the normalized pattern. Using '1' as a placeholder value.
                        compiledPatterns[normalizedKey] = 1;
                        patternGenerationCounter++;
                    }
                }
            }
        }
    }
    // console.log(`Debug: Generated and registered ${patternGenerationCounter} raw pattern combinations.`);
    registeredPatternsCache = compiledPatterns; // Cache the result.
    return compiledPatterns;
}

/**
 * Processes a single input sequence to find valid single-digit appends.
 * It checks if appending a digit (0-8) to the sequence results in a known pattern
 * and doesn't create excessive digit frequencies.
 * @param {string} currentSequenceString - The input sequence as a string.
 * @param {Object.<string, number>} predefinedPatterns - The map of valid patterns.
 * @returns {Array<number>} An array of digits (0-8) that can be appended to the sequence.
 */
const analyzeSequenceForAppends = (currentSequenceString, predefinedPatterns) => {
    const validAppends = []; // To store the digits that can be appended.
    const MAX_ALLOWED_FREQUENCY = 5; // Threshold for digit frequency.
    const MAX_APPEND_DIGIT = 9; // Digits from 0 to 8.

    // Parse the initial sequence into an array of numbers.
    const initialDigits = currentSequenceString.split("").map(Number);

    // Basic validation: ensure all characters were convertible to numbers.
    if (initialDigits.some(isNaN)) {
        console.error(`Warning: Input sequence "${currentSequenceString}" contains non-numeric characters.`);
        return []; // Return empty if input is malformed.
    }

    // Iterate through potential digits to append (0 through 8).
    for (let potentialDigit = 0; potentialDigit < MAX_APPEND_DIGIT; potentialDigit++) {
        // Create a new sequence by appending the potential digit.
        // Using spread operator to create a new array, avoiding mutation of initialDigits.
        const combinedDigits = [...initialDigits, potentialDigit];

        // Sort the combined sequence to prepare for frequency analysis and pattern matching.
        combinedDigits.sort((d1, d2) => d1 - d2);

        // Calculate the frequency of each digit (0-9) in the combined sequence.
        const digitFrequencyMap = new Array(10).fill(0); // Frequencies for digits 0-9.
        for (const digit of combinedDigits) {
            // Guard against digits outside the 0-9 range, though unlikely with current logic.
            if (digit >= 0 && digit <= 9) {
                digitFrequencyMap[digit]++;
            }
        }

        // Find the maximum frequency of any digit.
        const highestFrequency = Math.max(...digitFrequencyMap);

        // If any digit appears 5 or more times, this combination is invalid.
        // This acts as a guard clause to prune invalid paths early.
        if (highestFrequency >= MAX_ALLOWED_FREQUENCY) {
            continue; // Skip to the next potential digit.
        }

        // Normalize the combined sequence into its canonical string form for lookup.
        const normalizedCombinedSequence = combinedDigits.join("");

        // Check if this normalized sequence exists in our predefined patterns.
        // Using `hasOwnProperty` is safer than direct property access to avoid issues
        // with inherited properties or prototype chain.
        if (predefinedPatterns.hasOwnProperty(normalizedCombinedSequence)) {
            validAppends.push(potentialDigit); // If it's a valid pattern, add the digit to results.
        }
    }

    return validAppends;
};

// --- Main Program Execution ---

// Generate the patterns once at the start. This can take some time.
const solutionPatterns = createPatternRegistry();

// Setup file system reading.
const fs = require('fs');
let rawInputData;
try {
    rawInputData = fs.readFileSync('/dev/stdin', 'utf8');
} catch (error) {
    console.error(`Error reading input from /dev/stdin: ${error.message}`);
    // Exit or handle the error gracefully if input cannot be read.
    process.exit(1);
}

// Process the input data: trim whitespace and split into individual lines.
const problemStatements = rawInputData.trim().split("\n");

// Iterate through each line (problem statement) from the input.
// Using a `for...of` loop is a modern and clean way to iterate over array elements.
for (const currentInputLine of problemStatements) {
    // Skip empty or purely whitespace lines.
    if (!currentInputLine || currentInputLine.trim() === '') {
        continue;
    }

    // Find all valid single-digit appends for the current input line.
    const discoveredAppends = analyzeSequenceForAppends(currentInputLine, solutionPatterns);

    // Output the results. If no valid appends are found, print "0".
    // Otherwise, join the discovered digits with spaces.
    if (discoveredAppends.length === 0) {
        console.log("0");
    } else {
        console.log(discoveredAppends.join(" "));
    }
}