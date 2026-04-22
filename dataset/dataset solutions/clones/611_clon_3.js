// This script processes a series of input lines to find patterns within them.
// It retrieves raw data from the standard input, configures processing parameters,
// and then executes a pattern-matching routine across the provided text fragments.

// Import the necessary Node.js 'fs' (file system) module to handle input operations.
const fileSystemModule = require('fs');

// Define a constant for the standard input stream path, typically used in competitive programming.
const stdinSourcePath = '/dev/stdin';

// Read the complete content of the standard input file into a string variable.
// The 'utf8' encoding ensures proper character interpretation.
let rawInputContent = fileSystemModule.readFileSync(stdinSourcePath, 'utf8');

// Process the raw input: remove any leading/trailing whitespace and then split the content
// into an array of individual lines. A filter is applied to discard any empty lines
// that might result from the splitting operation, ensuring only meaningful lines are processed.
const processedInputLines = rawInputContent.trim().split("\n").filter(line => line.length > 0);

// --- Input Validation: Ensure minimum required lines are present ---
// The script expects at least two lines for configuration: one for the number of iterations
// and another for the base pattern string.
const MINIMUM_CONFIG_LINES = 2;
if (processedInputLines.length < MINIMUM_CONFIG_LINES) {
    console.error(`ERROR: Insufficient input lines provided. Expected at least ${MINIMUM_CONFIG_LINES}, but received ${processedInputLines.length}.`);
    process.exit(1); // Terminate the process with an error code.
}

// Extract the first line, which represents the total number of processing iterations.
// Use `parseInt` with radix 10 for robust conversion to an integer.
const numberOfIterationsString = processedInputLines.shift();
const totalProcessingIterations = parseInt(numberOfIterationsString, 10);

// --- Input Validation: Validate the number of iterations ---
// Check if the parsed value is a valid non-negative number.
if (isNaN(totalProcessingIterations) || totalProcessingIterations < 0) {
    console.error(`ERROR: Invalid or negative number of iterations specified: '${numberOfIterationsString}'.`);
    process.exit(1);
}

// Extract the second line, which serves as the base for constructing patterns.
// This line is immediately split into an array of its individual characters.
const primaryPatternCharacters = processedInputLines.shift().split("");

// Initialize a counter to keep track of how many lines successfully match a pattern.
let successfulMatchCounter = 0;

// --- Main Processing Loop: Iterate through each input line for pattern matching ---
// This loop runs for the `totalProcessingIterations` specified at the beginning.
for (let currentLineIndex = 0; currentLineIndex < totalProcessingIterations; currentLineIndex++) {
    // --- Guard Clause: Handle scenarios where input lines run out prematurely ---
    // If the number of iterations specified is greater than the actual lines available,
    // a warning is issued, and the loop is gracefully exited.
    if (processedInputLines.length === 0) {
        console.warn(`WARNING: Input lines exhausted after processing ${currentLineIndex} iterations. Expected ${totalProcessingIterations}.`);
        break;
    }

    // Retrieve the next line from the processed input array for the current iteration.
    const targetTextLine = processedInputLines.shift();

    // --- Guard Clause: Skip processing if the target line is empty or undefined ---
    if (!targetTextLine || targetTextLine.length === 0) {
        // console.log(`Skipping empty or invalid target line at index ${currentLineIndex}.`);
        continue; // Move to the next iteration without attempting pattern matching.
    }

    // Initialize a string that will be used as a separator when joining the primary pattern characters.
    // It starts empty and will progressively accumulate dots.
    let patternSeparator = "";

    // --- Inner Pattern Generation Loop: Create and test various regex patterns ---
    // This loop generates different versions of the pattern by adding dots as separators.
    // The loop limit (47) is an arbitrary but fixed value from the original code.
    for (let separatorIteration = 0; separatorIteration < 47; separatorIteration++) {
        // Construct the dynamic pattern string by joining the base characters
        // with the current state of the `patternSeparator` (e.g., "a", "a.b", "a.b.c").
        const currentDynamicPattern = primaryPatternCharacters.join(patternSeparator);

        // --- Specific Break Condition Logic (Reinterpretation of original `if(s>=100)break;`) ---
        // This condition attempts to replicate a specific original behavior: if the generated
        // pattern string represents a pure integer (no dots) and its numeric value is 100 or greater,
        // then the inner loop is broken. This prevents matching certain simple numeric patterns as regexes.
        const numericInterpretation = Number(currentDynamicPattern);
        const isPureIntegerPattern = patternSeparator === "" && !isNaN(numericInterpretation) && Number.isInteger(numericInterpretation);

        if (isPureIntegerPattern && numericInterpretation >= 100) {
            // console.log(`DEBUG: Breaking inner loop. Pure numeric pattern '${currentDynamicPattern}' >= 100.`);
            break; // Exit the inner loop, moving to the next targetTextLine.
        }
        // --- End of specific break condition ---

        // Attempt to create a new regular expression object from the dynamic pattern string.
        let regexMatcher;
        try {
            regexMatcher = new RegExp(currentDynamicPattern);
        } catch (regexCreationError) {
            // --- Error Handling: Catch invalid regex patterns ---
            // If the `currentDynamicPattern` string leads to an invalid regular expression
            // (e.g., unclosed character classes), an error is logged.
            // This is a robustness enhancement.
            console.error(`ERROR: Failed to create RegExp from pattern '${currentDynamicPattern}': ${regexCreationError.message}`);
            // Despite the error, we still try to proceed by modifying the separator,
            // hoping the next pattern will be valid.
            patternSeparator = patternSeparator + ".";
            continue; // Skip the test for this invalid pattern and try the next one.
        }

        // Test if the `targetTextLine` matches the newly created regular expression.
        if (regexMatcher.test(targetTextLine)) {
            successfulMatchCounter++; // Increment the global counter if a match is found.
            // console.log(`DEBUG: Match found for pattern '${currentDynamicPattern}' in line '${targetTextLine}'.`);
            break; // Once a match is found for a line, there's no need to try more patterns for it.
                   // Move to the next `targetTextLine`.
        }

        // Append a single dot to the separator string for the next iteration.
        // This makes the pattern more flexible (e.g., "a" -> "a." -> "a..").
        patternSeparator = patternSeparator + ".";
    }
}

// Output the final count of lines that contained at least one matching pattern.
console.log(successfulMatchCounter);