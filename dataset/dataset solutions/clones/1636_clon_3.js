(async () => {
    // A temporary array to accumulate incoming byte chunks from the standard input.
    const collectedInputFragments = [];

    // Utilize an asynchronous loop to read all available data from stdin.
    // Each received chunk is converted to a string format for consistency.
    for await (const dataChunk of process.stdin) {
        collectedInputFragments.push(dataChunk.toString());
    }

    // Concatenate all collected string fragments into a single, comprehensive input string.
    const fullRawInput = collectedInputFragments.join('');

    // Define patterns for parsing the input data.
    const LINE_DELIMITER_REGEX = /\r?\n/; // Regular expression to handle various line endings.
    const TOKEN_SEPARATOR_REGEX = /\s+/;  // Regular expression for one or more whitespace characters.

    // Split the entire raw input into individual logical lines.
    // Filter out any lines that are empty or contain only whitespace.
    let processedInputLines = fullRawInput.split(LINE_DELIMITER_REGEX).filter(line => line.trim() !== '');

    // Implement a guard clause for insufficient input data.
    if (processedInputLines.length < 2) {
        // console.error("Execution halted: Insufficient input lines provided for configuration and data.");
        return; // Prematurely exit the IIFE.
    }

    // Utility function for robust numeric string parsing.
    const convertToNumber = (stringValue) => {
        const numericValue = parseFloat(stringValue);
        // If conversion results in Not-a-Number, default to zero or handle as an error.
        return isNaN(numericValue) ? 0 : numericValue;
    };

    // Extract the configuration settings from the very first line of input.
    // This line typically contains two space-separated integers.
    const settingsLine = processedInputLines.shift(); // Removes and returns the first line.
    const configurationTokens = settingsLine.split(TOKEN_SEPARATOR_REGEX);

    // Parse the core parameters: total number of elements and the count of adjustment cycles.
    const totalDataElements = convertToNumber(configurationTokens[0]);
    const numAdjustmentRounds = convertToNumber(configurationTokens[1]);

    // Basic validation for the parsed configuration values.
    if (totalDataElements <= 0 || numAdjustmentRounds < 0) {
        // console.error("Invalid input parameters detected: total elements must be positive, adjustment rounds non-negative.");
        return; // Exit if parameters are not valid.
    }

    // Factory function to create a new structured data record.
    // Each record is an array: [original_value, current_computed_value, division_count].
    const constructDataRecord = (initialStringValue) => {
        const initialNum = convertToNumber(initialStringValue);
        return [initialNum, initialNum, 1]; // Initialize with original, current, and a count of 1.
    };

    // Process the actual data values from the next available line.
    const dataValuesString = processedInputLines.shift(); // Removes and returns the second line.
    let dataItemStructures = dataValuesString
        .split(TOKEN_SEPARATOR_REGEX)
        .filter(token => token.trim() !== '') // Exclude any empty string tokens.
        .slice(0, totalDataElements)         // Limit to the specified number of elements.
        .map(constructDataRecord);           // Transform each string into a structured record.

    // A check to ensure the actual number of data items matches the expected count.
    if (dataItemStructures.length < totalDataElements) {
        // console.warn("Warning: Fewer data items provided than specified. Processing with available items.");
        // No action needed for this clone, but could log or adjust.
    }

    // Helper routine to identify the data record with the highest 'current_computed_value'.
    const identifyMaxRatioRecord = (recordCollection) => {
        if (recordCollection.length === 0) {
            return null; // Return null if the collection is empty.
        }
        let topRatioEntry = recordCollection[0];
        for (let i = 1; i < recordCollection.length; i++) {
            // Compare based on the second element (current_computed_value).
            if (recordCollection[i][1] > topRatioEntry[1]) {
                topRatioEntry = recordCollection[i];
            }
        }
        return topRatioEntry;
    };

    // Helper routine to modify a record based on the problem's logic.
    const applyValueRecalculation = (targetRecord) => {
        targetRecord[2]++; // Increment the division count (third element).
        targetRecord[1] = targetRecord[0] / targetRecord[2]; // Update the current_computed_value.
    };

    // Execute the series of adjustment rounds as specified by 'numAdjustmentRounds'.
    for (let roundCounter = 0; roundCounter < numAdjustmentRounds; roundCounter++) {
        // Find the record that currently possesses the highest calculated value.
        let currentHighestRecord = identifyMaxRatioRecord(dataItemStructures);

        // If a valid record is found, apply the recalculation.
        if (currentHighestRecord) {
            applyValueRecalculation(currentHighestRecord);
            // Optionally, add logging for each step:
            // console.debug(`Round ${roundCounter + 1}: Record updated. New value: ${currentHighestRecord[1].toFixed(2)}`);
        } else {
            // If no records are present (e.g., empty initial data), break the loop.
            break;
        }
    }

    // After completing all adjustment rounds, determine the ultimate highest value among all records.
    const ultimatePeakElement = identifyMaxRatioRecord(dataItemStructures);

    // If an ultimate peak element is successfully identified, calculate its ceiling and print.
    if (ultimatePeakElement) {
        const ceilingOfFinalValue = Math.ceil(ultimatePeakElement[1]);
        // Output the final, rounded-up result to the standard console.
        console.log(ceilingOfFinalValue);
    } else {
        // Provide a default output if no elements were processed or found, indicating an edge case.
        // console.error("No valid data elements found for final maximum determination.");
        console.log(0); // A fallback output value.
    }
})().catch(operationalError => {
    // Implement a global error handler for any uncaught exceptions during asynchronous operations.
    // console.error("An unexpected operational error occurred:", operationalError.message);
    process.exit(1); // Exit the process with a non-zero status code to indicate failure.
});