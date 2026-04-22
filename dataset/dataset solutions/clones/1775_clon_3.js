// This function orchestrates the process of finding the nearest permissible integer.
// It takes an array of strings, typically read from standard input, and processes them.
function processNumericalSequence(rawInputLines) {
    // A helper function to safely parse a string line into an array of numbers.
    // It handles potential empty strings or non-numeric tokens more robustly.
    const extractNumbersFromLine = (lineContent, expectedCount) => {
        // Trim whitespace from the line and split by one or more spaces.
        const stringTokens = lineContent.trim().split(/\s+/);
        const parsedValues = [];

        // Iterate through tokens, converting each to a number.
        for (const token of stringTokens) {
            const numericValue = Number(token); // Using Number() for type conversion.
            if (!isNaN(numericValue)) { // Ensure the conversion was successful.
                parsedValues.push(numericValue);
            } else {
                // Log a warning for malformed input, but continue processing valid numbers.
                console.warn(`Warning: Non-numeric token "${token}" found in input line.`);
            }
        }

        // Basic validation for the number of parsed values.
        if (expectedCount && parsedValues.length !== expectedCount) {
             console.warn(`Input parsing issue: Expected ${expectedCount} numbers, but found ${parsedValues.length}.`);
        }
        return parsedValues;
    };

    // Validate the basic structure of the input data.
    if (!rawInputLines || rawInputLines.length === 0) {
        console.error("Error: No input data provided for processing.");
        return; // Exit if no input.
    }

    // --- Step 1: Parse the initial configuration from the first line. ---
    // The first line contains the target base point and the count of excluded numbers.
    const initialConfig = extractNumbersFromLine(rawInputLines[0], 2);

    // Ensure we successfully extracted the required two numbers.
    if (initialConfig.length < 2) {
        console.error("Error: Failed to extract base point and exclusion count from the first input line.");
        return;
    }

    const basePoint = initialConfig[0]; // This is 'x' from the original problem.
    const numberOfExclusions = initialConfig[1]; // This is 'n' from the original problem.

    let finalDeterminedValue; // This variable will hold our final result.

    // --- Step 2: Determine the result based on the number of exclusions. ---
    if (numberOfExclusions === 0) {
        // If there are no numbers to exclude, the base point itself is the answer.
        finalDeterminedValue = basePoint;
    } else {
        // If there are exclusions, we need to read them and search for the closest non-excluded value.

        // Ensure a second line exists for the excluded numbers.
        if (rawInputLines.length < 2) {
            console.error("Error: Exclusion count is positive, but no second line of excluded numbers was found.");
            return;
        }

        // Parse the second line to get the list of prohibited values.
        const rawProhibitedValues = extractNumbersFromLine(rawInputLines[1], numberOfExclusions);

        // Convert the array of prohibited values into a Set for efficient O(1) lookups.
        // This is a significant Type III structural change for performance.
        const excludedValueSet = new Set(rawProhibitedValues);

        let currentOffset = 0; // Represents the distance from the base point.
        let resultFound = false; // Flag to control the search loop.

        // Loop indefinitely until a suitable value is found.
        // This simulates the original 'while(true)' but with a clearer exit condition via 'resultFound'.
        while (!resultFound) {
            // Calculate the candidate value below the base point.
            const candidateBelow = basePoint - currentOffset;

            // Check if the candidate below is NOT in our set of excluded values.
            if (!excludedValueSet.has(candidateBelow)) {
                finalDeterminedValue = candidateBelow;
                resultFound = true; // Found the answer, exit the loop.
            } else {
                // If the candidate below was excluded, check the candidate above.
                // This check is performed for offset 0 as well to cover basePoint itself.
                const candidateAbove = basePoint + currentOffset;

                // Check if the candidate above is NOT in our set of excluded values.
                // This branch is only taken if candidateBelow was excluded OR if currentOffset is 0 and basePoint was excluded.
                if (!excludedValueSet.has(candidateAbove)) {
                    finalDeterminedValue = candidateAbove;
                    resultFound = true; // Found the answer, exit the loop.
                }
            }

            // If no candidate was found in this iteration (both below and above were excluded or currentOffset=0 and basePoint was excluded),
            // increment the offset and try further away from the base point.
            if (!resultFound) {
                currentOffset++;
            }

            // Optional: Add a safety break for very large offsets to prevent infinite loops in unforeseen scenarios.
            // For typical competitive programming problems, this isn't strictly necessary due to constraints.
            // if (currentOffset > 1000000) {
            //     console.error("Search exceeded maximum offset; no suitable value found within reasonable bounds.");
            //     finalDeterminedValue = null; // Indicate failure to find.
            //     resultFound = true;
            // }
        }
    }

    // --- Step 3: Output the determined value. ---
    // A dedicated helper for consistent output.
    const emitResultToConsole = (valueToOutput) => {
        if (valueToOutput !== undefined && valueToOutput !== null) {
            // Using process.stdout.write for direct output, potentially faster than console.log for large outputs
            // though for a single number, console.log is usually fine.
            process.stdout.write(String(valueToOutput) + '\n');
        } else {
            process.stderr.write("Operation completed without a valid result to display.\n");
        }
    };

    emitResultToConsole(finalDeterminedValue);
}

// --- Main execution block for reading input and invoking the processing function. ---
// This part remains largely standard for Node.js competitive programming setup.
try {
    // Read all input from standard input, decode as UTF-8, trim any trailing newlines,
    // and split into an array of lines.
    const standardInputData = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');

    // Call our primary processing function with the collected input.
    processNumericalSequence(standardInputData);
} catch (error) {
    // Catch any potential errors during file reading or initial processing.
    console.error(`An unhandled error occurred during input processing: ${error.message}`);
    // Optionally, exit with a non-zero status code to indicate failure.
    // process.exit(1);
}