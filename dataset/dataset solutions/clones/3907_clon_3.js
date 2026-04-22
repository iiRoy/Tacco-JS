process.stdin.resume();
process.stdin.setEncoding('utf8');

// Buffer to accumulate all incoming data from standard input.
let bufferedInputData = '';

// Event listener for incoming data chunks.
process.stdin.on('data', function(inputSegment) {
    bufferedInputData += inputSegment;
});

// Event listener for the end of the input stream.
process.stdin.on('end', function() {
    // Split the accumulated input into individual lines and remove any leading/trailing whitespace.
    const inputLines = bufferedInputData.trim().split('\n');

    // --- Robust Input Validation and Parsing ---
    // Ensure there are at least two lines of input and they are not empty.
    if (inputLines.length < 2 || inputLines[0].trim() === '' || inputLines[1].trim() === '') {
        console.error("Input Error: Insufficient or malformed data provided. Expected at least two non-empty lines.");
        return; // Terminate execution if input is invalid.
    }

    // Parse the first line to get the count of elements.
    const rawSizeString = inputLines[0].trim();
    const dataSize = Number.parseInt(rawSizeString, 10);

    // Validate the parsed data size.
    if (Number.isNaN(dataSize) || dataSize <= 0) {
        console.error("Input Error: Invalid data size specified on the first line. Must be a positive integer.");
        return;
    }

    // Parse the second line to get the space-separated numeric entries.
    const rawDataEntries = inputLines[1].trim().split(' ');

    // Verify that the number of provided entries matches the declared data size.
    if (rawDataEntries.length !== dataSize) {
        console.error(`Input Error: Mismatch between declared size (${dataSize}) and actual number of entries (${rawDataEntries.length}).`);
        return;
    }

    // Convert string entries to numbers for the original sequence.
    const originalNumericSequence = rawDataEntries.map(str => Number.parseInt(str, 10));

    // Create a sorted copy of the numeric sequence.
    // The spread operator `...` creates a shallow copy, then `sort` is applied.
    const orderedNumericSequence = [...originalNumericSequence].sort((a, b) => a - b);

    // Create a Map to store the indices of each value within the *sorted* sequence.
    // This allows tracking multiple occurrences of the same number by storing an array of indices.
    // Using a Map ensures proper handling of numeric keys.
    const valuePositionTracker = new Map();

    orderedNumericSequence.forEach((numValue, sortedIdx) => {
        if (valuePositionTracker.has(numValue)) {
            // If the value already exists, add the current sorted index to its list.
            valuePositionTracker.get(numValue).push(sortedIdx);
        } else {
            // If it's a new value, create a new list with the current sorted index.
            valuePositionTracker.set(numValue, [sortedIdx]);
        }
    });

    // Calculate the effective 'middle' index for median-like determinations.
    // The original logic used 'n-1' for the array's last index, then divided by 2.
    // This `medianLowerIndex` effectively points to the first of the two middle elements
    // for an even-sized array, or the true median for an odd-sized array.
    const lastValidSequenceIndex = dataSize - 1;
    const medianLowerIndex = Math.floor(lastValidSequenceIndex / 2);

    // Helper function to determine the "alternative" median-like value.
    // This logic is designed to find the median of the sequence *if* the element
    // corresponding to `currentElementSortedIndex` were removed.
    const determineAlternativeMedian = (currentElementSortedIndex) => {
        // If the current element's rank (its index in the sorted list) is in the lower half
        // (including the lower median for even counts), the "other" median is the element
        // immediately following the `medianLowerIndex`.
        if (currentElementSortedIndex <= medianLowerIndex) {
            return orderedNumericSequence[medianLowerIndex + 1];
        } else {
            // Otherwise, if the element's rank is in the upper half, the "other" median
            // is the element at `medianLowerIndex`.
            return orderedNumericSequence[medianLowerIndex];
        }
    };

    // Iterate through the original sequence to perform the primary calculation for each element.
    for (let currentOriginalIndex = 0; currentOriginalIndex < dataSize; currentOriginalIndex++) {
        const numericEntry = originalNumericSequence[currentOriginalIndex];

        // Retrieve the list of sorted indices for the current numeric entry.
        // Use `pop()` to consume one index, ensuring that if duplicate values exist
        // in the original sequence, each gets a unique sorted position mapping.
        const sortedPositionList = valuePositionTracker.get(numericEntry);

        // Robustness check: This scenario should ideally not occur with valid input.
        if (!sortedPositionList || sortedPositionList.length === 0) {
            console.warn(`Warning: Value ${numericEntry} at original index ${currentOriginalIndex} could not find a corresponding sorted position.`);
            // Fallback or skip if a critical error occurs. For now, we'll skip.
            continue;
        }

        const currentElementSortedIndex = sortedPositionList.pop();

        // Calculate the result using the helper function.
        const resultValue = determineAlternativeMedian(currentElementSortedIndex);

        // Output the calculated result.
        console.log(String(resultValue));
    }
});