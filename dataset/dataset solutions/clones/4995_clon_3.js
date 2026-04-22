/**
 * This script analyzes an input string to determine a specific property related to character frequencies.
 * Specifically, it checks if every unique character within the string appears an even number of times.
 * If all character counts are even, it outputs "Yes"; otherwise, it outputs "No".
 * This is effectively checking if the string has an even length and all character counts are even.
 */

/**
 * Executes the core logic for character frequency analysis.
 *
 * @param {string} incomingTextData - The raw string data received for processing.
 * @returns {void} Outputs "Yes" or "No" to standard output.
 */
function evaluateCharacterEvenness(incomingTextData) {
    // Preliminary input validation: Ensure we're working with a string.
    if (typeof incomingTextData !== 'string') {
        console.error("Input data must be a string type. Received:", typeof incomingTextData);
        // An early exit is appropriate for invalid input.
        return;
    }

    // Prepare the input: Remove leading/trailing whitespace which might affect character counts.
    const sanitizedString = incomingTextData.trim();

    // Edge case: An empty string trivially satisfies the condition (zero characters, zero odd counts).
    if (sanitizedString.length === 0) {
        console.log("Yes");
        return;
    }

    // Utilize a Map object to store the frequency of each character.
    // Maps provide better performance and clearer semantics for key-value pairs
    // compared to plain objects when keys might not always be simple strings.
    const characterFrequencyMap = new Map();

    // Iterate over each character in the sanitized string.
    // The `for...of` loop is a modern and clean way to iterate over string characters.
    for (const individualChar of sanitizedString) {
        // Retrieve the current count for the character, defaulting to 0 if not yet seen.
        const existingCount = characterFrequencyMap.get(individualChar) || 0;
        // Increment the count and store it back in the map.
        characterFrequencyMap.set(individualChar, existingCount + 1);
    }

    // Initialize a counter for characters that appear an odd number of times.
    let countOfOddFrequencies = 0;

    // Iterate through the values (frequencies) stored in our map.
    // We're interested in whether any of these frequencies are odd.
    for (const frequencyValue of characterFrequencyMap.values()) {
        // Check for oddness using the bitwise AND operator, which is slightly more performant
        // than the modulo operator for integer parity checks.
        // `(frequencyValue & 1) !== 0` is true if frequencyValue is odd.
        if ((frequencyValue & 1) !== 0) {
            countOfOddFrequencies++;
        }
    }

    // The condition for "Yes" is that *all* character frequencies must be even.
    // This means `countOfOddFrequencies` must be exactly zero.
    const allCountsAreEven = countOfOddFrequencies === 0;

    // Output the final result based on the derived boolean.
    if (allCountsAreEven) {
        console.log("Yes");
    } else {
        console.log("No");
    }
}

// --- Program Execution Start ---
// This section handles reading input from the standard input stream and initiating the analysis.
// It includes basic error handling for file system operations.
try {
    const fileSystemHandler = require("fs");
    // Read the entire content of standard input synchronously, using UTF-8 encoding.
    const stdInputContent = fileSystemHandler.readFileSync("/dev/stdin", "utf8");
    // Invoke our main analysis function with the obtained input.
    evaluateCharacterEvenness(stdInputContent);
} catch (errorDuringExecution) {
    // Log any errors that occur during file reading or subsequent processing.
    console.error("An operational error occurred:", errorDuringExecution.message);
    // In a production environment, one might choose to exit with a non-zero status code.
    // process.exit(1);
}