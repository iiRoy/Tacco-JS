let printToOutput = console.log;

// Detect execution environment: Node.js for standard input, or a placeholder for others.
if (typeof process !== "undefined" && process.stdin && process.stdin.isTTY) {
    let accumulatedRawText = "";
    // Prepare standard input stream to receive data.
    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    // Attach listener for incoming data fragments.
    process.stdin.on('data', (dataFragment) => {
        accumulatedRawText += dataFragment;
    });

    // Attach listener for the end of the input stream.
    process.stdin.on('end', () => {
        // Once all input is gathered, begin the processing pipeline.
        initiateInputProcessing(accumulatedRawText);
    });
} else if (typeof document !== "undefined") {
    // This branch would handle browser-based input, e.g., from a textarea or file.
    // For this exercise, we prioritize Node.js stdin, but this shows a structural addition.
    printToOutput("Environment detected: Browser-like. Standard input via Node.js is not active.");
    // Example: If a default input string were to be processed in a browser context:
    // const browserTestInput = "5\n1 10\n100 90 80 70 60 50 40 30 20 10\n2 3\n5 10 15 20\n";
    // initiateInputProcessing(browserTestInput);
} else {
    // Fallback for other environments where standard input might not be present.
    printToOutput("No recognized standard input mechanism found. Input processing will not start.");
}

/**
 * Converts a single string line into an array of numeric values.
 * It robustly handles potential parsing failures by omitting non-numeric entries.
 * @param {string} inputLineString The string line to be parsed.
 * @returns {number[]} An array containing only valid numbers from the input line.
 */
function convertLineToNumbers(inputLineString) {
    if (typeof inputLineString !== 'string' || inputLineString.trim().length === 0) {
        return []; // Return an empty array for invalid or empty input strings.
    }
    const stringTokens = inputLineString.trim().split(/\s+/); // Split by one or more spaces
    const numericResults = stringTokens.map(token => {
        const parsedNumber = Number(token);
        // Filter out NaN results from failed string-to-number conversions.
        return isNaN(parsedNumber) ? null : parsedNumber;
    }).filter(value => value !== null); // Remove null entries (which were originally NaN).

    return numericResults;
}

/**
 * Serves as the initial handler for the raw text received from the input source.
 * It cleans up the input and orchestrates its further processing.
 * @param {string} fullRawInput The complete raw text input string.
 */
function initiateInputProcessing(fullRawInput) {
    if (!fullRawInput || fullRawInput.trim().length === 0) {
        printToOutput("Error: No raw input data provided for processing.");
        return;
    }

    // Split the entire input into an array of individual lines.
    let separatedLines = fullRawInput.split("\n");

    // Filter out any completely empty lines to ensure cleaner data.
    separatedLines = separatedLines.filter(line => line.trim().length > 0);

    // According to the original logic, certain header/footer lines are discarded.
    // Remove the first line if present (often a total count or general header).
    if (separatedLines.length > 0) {
        separatedLines.shift();
    }
    // Remove the last line if present (often an empty line or specific footer).
    if (separatedLines.length > 0) {
        separatedLines.pop();
    }

    // If no lines remain after initial cleanup, there's nothing to process.
    if (separatedLines.length === 0) {
        printToOutput("Notice: All lines were filtered out during initial input cleanup.");
        return;
    }

    // Pass the cleaned array of string lines to the core logic function.
    executeDatasetCalculations(separatedLines);
}

/**
 * The core function that processes the cleaned string lines, groups them into
 * datasets, and performs the required mathematical operations on each dataset.
 * @param {string[]} cleanStringLines An array of string lines, pre-processed and ready for numeric conversion.
 */
