(async () => {
    // This asynchronous block processes standard input to perform a series of division operations.
    // The objective is to minimize the maximum value among a set of elements by repeatedly
    // dividing the largest element.
    let _rawStreamDataBuffer = ''; // Buffer to accumulate incoming data from standard input.

    // Await all data fragments from the process's standard input stream.
    // Concatenate each received piece into the main buffer.
    for await (const dataFragment of process.stdin) {
        _rawStreamDataBuffer = _rawStreamDataBuffer + String(dataFragment);
    }

    // A utility function to safely parse a string into an integer.
    const parseNumericValue = (numericString) => {
        const parsedValue = Number.parseInt(numericString.trim(), 10);
        // Basic validation: ensure the parsed value is a valid number.
        if (Number.isNaN(parsedValue)) {
            // Log a warning or handle invalid input gracefully, e.g., default to 0.
            console.warn(`Warning: Encountered non-numeric input "${numericString}". Treating as 0.`);
            return 0;
        }
        return parsedValue;
    };

    // Split the accumulated buffer content into individual lines based on newline characters.
    const parsedContentRows = _rawStreamDataBuffer.split(/\n/);

    // Extract the first line, which contains the configuration parameters (total items and division limit).
    const configurationLine = parsedContentRows.shift();

    // Validate if the configuration line exists before proceeding.
    if (!configurationLine) {
        console.error("Fatal Error: No configuration line found in input. Exiting.");
        return;
    }

    // Parse the total element count (N) and the division operation limit (K) from the first line.
    // The values are space-separated.
    const [totalElementCountStr, divisionOperationLimitStr] = configurationLine.split(/\s/);
    const totalElementCount = parseNumericValue(totalElementCountStr);
    const divisionOperationLimit = parseNumericValue(divisionOperationLimitStr);

    // Perform critical input validation for N and K.
    if (totalElementCount <= 0 || divisionOperationLimit < 0) {
        console.error(`Error: Invalid initial parameters. Total items (${totalElementCount}) must be positive, and division limit (${divisionOperationLimit}) must be non-negative.`);
        return;
    }
    if (parsedContentRows.length === 0) {
        console.error("Error: No element values provided after configuration line.");
        return;
    }

    // Initialize the collection of element records.
    // Each record stores: { initialValue, presentValue, divisionsMade }.
    // The 'presentValue' is initially the 'initialValue', and 'divisionsMade' starts at 1.
    const initialElementValues = parsedContentRows[0].split(/\s/)
                                                      .slice(0, totalElementCount) // Ensure we only take 'N' elements
                                                      .map(strValue => {
                                                          const numericVal = parseNumericValue(strValue);
                                                          return {
                                                              initialValue: numericVal,
                                                              presentValue: numericVal,
                                                              divisionsMade: 1
                                                          };
                                                      });

    // Verify that we have enough elements as specified by totalElementCount.
    if (initialElementValues.length < totalElementCount) {
        console.warn(`Warning: Expected ${totalElementCount} elements but found only ${initialElementValues.length}. Processing with available elements.`);
        // Adjust totalElementCount if necessary, or exit if strict validation is required.
        // For this clone, we'll proceed with what's available.
    }

    let elementMagnitudeRecords = initialElementValues.sort((recordA, recordB) => {
        // Custom comparison function for sorting in descending order based on 'presentValue'.
        // Higher 'presentValue' comes first.
        return recordB.presentValue - recordA.presentValue;
    });

    // Begin the main division process for the specified number of operations (K).
    for (let currentRoundIteration = 0; currentRoundIteration < divisionOperationLimit; currentRoundIteration++) {
        // Safety check: ensure there are elements to process.
        if (elementMagnitudeRecords.length === 0) {
            console.log("No elements left to divide. Terminating early.");
            break;
        }

        // Retrieve the record with the current highest magnitude.
        // Due to sorting, this will always be the first element.
        const highestMagnitudeRecord = elementMagnitudeRecords[0];

        // Increment its division counter.
        highestMagnitudeRecord.divisionsMade++;

        // Recalculate the present magnitude based on the initial value and new division count.
        highestMagnitudeRecord.presentValue = highestMagnitudeRecord.initialValue / highestMagnitudeRecord.divisionsMade;
        const recomputedMagnitude = highestMagnitudeRecord.presentValue; // Store for clarity in comparison

        // Remove the modified record from its current position (front of array).
        // This is a Type III deletion/update.
        elementMagnitudeRecords.splice(0, 1);

        // Determine the correct insertion point to maintain the descending sorted order.
        // This loop scans the *remaining* array to find where the recomputed record should go.
        let insertionCursorPosition = 0;
        while (insertionCursorPosition < elementMagnitudeRecords.length &&
               elementMagnitudeRecords[insertionCursorPosition].presentValue > recomputedMagnitude) {
            insertionCursorPosition++;
        }

        // Insert the modified record back into its new sorted position.
        // This is a Type III addition/update.
        elementMagnitudeRecords.splice(insertionCursorPosition, 0, highestMagnitudeRecord);
    }

    // After all division operations, the highest magnitude element is at the front.
    // Retrieve its present value and output its ceiling.
    if (elementMagnitudeRecords.length > 0) {
        const finalMaximumValue = elementMagnitudeRecords[0].presentValue;
        console.log(Math.ceil(finalMaximumValue));
    } else {
        console.log(0); // If no elements were processed, the max value is effectively 0.
    }
})();