const outputDisplay = console.log;

function parseNumericLine(lineContent) {
    if (typeof lineContent !== 'string' || lineContent.trim() === '') {
        return [];
    }
    return lineContent.trim().split(" ").map(val => {
        const numericValue = Number(val);
        // Original behavior allows NaN to propagate, so we'll keep that.
        return numericValue;
    });
}

function prepareAndValidateInput(rawDataString) {
    if (typeof rawDataString !== 'string' || rawDataString.length === 0) {
        outputDisplay("Input string is empty or invalid. Processing halted.");
        return;
    }

    let allInputRows = rawDataString.split("\n");

    // The original code discards the first two lines and the last (often empty) line.
    // Explicitly handle these initial data trims.
    if (allInputRows.length < 3) { // Need at least 3 lines for data after removing 2 headers and 1 potential empty tail.
        outputDisplay("Insufficient input lines provided for processing. Expected at least 3 lines.");
        return;
    }

    // Remove the initial two lines (e.g., metadata, counts)
    allInputRows.splice(0, 2);

    // Remove the last line if it's empty (common in stdin streams)
    if (allInputRows.length > 0 && allInputRows[allInputRows.length - 1].trim() === '') {
        allInputRows.pop();
    }

    if (allInputRows.length === 0) {
        outputDisplay("No meaningful data rows left after initial preparation. Aborting.");
        return;
    }

    // Convert each remaining string row into an array of numbers
    const processedNumericRows = allInputRows.map(parseNumericLine).filter(row => row.length > 0);

    if (processedNumericRows.length === 0) {
        outputDisplay("All parsed rows were empty or invalid. No data to analyze.");
        return;
    }

    executeCoreLogic(processedNumericRows);
}

function executeCoreLogic(numericDataRows) {
    if (!Array.isArray(numericDataRows) || numericDataRows.length < 2) {
        outputDisplay("Processed numeric data is invalid or too sparse to form batches.");
        return;
    }

    const dataCollections = [];

    // Group the numeric data rows into pairs for each dataset.
    // The original logic consumes two lines per dataset.
    for (let i = 0; i < numericDataRows.length; i += 2) {
        if (i + 1 < numericDataRows.length) {
            const currentDataSetPair = [numericDataRows[i], numericDataRows[i + 1]];
            dataCollections.push(currentDataSetPair);
        } else {
            outputDisplay(`Warning: An odd number of data rows was detected. Row at index ${i} will be ignored.`);
        }
    }

    if (dataCollections.length === 0) {
        outputDisplay("No complete data collections could be formed. Exiting analysis.");
        return;
    }

    // Process each collected data batch individually.
    dataCollections.forEach(dataBatch => {
        // Use destructuring for clearer access to the two parts of the batch.
        const [configurationRow, valuesSequence] = dataBatch;

        // Basic validation for the structure of the data batch.
        if (!Array.isArray(configurationRow) || configurationRow.length < 2 || !Array.isArray(valuesSequence) || valuesSequence.length < 2) {
            outputDisplay("Skipping malformed data batch due to insufficient elements in configuration or values sequence.");
            return;
        }

        const countToRemove = configurationRow[1]; // This is 'ppow' from original.

        const calculatedGaps = [];

        // Compute the differences between consecutive elements in the values sequence.
        // The original logic skips the very first difference (starts from index 1).
        for (let i = 1; i < valuesSequence.length; i++) {
            const currentElement = valuesSequence[i];
            const previousElement = valuesSequence[i - 1];
            calculatedGaps.push(currentElement - previousElement);
        }

        // Sort the calculated differences in descending order (largest first).
        calculatedGaps.sort((valA, valB) => valB - valA);

        // Remove a specified number of the largest differences.
        // The original code removes 'ppow - 1' items.
        // Ensure we don't try to remove a negative number of items.
        const numItemsToDiscard = Math.max(0, countToRemove - 1);

        // Use slice for efficient removal and creation of a new array.
        const remainingGaps = calculatedGaps.slice(numItemsToDiscard);

        // Sum the remaining differences.
        if (remainingGaps.length > 0) {
            const totalSumOfGaps = remainingGaps.reduce((accumulator, currentGap) => {
                // The original code's reduce had redundant undefined checks for numbers.
                // Simplified for a guaranteed array of numbers.
                return accumulator + currentGap;
            }, 0); // Provide an explicit initial value for robustness.
            outputDisplay(totalSumOfGaps);
        } else {
            // If no differences remain after filtering or if the array was empty initially.
            outputDisplay(0);
        }
    });
}

// Entry point: Configure and initiate input stream processing.
function setupStreamInputHandler(completionCallback) {
    if (typeof process !== "undefined" && process.stdin && process.stdin.resume) {
        let incomingStreamData = ""; // Accumulates all data from stdin.

        process.stdin.resume();
        process.stdin.setEncoding('utf8');

        process.stdin.on('data', (dataChunk) => {
            incomingStreamData += dataChunk;
        });

        process.stdin.on('end', () => {
            // Introduce a small validation for empty input stream.
            if (incomingStreamData.trim().length === 0) {
                outputDisplay("No data was received from standard input.");
                return;
            }
            completionCallback(incomingStreamData);
        });

        process.stdin.on('error', (err) => {
            outputDisplay(`Error encountered during standard input operation: ${err.message}`);
            // Depending on application, might exit or attempt recovery.
            process.exit(1);
        });

    } else {
        outputDisplay("Warning: This environment does not support standard input stream processing.");
        outputDisplay("Please ensure execution within a Node.js environment for expected behavior.");
        // In a real-world scenario, a fallback for input (e.g., from file, prompt) would be implemented here.
    }
}

setupStreamInputHandler(prepareAndValidateInput);