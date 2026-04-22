const fileSystemModule = require('fs');

// Define essential configuration values as constants for improved readability and maintainability.
const DIVISIBILITY_TARGET = 2019; // The specific integer value we are checking for divisibility against.
const MINIMUM_FRAGMENT_SIZE = 4;   // The smallest acceptable length for a numeric string fragment.
const STANDARD_INPUT_SOURCE = '/dev/stdin'; // The typical path for reading standard input in Unix-like systems.

/**
 * Main function to orchestrate the processing of the input and calculation.
 */
function processNumericSegments() {
    let inputContentBuffer;
    try {
        // Attempt to read the entire content from the specified input source.
        // 'utf8' encoding ensures the content is treated as a string.
        inputContentBuffer = fileSystemModule.readFileSync(STANDARD_INPUT_SOURCE, 'utf8');
    } catch (ioError) {
        // If there's an issue reading the file, log the error and terminate.
        console.error("Failed to read input from source:", ioError.message);
        process.exit(1); // Indicate an error occurred.
    }

    // Sanitize the raw input: remove any leading or trailing whitespace characters.
    const cleanedNumericString = inputContentBuffer.trim();

    // Initialize a counter for segments that successfully meet all criteria.
    let successfulMatchCount = 0;

    // --- Input Validation and Early Exit Conditions ---
    // Check if the cleaned input string is empty or not a valid string type.
    if (!cleanedNumericString || typeof cleanedNumericString !== 'string' || cleanedNumericString.length === 0) {
        // If the input is invalid or empty, there are no segments to process.
        // Output the current (zero) count and exit cleanly.
        console.log(successfulMatchCount);
        return;
    }

    const totalInputLength = cleanedNumericString.length;

    // Check if the input string is too short to even form a fragment of the minimum required size.
    if (totalInputLength < MINIMUM_FRAGMENT_SIZE) {
        // No possible fragments meet the minimum length requirement.
        console.log(successfulMatchCount);
        return;
    }

    // --- Core Logic: Iterating and Evaluating Substring Fragments ---

    // The outer loop iterates through every possible starting index for a fragment.
    // It stops early if there isn't enough remaining string length to form a minimum-sized fragment.
    for (let currentStartingPosition = 0; currentStartingPosition <= totalInputLength - MINIMUM_FRAGMENT_SIZE; ++currentStartingPosition) {

        // The inner loop iterates through every possible ending index for a fragment,
        // ensuring that each fragment is at least MINIMUM_FRAGMENT_SIZE long.
        // The `slice` method's end index is exclusive, so `totalInputLength` is a valid upper bound
        // to include fragments that extend to the very last character.
        for (let currentEndingPosition = currentStartingPosition + MINIMUM_FRAGMENT_SIZE; currentEndingPosition <= totalInputLength; ++currentEndingPosition) {

            // Extract the current string fragment using `slice`.
            // `slice` is often preferred over `substring` for its more consistent behavior with negative indices (though not used here).
            const extractedFragment = cleanedNumericString.slice(currentStartingPosition, currentEndingPosition);

            // Convert the string fragment into an integer.
            // Explicitly specifying base 10 (radix) is good practice.
            const numericalRepresentation = parseInt(extractedFragment, 10);

            // --- Guard Clause: Handle Non-Numeric Fragments ---
            // If `parseInt` fails to convert the fragment into a valid number (e.g., if the fragment
            // contains non-digit characters, though less likely with typical competitive programming inputs),
            // `isNaN` will be true. In such cases, we skip this fragment and move to the next.
            if (isNaN(numericalRepresentation)) {
                continue; // Skip the current iteration and proceed to the next fragment.
            }

            // --- Divisibility Check ---
            // Check if the successfully parsed numerical value is perfectly divisible by our target.
            if (numericalRepresentation % DIVISIBILITY_TARGET === 0) {
                // If it is, increment our success counter.
                successfulMatchCount++;
            }
        }
    }

    // After processing all possible fragments, output the final count.
    console.log(successfulMatchCount);
}

// Execute the main processing function.
processNumericSegments();