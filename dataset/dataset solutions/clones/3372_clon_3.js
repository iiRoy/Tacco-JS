/*
 * This module is designed to process incoming textual data,
 * specifically to analyze numerical entries against predefined criteria.
 * It counts how many data points satisfy two distinct minimum thresholds.
 */
function analyzeMeasurementData(rawDataPayload) {
    // Perform an initial validation to ensure the input is a valid string.
    // If the input is not a string or is merely whitespace, issue a warning and exit.
    if (typeof rawDataPayload !== 'string' || rawDataPayload.trim().length === 0) {
        console.warn('Processing halted: Provided input payload is either empty, invalid, or non-string type.');
        return; // Early exit for invalid input.
    }

    // Split the entire input payload into individual lines.
    // The regex `/\r?\n/` ensures compatibility with both Unix (`\n`) and Windows (`\r\n`) line endings.
    const allInputLines = rawDataPayload.split(/\r?\n/);

    // Validate that there are sufficient lines for both configuration and at least one data entry.
    // At minimum, two lines are expected: one for thresholds and one for actual data.
    if (allInputLines.length < 2) {
        console.error('Data analysis cannot proceed: Insufficient number of lines in the input. Expected at least two.');
        return;
    }

    /**
     * A utility function to parse a single line of space-separated strings into an array of integers.
     * It includes robustness checks for the number of expected parts and for non-numeric values.
     * @param {string} lineContent The string line to parse.
     * @param {number} expectedPartCount The minimum number of numeric parts expected in the line.
     * @returns {number[] | null} An array of parsed integers, or null if parsing fails.
     */
    const parseLineToNumbers = (lineContent, expectedPartCount = 2) => {
        const stringComponents = lineContent.trim().split(' ');
        if (stringComponents.length < expectedPartCount) {
            console.error(`Parsing error: Line "${lineContent}" lacks the required number of components. Expected ${expectedPartCount}.`);
            return null; // Indicate failure due to insufficient components.
        }

        const numericComponents = stringComponents.map(str => Number.parseInt(str.trim(), 10));

        // Verify that all mapped components successfully converted to numbers.
        if (numericComponents.some(isNaN)) {
            console.error(`Parsing error: Line "${lineContent}" contains non-numeric values that could not be converted.`);
            return null; // Indicate failure due to non-numeric content.
        }
        return numericComponents;
    };

    // Process the very first line to extract the comparison thresholds.
    // The original code used mem[1] and mem[2]. We explicitly parse and name them.
    const configurationValues = parseLineToNumbers(allInputLines[0], 3); // Expecting at least 3 values (first one often unused)

    if (!configurationValues || configurationValues.length < 3) {
        console.error('Configuration line parsing failed or does not contain the two required thresholds. Aborting.');
        return;
    }

    // Assign the extracted thresholds to clearly named constants.
    // These correspond to original `mem[1]` and `mem[2]`.
    const minimumCriterionA = configurationValues[1];
    const minimumCriterionB = configurationValues[2];

    // Initialize a counter for the data entries that successfully pass both criteria.
    let qualifyingDataPointsCount = 0; // Renamed from 'sum' to a more descriptive name.

    // Iterate through the remaining lines of the input, starting from the second line (index 1).
    // These lines represent the actual data points to be evaluated.
    for (let currentLineIndex = 1; currentLineIndex < allInputLines.length; currentLineIndex++) {
        const dataEntryRow = allInputLines[currentLineIndex];

        // Skip any completely empty lines encountered within the data section.
        // This is a common practice for robustness in data processing.
        if (dataEntryRow.trim().length === 0) {
            // console.debug(`Skipping an empty data row at index ${currentLineIndex}.`);
            continue; // Move to the next line without processing.
        }

        // Parse the current data row into its constituent numeric values.
        // We expect two primary values per data row.
        const currentDataPointPair = parseLineToNumbers(dataEntryRow, 2);

        // If parsing of the current data row fails, log an error but continue to the next line.
        // This allows the program to process valid data even if some lines are malformed.
        if (!currentDataPointPair || currentDataPointPair.length < 2) {
            console.error(`Skipping severely malformed data row: "${dataEntryRow}" at index ${currentLineIndex}.`);
            continue;
        }

        // Extract the individual values from the parsed pair.
        // These correspond to original `n[0]` and `n[1]`.
        const observedValueX = currentDataPointPair[0];
        const observedValueY = currentDataPointPair[1];

        // Evaluate the data point against the defined criteria.
        // The original `if(n[0]>=mem[1]&&n[1]>=mem[2]) sum++;` is broken down for clarity.
        const satisfiesFirstCondition = (observedValueX >= minimumCriterionA);
        const satisfiesSecondCondition = (observedValueY >= minimumCriterionB);

        // If both conditions are met, increment the counter.
        if (satisfiesFirstCondition && satisfiesSecondCondition) {
            qualifyingDataPointsCount++;
        }
    }

    // Output the final count of data points that met all specified criteria.
    // Changed `console.log` to `console.info` for a slightly different semantic output.
    console.info(qualifyingDataPointsCount);
}

// This block handles the execution environment, specifically reading input from standard input
// and then invoking our primary data analysis function.
const fsModule = require("fs"); // Renamed 'fs' to 'fsModule'
const standardInputDevicePath = "/dev/stdin"; // Renamed '/dev/stdin' to 'standardInputDevicePath'

try {
    // Read the entire content from the standard input stream synchronously.
    const rawInputContentFromStream = fsModule.readFileSync(standardInputDevicePath, "utf8");
    // Trim any leading or trailing whitespace from the entire input block.
    const cleanedAndTrimmedInput = rawInputContentFromStream.trim();

    // Initiate the data analysis process with the prepared input.
    analyzeMeasurementData(cleanedAndTrimmedInput);
} catch (fileReadError) {
    // Catch and report any errors that occur during the file reading process.
    console.error(`An I/O error prevented reading from standard input: ${fileReadError.message}`);
    // Exit the process with a non-zero status code to indicate an error.
    process.exit(1);
}