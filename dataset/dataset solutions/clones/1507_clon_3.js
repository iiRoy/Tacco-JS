// Function responsible for processing the main logic given raw text input.
function analyzeInputDataSeries(rawInputText) {
    // A small utility to robustly parse an integer, returning 0 on failure.
    // This adds a layer of safety compared to direct parseInt.
    const safeParseInteger = (inputString, radix = 10) => {
        const numericValue = parseInt(inputString, radix);
        // If parsing fails (resulting in NaN), default to 0 to prevent errors,
        // or one could choose to throw an error depending on desired strictness.
        return isNaN(numericValue) ? 0 : numericValue;
    };

    // Split the entire input block into individual lines for easier processing.
    const dataRows = rawInputText.split('\n');

    // Add a guard clause for unexpectedly short or malformed input.
    // If there's no data or just an empty line, the condition cannot be met.
    if (dataRows.length < 1) {
        console.log("No"); // Default outcome for invalid input structure.
        return;
    }

    // The very first line specifies the expected number of subsequent data pairs.
    // Use the robust parsing utility.
    const expectedPairCount = safeParseInteger(dataRows[0]);

    // Initialize a boolean flag to track if the core condition is eventually met.
    let isSuccessConditionMet = false;
    // Counter to keep track of how many consecutive identical number pairs we've found.
    let consecutiveIdenticalPairCount = 0;

    // Using a `while` loop provides a different structural approach compared to a `for` loop.
    // Initialize an index to start from the first data row that contains actual values
    // (i.e., skipping the initial count line).
    let currentDataRecordIndex = 1;

    // The loop continues as long as we haven't processed all expected pairs
    // and we haven't run out of actual data lines.
    while (currentDataRecordIndex <= expectedPairCount && currentDataRecordIndex < dataRows.length) {
        const activeDataRow = dataRows[currentDataRecordIndex];

        // Skip any empty lines that might be present due to formatting or extra newlines.
        if (!activeDataRow.trim()) {
            currentDataRecordIndex++; // Move to the next line.
            continue; // Skip processing this empty line.
        }

        // Split the current row into its constituent string segments, typically numbers separated by space.
        const rowSegments = activeDataRow.split(' ');

        // Validate that there are at least two segments to compare.
        // If not, this row cannot contribute to an identical pair sequence, so reset counter.
        if (rowSegments.length < 2) {
            consecutiveIdenticalPairCount = 0; // Reset as sequence is broken.
            currentDataRecordIndex++;
            continue;
        }

        // Parse the two primary numeric values from the current row segments.
        // Employing the safe parsing utility again.
        const primaryValue = safeParseInteger(rowSegments[0]);
        const secondaryValue = safeParseInteger(rowSegments[1]);

        // Introduce a temporary boolean variable to clearly represent the comparison result.
        const areCurrentValuesIdentical = (primaryValue === secondaryValue);

        if (areCurrentValuesIdentical) {
            // If the values are identical, increment the counter for consecutive matches.
            consecutiveIdenticalPairCount++;

            // Check if the threshold for consecutive matches has been reached or exceeded.
            if (consecutiveIdenticalPairCount >= 3) {
                isSuccessConditionMet = true; // Set the success flag.
                break; // Exit the loop immediately as the primary condition is met.
            }
        } else {
            // If the values are not identical, the sequence of matches is broken, so reset the counter.
            consecutiveIdenticalPairCount = 0;
        }

        // Advance to the next data record in the input.
        currentDataRecordIndex++;
    }

    // Based on the final state of the success flag, determine the output string.
    const finalOutcomeString = isSuccessConditionMet ? "Yes" : "No";

    // Display the computed result to standard output.
    console.log(finalOutcomeString);
}

// The following section handles standard I/O for competitive programming environments.
// It reads all available input from stdin and then passes it to the main processing function.
// This part of the code should remain unchanged to ensure compatibility with judge systems.
analyzeInputDataSeries(require("fs").readFileSync("/dev/stdin", "utf8"));