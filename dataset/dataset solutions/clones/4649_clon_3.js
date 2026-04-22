// Define global constants for clarity and maintainability across the module.
const ALPHABET_SIZE = 26; // Represents the number of letters in the English alphabet.
const LOWERCASE_A_CODE = 'a'.charCodeAt(0); // ASCII code for the character 'a'.

/**
 * Calculates the frequency of lowercase English letters within a given text string.
 * This function specifically targets 'a' through 'z' and ignores all other characters,
 * including uppercase letters, numbers, symbols, and whitespace.
 *
 * @param {string} textToAnalyze The input string from which to count character frequencies.
 * @returns {number[]} An array of 26 integers. Each index corresponds to a letter
 *                     (0 for 'a', 1 for 'b', ..., 25 for 'z'), and its value is the
 *                     total occurrences of that letter in the input string.
 */
function calculateCharCounts(textToAnalyze) {
    // Implement robust input validation: if the input is not a string or is empty,
    // return an array filled with zeros, indicating no character occurrences.
    if (typeof textToAnalyze !== 'string' || textToAnalyze.length === 0) {
        return Array(ALPHABET_SIZE).fill(0);
    }

    // Initialize an array to store the character counts. All counts start at zero.
    const characterFrequencies = Array(ALPHABET_SIZE).fill(0);

    // Iterate through each character of the provided text string.
    for (let charIteration = 0; charIteration < textToAnalyze.length; charIteration++) {
        const charCode = textToAnalyze.charCodeAt(charIteration);
        // Determine the relative position of the character in the alphabet (0-25).
        const charRelativeIndex = charCode - LOWERCASE_A_CODE;

        // Ensure that the character is a lowercase English letter before incrementing its count.
        // This explicitly handles non-alphabetical characters by ignoring them.
        if (charRelativeIndex >= 0 && charRelativeIndex < ALPHABET_SIZE) {
            characterFrequencies[charRelativeIndex]++;
        }
    }
    return characterFrequencies;
}

/**
 * Determines the minimum frequency for each corresponding character across two
 * character frequency arrays. This operation effectively finds the "intersection"
 * of character availability between two sets of counts.
 *
 * @param {number[]} freqSetA The first array of character frequencies.
 * @param {number[]} freqSetB The second array of character frequencies.
 * @returns {number[]} A new array where each element is the minimum of the
 *                     corresponding elements from `freqSetA` and `freqSetB`.
 * @throws {Error} Throws an error if the input frequency arrays do not match the
 *                 expected alphabet size, ensuring data integrity.
 */
function determineSharedCounts(freqSetA, freqSetB) {
    // Validate that both input arrays are of the correct and expected size.
    // This adds a robust check against malformed frequency data.
    if (freqSetA.length !== ALPHABET_SIZE || freqSetB.length !== ALPHABET_SIZE) {
        throw new Error(`Input frequency arrays must each contain ${ALPHABET_SIZE} elements.`);
    }

    // Create a new array to store the resulting minimum frequencies.
    const intersectedFrequencies = Array(ALPHABET_SIZE);

    // Iterate through each character position (index) and compute the minimum count.
    for (let alphabetPosition = 0; alphabetPosition < ALPHABET_SIZE; alphabetPosition++) {
        intersectedFrequencies[alphabetPosition] = Math.min(
            freqSetA[alphabetPosition],
            freqSetB[alphabetPosition]
        );
    }
    // Return the newly created array; the input arrays are not modified (pure function).
    return intersectedFrequencies;
}

/**
 * The primary function that orchestrates the input processing, frequency calculation,
 * and result generation. It reads a multi-line string input, parses it to extract
 * a list of strings, computes the common character frequencies across all strings,
 * and then prints a result string composed of these common characters.
 *
 * @param {string} rawInputString The complete input received as a single string,
 *                                typically read from standard input.
 */
function processInputData(rawInputString) {
    // 1. Input Parsing and Initial Validation:
    // Split the raw input into individual lines, remove leading/trailing whitespace
    // from each line, and discard any lines that become empty after trimming.
    const dataLines = rawInputString.split('\n')
                                    .map(line => line.trim())
                                    .filter(line => line.length > 0);

    // If no meaningful input lines are present after filtering, output an empty
    // string and terminate, as there's nothing to process.
    if (dataLines.length === 0) {
        console.log('');
        return;
    }

    // The first line of input is expected to be the count of subsequent data strings.
    const declaredStringCount = parseInt(dataLines[0], 10);

    // Validate the parsed count: it must be a non-negative integer and should not
    // exceed the number of actual lines available (excluding the count line itself).
    if (isNaN(declaredStringCount) || declaredStringCount < 0 || declaredStringCount > dataLines.length - 1) {
        console.error('Error: Invalid or insufficient number of data strings declared in input.');
        console.log(''); // Output an empty string as a default response for invalid input.
        return;
    }

    // Extract the actual data strings based on the declared count.
    // The slice operation ensures we only take the specified number of strings.
    const stringDataSet = dataLines.slice(1, declaredStringCount + 1);

    // If the data set is empty (e.g., declaredStringCount was 0), output empty string.
    if (stringDataSet.length === 0) {
        console.log('');
        return;
    }

    // 2. Frequency Aggregation:
    // Initialize the `overallMinFreqs` with the character counts of the first string.
    // This serves as the baseline for finding common frequencies.
    let overallMinFreqs = calculateCharCounts(stringDataSet[0]);

    // Iterate through the rest of the strings in the data set (starting from the second string).
    // For each subsequent string, calculate its frequencies and then update `overallMinFreqs`
    // by finding the minimum counts between the current `overallMinFreqs` and the new string's frequencies.
    for (let currentStringIdx = 1; currentStringIdx < stringDataSet.length; currentStringIdx++) {
        const currentStringFreqs = calculateCharCounts(stringDataSet[currentStringIdx]);
        overallMinFreqs = determineSharedCounts(overallMinFreqs, currentStringFreqs);
    }

    // 3. Result Construction:
    // Generate the final output string by assembling characters based on their
    // overall minimum frequencies. This uses a functional approach with `map` and `join`.
    const finalResultParts = Array(ALPHABET_SIZE).fill(0).map((_, charOffset) => {
        // Determine the character corresponding to the current offset (e.g., 0 -> 'a', 1 -> 'b').
        const charToForm = String.fromCharCode(LOWERCASE_A_CODE + charOffset);
        // Get the count for this character from the aggregated minimum frequencies.
        const repeatCount = overallMinFreqs[charOffset];
        // Repeat the character `repeatCount` times. If `repeatCount` is 0, `repeat()` returns an empty string.
        return charToForm.repeat(repeatCount);
    });

    // Concatenate all the individual character parts into one final output string.
    const finalOutputString = finalResultParts.join('');

    // Print the constructed result to standard output.
    console.log(finalOutputString);
}

// Entry point for the program execution.
// It reads input from standard input, typically '/dev/stdin' in Unix-like systems,
// and then calls the main processing function. A try-catch block is included for
// robust error handling during file reading or processing.
try {
    const stdInputContent = require("fs").readFileSync("/dev/stdin", "utf8");
    processInputData(stdInputContent);
} catch (programExecutionError) {
    // If any error occurs (e.g., file not found, permission issues, or runtime error
    // within processInputData not caught internally), log it to standard error.
    console.error("An unexpected error occurred during program execution:", programExecutionError.message);
    // As a fallback, output an empty string to standard output to avoid leaving
    // the output stream completely blank, which might be expected in some contexts.
    console.log('');
}