function executeDatasetCalculations(cleanStringLines) {
    // The original logic implies yet another header line removal at the start of the main processing.
    if (cleanStringLines.length > 0) {
        cleanStringLines.shift();
    } else {
        printToOutput("No data lines left after initial header removal for dataset processing.");
        return;
    }

    // Convert all remaining string lines into arrays of numbers using our helper.
    const numericLineArrays = cleanStringLines.map(convertLineToNumbers);

    // Group the numeric arrays into logical datasets, each consisting of two consecutive arrays.
    const collectedProblemSets = [];
    let currentLineIndex = 0;
    while (currentLineIndex < numericLineArrays.length) {
        const currentProblemPair = [];
        // Attempt to add the first array for the pair.
        if (currentLineIndex < numericLineArrays.length) {
            currentProblemPair.push(numericLineArrays[currentLineIndex]);
            currentLineIndex++;
        }
        // Attempt to add the second array for the pair.
        if (currentLineIndex < numericLineArrays.length) {
            currentProblemPair.push(numericLineArrays[currentLineIndex]);
            currentLineIndex++;
        } else {
            // If we run out of lines before forming a complete pair, log a warning and stop.
            printToOutput("Warning: An incomplete data pair was detected at the end of the input. Remaining line(s) will be ignored.");
            break;
        }

        // Only add fully formed pairs to the collection.
        if (currentProblemPair.length === 2) {
            collectedProblemSets.push(currentProblemPair);
        }
    }

    // Process each collected problem set individually.
    for (const singleProblemSet of collectedProblemSets) {
        // Extract the 'power' or 'threshold' value from the first array of the dataset.
        // It's expected to be at index 1 of the first nested array.
        const thresholdIndexValue = singleProblemSet[0][1];

        // Validate the extracted threshold value.
        if (typeof thresholdIndexValue !== 'number' || isNaN(thresholdIndexValue) || thresholdIndexValue < 1) {
            printToOutput("Error: Invalid or out-of-range threshold value detected in a dataset. Skipping this set.");
            continue; // Move to the next dataset if this one is malformed.
        }

        const dataPointsForAnalysis = singleProblemSet[1];
        // Ensure there are enough data points to calculate differences.
        if (!Array.isArray(dataPointsForAnalysis) || dataPointsForAnalysis.length < 2) {
            printToOutput("Error: Insufficient data points for difference calculation in a dataset. Skipping this set.");
            continue;
        }

        // Calculate the differences between adjacent elements in the data points array.
        const computedDifferences = [];
        for (let i = 1; i < dataPointsForAnalysis.length; i++) {
            computedDifferences.push(dataPointsForAnalysis[i] - dataPointsForAnalysis[i - 1]);
        }

        // Sort the calculated differences in descending order (largest to smallest).
        computedDifferences.sort((a, b) => b - a);

        // Determine the starting index for slicing the sorted differences array.
        // This effectively removes the 'thresholdIndexValue - 1' largest differences.
        const effectiveSliceStart = thresholdIndexValue - 1;

        let finalDifferencesSubset = [];
        // Ensure the slice start index is valid before attempting to slice.
        if (effectiveSliceStart >= 0 && effectiveSliceStart < computedDifferences.length) {
            finalDifferencesSubset = computedDifferences.slice(effectiveSliceStart);
        } else if (effectiveSliceStart < 0) {
            // If thresholdIndexValue was 0 or negative, this implies an invalid operation for 'removing largest'.
            // In this case, the subset remains empty, leading to a sum of 0, which is a safe default.
            printToOutput(`Warning: Negative slice start index (${effectiveSliceStart}) for dataset. Result will be 0.`);
        }
        // If effectiveSliceStart >= computedDifferences.length, slice() naturally returns an empty array,
        // which is correct for summing to 0.

        // Sum all the values in the resulting subset of differences.
        // The initial value of 0 handles cases where finalDifferencesSubset is empty.
        const totalAccumulatedValue = finalDifferencesSubset.reduce((accumulator, currentVal) => accumulator + currentVal, 0);

        // Output the final calculated result for the current problem set.
        printToOutput(totalAccumulatedValue);
    }
}