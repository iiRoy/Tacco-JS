function ProcessInputData(rawDataSegment) {
    // Validate the initial input: ensure it's a non-empty string.
    if (typeof rawDataSegment !== 'string' || rawDataSegment.trim().length === 0) {
        console.error("Input processing terminated: Provided data segment is invalid or empty.");
        return;
    }

    // Divide the entire raw text into individual lines, accommodating both Windows and Unix line endings.
    // The first line is typically a header or count, which we intend to disregard for the calculation.
    const textLinesCollection = rawDataSegment.split(/\r?\n/);

    // If, after splitting, there's only one line (likely just the header) or no lines,
    // there's no actual data to process.
    if (textLinesCollection.length <= 1) {
        console.warn("No meaningful data records found after inspecting input. Only header or empty lines detected.");
        return;
    }

    // Isolate the actual data records by excluding the first line.
    const relevantDataRecords = textLinesCollection.slice(1);

    // Transform each data record string into an array of two numerical values.
    // Each record is expected to contain two space-separated integers representing an interval.
    const parsedNumericIntervals = relevantDataRecords
        .map(currentLineString => {
            // Skip processing for any completely empty lines that might appear in the data.
            if (currentLineString.trim().length === 0) {
                return null; // Mark as non-processable
            }
            return currentLineString.split(' ').map(stringComponent => {
                const numericValue = Number(stringComponent);
                // Report and mark as invalid if a component cannot be converted to a number.
                if (isNaN(numericValue)) {
                    console.warn(`Encountered a non-numeric string '${stringComponent}'. This part will be excluded.`);
                    return NaN; // Flag as an invalid number
                }
                return numericValue;
            });
        })
        .filter(processedPair =>
            // Filter out any null entries (from empty lines) or pairs that are not arrays of two valid numbers.
            processedPair !== null &&
            Array.isArray(processedPair) &&
            processedPair.length === 2 &&
            !processedPair.some(val => isNaN(val))
        );

    // If, after all parsing and filtering, no valid numeric intervals remain, exit.
    if (parsedNumericIntervals.length === 0) {
        console.warn("No valid numeric intervals could be extracted for calculation.");
        return;
    }

    // Calculate the total cumulative length by summing up the lengths of all valid intervals.
    // An interval [A, B] has a length of (B - A + 1).
    const finalAccumulatedLength = parsedNumericIntervals.reduce((runningTotal, currentIntervalPair) => {
        const intervalStart = currentIntervalPair[0]; // The beginning of the current range.
        const intervalEnd = currentIntervalPair[1];   // The end of the current range.

        // Implement a basic check: ensure the start of the interval does not exceed its end.
        if (intervalStart > intervalEnd) {
            console.warn(`Skipping malformed interval [${intervalStart}, ${intervalEnd}]: Start value is greater than end value.`);
            return runningTotal; // Do not include this invalid interval in the sum.
        }

        const currentIntervalSpan = intervalEnd - intervalStart + 1; // Compute inclusive length.
        return runningTotal + currentIntervalSpan; // Add to the sum.
    }, 0); // Begin the accumulation with an initial value of zero.

    // Display the final computed sum of all interval lengths.
    console.log(finalAccumulatedLength);
}

// Invoke the main processing function by reading input from standard input.
// This setup is typical for competitive programming environments or Node.js scripts.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));