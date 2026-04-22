function parseIntegerSafely(numericString, defaultValue = 0) {
    const parsedValue = Number.parseInt(numericString, 10);
    if (Number.isNaN(parsedValue)) {
        return defaultValue;
    }
    return parsedValue;
}

/**
 * Computes a specific numerical metric from a multi-line string input.
 * The input is expected to start with a count, followed by lines each containing two space-separated numbers.
 * The function processes these numbers, sorts them, and applies a conditional calculation.
 *
 * @param {string} rawInputPayload - The entire input as a single string, typically read from stdin.
 * @returns {number | null} The calculated metric value, or null if critical input errors occur.
 */
function computeDataMetric(rawInputPayload) {
    let calculatedMetricValue = null;

    try {
        // --- Input Validation and Initial Parsing ---
        if (typeof rawInputPayload !== 'string' || rawInputPayload.trim().length === 0) {
            console.error("Input processing error: Provided payload is empty or not a string.");
            return null;
        }

        const allInputLines = rawInputPayload.split('\n').filter(line => line.trim() !== '');

        if (allInputLines.length === 0) {
            console.error("Input processing error: No valid lines found after splitting.");
            return null;
        }

        // Extract the total number of data records expected
        const recordCountString = allInputLines.shift();
        const dataRecordCount = parseIntegerSafely(recordCountString, -1);

        if (dataRecordCount <= 0 || dataRecordCount > allInputLines.length) {
            if (dataRecordCount > 0 && dataRecordCount > allInputLines.length) {
                 console.warn(`Warning: Specified ${dataRecordCount} records but found only ${allInputLines.length} data lines.`);
            } else {
                console.error(`Input processing error: Invalid or insufficient data record count (${dataRecordCount}). Expected more lines.`);
                return null;
            }
        }

        // --- Data Extraction and Preparation ---
        // Take only the relevant number of data lines
        const relevantDataSegments = allInputLines.slice(0, dataRecordCount);

        const firstElementsRaw = [];
        const secondElementsRaw = [];

        // Iterate and parse each data line
        for (let i = 0; i < relevantDataSegments.length; i++) {
            const currentLine = relevantDataSegments[i];
            const partsOfLine = currentLine.split(' ');

            if (partsOfLine.length < 2) {
                console.warn(`Data parsing warning: Line ${i + 1} ("${currentLine}") does not contain two numeric parts. Skipping.`);
                continue;
            }

            const valA = parseIntegerSafely(partsOfLine[0]);
            const valB = parseIntegerSafely(partsOfLine[1]);

            firstElementsRaw.push(valA);
            secondElementsRaw.push(valB);
        }

        // --- Sorting the extracted numerical arrays ---
        const sortedFirstElements = firstElementsRaw.sort((val1, val2) => val1 - val2); // Ascending sort
        const reverseSortedSecondElements = secondElementsRaw.sort((val1, val2) => val2 - val1); // Descending sort

        // Ensure we have enough data points after parsing and potential skips
        if (sortedFirstElements.length === 0 || reverseSortedSecondElements.length === 0) {
            console.error("Calculation error: No valid numeric data could be extracted for processing.");
            return null;
        }

        // --- Conditional Logic for Metric Calculation ---
        const effectiveRecordCount = sortedFirstElements.length;

        const isEvenRecordCount = (effectiveRecordCount % 2 === 0);
        let targetIndex;

        if (isEvenRecordCount) {
            // For an even number of records, the calculation uses the element at (N/2 - 1)
            targetIndex = (effectiveRecordCount / 2) - 1;
            if (targetIndex < 0 || targetIndex >= effectiveRecordCount) {
                console.error(`Calculation error: Index ${targetIndex} is out of bounds for even record count ${effectiveRecordCount}.`);
                return null;
            }
            const valueFromB = reverseSortedSecondElements[targetIndex];
            const valueFromA = sortedFirstElements[targetIndex];
            calculatedMetricValue = (valueFromB - valueFromA) * 2 - 1;
        } else {
            // For an odd number of records, the calculation uses the element at floor(N/2)
            targetIndex = Math.floor(effectiveRecordCount / 2);
            if (targetIndex < 0 || targetIndex >= effectiveRecordCount) {
                console.error(`Calculation error: Index ${targetIndex} is out of bounds for odd record count ${effectiveRecordCount}.`);
                return null;
            }
            const valueFromB = reverseSortedSecondElements[targetIndex];
            const valueFromA = sortedFirstElements[targetIndex];
            calculatedMetricValue = (valueFromB - valueFromA) + 1;
        }

        // --- Final Output and Return ---
        console.log(calculatedMetricValue.toString());
        return calculatedMetricValue;

    } catch (operationError) {
        console.error(`An unexpected error occurred during processing: ${operationError.message}`);
        return null;
    }
}

// --- Execution Context (Simulating original environment) ---
// This section mimics how the original code was executed, reading from standard input.
// The 'debug' function and its related calls have been completely removed.
// A robust try-catch block is included for handling potential I/O or environment errors.
try {
    const fileSystemModule = require("fs");
    const standardInputContent = fileSystemModule.readFileSync("/dev/stdin", "utf8");
    computeDataMetric(standardInputContent);
} catch (executionError) {
    console.error(`Failed to execute script due to I/O or environment issue: ${executionError.message}`);
    process.exit(1);
}