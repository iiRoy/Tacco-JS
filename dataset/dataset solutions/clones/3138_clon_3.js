const processInputContent = (sourceTextData) => {
    // This primary routine is designed to parse multi-line textual input,
    // apply a weighted sum calculation to specific data rows,
    // and then report the total count of rows that yield a positive result.
    // It is robust against empty input and non-numeric data elements.

    if (!sourceTextData || sourceTextData.trim().length === 0) {
        // A preliminary check to ensure the provided input is not empty or merely whitespace.
        console.error("Error: Input data stream is empty or contains only whitespace. Cannot proceed with processing.");
        return 0; // Returning zero as no qualifying entries can be found.
    }

    // Split the entire input block into an array of individual text lines.
    const allTextualLines = sourceTextData.split('\n');

    // Verify that there are at least two lines: one for coefficients and one for data.
    if (allTextualLines.length < 2) {
        console.error("Error: Insufficient number of lines in the input. Expected at least two lines.");
        return 0; // No valid processing possible.
    }

    // The first line of input (index 0) is considered a configuration line in some contexts,
    // but its content is not utilized in the core logic of this particular processing task.
    // Therefore, it is intentionally disregarded.
    // Example: const configurationTokens = allTextualLines[0].split(' '); // This line is effectively removed.

    // The second line (index 1) contains the string representation of the weight coefficients.
    const weightCoefficientStrings = allTextualLines[1].split(' ');

    // Convert the string-based weight coefficients into an array of numeric values.
    // Robustness is added by checking for NaN values and defaulting them to zero.
    const numericWeightCoefficients = weightCoefficientStrings.map(coefficientString => {
        const parsedValue = Number(coefficientString);
        if (Number.isNaN(parsedValue)) {
            console.warn(`Warning: Non-numeric weight coefficient detected ('${coefficientString}'). Defaulting to 0 for calculation.`);
            return 0;
        }
        return parsedValue;
    });

    // The actual data entries start from the third line (index 2) onwards.
    // We create a new array containing only these relevant data lines.
    const operationalDataLines = allTextualLines.slice(2);

    /**
     * A utility function to compute the scalar product (dot product) of a data row
     * with a given vector of weights.
     * @param {string[]} dataElementsAsStrings - Array of string representations of data values for a single row.
     * @param {number[]} weightsArray - Array of numeric weight coefficients.
     * @returns {number} The calculated weighted sum for the row.
     */
    const calculateScalarProduct = (dataElementsAsStrings, weightsArray) => {
        let runningTotal = 0.0; // Initialize sum with a floating-point zero for precision.

        // It's crucial that the number of data elements matches the number of weights.
        // If they differ, we use the minimum length to prevent out-of-bounds access
        // and to handle malformed input gracefully by truncating.
        const effectiveProcessingLength = Math.min(dataElementsAsStrings.length, weightsArray.length);

        for (let elementIndex = 0; elementIndex < effectiveProcessingLength; ++elementIndex) {
            const currentDataValueStr = dataElementsAsStrings[elementIndex];
            const currentWeight = weightsArray[elementIndex];

            const numericDataValue = Number(currentDataValueStr);

            if (Number.isNaN(numericDataValue)) {
                // If a data element is not a valid number, a warning is issued,
                // and it's treated as zero for the sum, effectively ignoring its contribution.
                console.warn(`Warning: Non-numeric data value encountered ('${currentDataValueStr}') at index ${elementIndex}. Treating as 0.`);
                runningTotal += 0 * currentWeight; // Contribution is zero.
            } else {
                // Otherwise, multiply the data value by its corresponding weight and add to the total.
                runningTotal += numericDataValue * currentWeight;
            }
        }
        return runningTotal;
    };

    // Filter the data lines based on whether their weighted sum is positive.
    const linesWithPositiveSum = operationalDataLines.filter(
        (currentDataEntryLine) => {
            // Ignore any entirely empty lines within the data entries section.
            if (currentDataEntryLine.trim().length === 0) {
                return false;
            }

            // Split the current data line into its constituent string elements.
            const individualDataElementStrings = currentDataEntryLine.split(' ');

            // Compute the weighted sum for this specific data entry.
            const rowWeightedSumResult = calculateScalarProduct(individualDataElementStrings, numericWeightCoefficients);

            // The condition for inclusion is that the weighted sum must be strictly greater than zero.
            // Using Math.sign for a slightly different, but equivalent, expression compared to a direct > 0 check.
            return Math.sign(rowWeightedSumResult) === 1; // Returns 1 for positive numbers.
        }
    );

    // The final result is the total count of data lines that satisfied the positive sum criterion.
    const finalCountOfMatchedEntries = linesWithPositiveSum.length;

    // Output the computed count to the standard console.
    console.log(finalCountOfMatchedEntries);

    // Optionally, return the count for programmatic access or testing.
    return finalCountOfMatchedEntries;
};

// This is the entry point for executing the script.
// It handles reading input from the standard input stream and invoking the processing logic.
(function initializeAndExecuteDataPipeline() {
    try {
        // Utilize the Node.js file system module for input operations.
        const fileSystemUtility = require('node:fs');
        const standardInputDevicePath = '/dev/stdin';
        const textEncodingScheme = 'utf8';

        // Synchronously read all content from the standard input file descriptor.
        const rawInputContentFromStream = fileSystemUtility.readFileSync(standardInputDevicePath, textEncodingScheme);

        // Pass the acquired raw content to our main processing function.
        processInputContent(rawInputContentFromStream);

    } catch (fileReadError) {
        // Catch and report any errors that occur during the file reading process.
        console.error("An unrecoverable error occurred while attempting to read from the standard input:", fileReadError.message);
        // Terminate the process with an error code to indicate failure.
        process.exit(1);
    }
})();