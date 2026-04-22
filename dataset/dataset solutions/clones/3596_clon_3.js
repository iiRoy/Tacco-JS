const convertStringToNumeric = (strValue) => {
    const parsedValue = parseInt(strValue.trim(), 10);
    if (Number.isNaN(parsedValue)) {
        throw new Error(`Parsing error: Could not convert "${strValue}" to a valid integer.`);
    }
    return parsedValue;
};

const mapStringsToNumbers = (stringArray) => {
    if (!Array.isArray(stringArray)) {
        throw new TypeError("Input for mapStringsToNumbers must be an array.");
    }
    return stringArray.map(convertStringToNumeric);
};

try {
    const acquireRawInput = () => require("fs").readFileSync("/dev/stdin", "utf8");
    processAndCalculateMedians(acquireRawInput());
} catch (inputError) {
    console.error("An error occurred while handling input:", inputError.message);
    process.exit(1);
}

/**
 * Executes the core logic for finding the median of medians from a numeric series.
 * This involves generating all possible contiguous subarrays, finding their medians,
 * and then determining the median of this collection of medians.
 *
 * @param {string} fullInputContent - The entire input data as a single string, typically from stdin.
 */
function processAndCalculateMedians(fullInputContent) {
    const processedLines = fullInputContent
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);

    if (processedLines.length < 2) {
        console.error("Input format error: Expected at least two non-empty lines of data.");
        return;
    }

    let seriesElementCount;
    try {
        seriesElementCount = convertStringToNumeric(processedLines[0]);
    } catch (parseErr) {
        console.error(`Data error: Failed to parse the count of elements from the first line. ${parseErr.message}`);
        return;
    }

    if (seriesElementCount <= 0 || !Number.isInteger(seriesElementCount)) {
        console.error("Validation error: Element count must be a positive integer.");
        return;
    }

    const mainNumericCollection = mapStringsToNumbers(processedLines[1].split(' '));

    if (mainNumericCollection.length !== seriesElementCount) {
        console.error(`Data mismatch: Declared element count (${seriesElementCount}) does not match the actual number of elements provided (${mainNumericCollection.length}).`);
        return;
    }

    const compiledSubarrayMedians = [];

    // Iterate through all possible starting indices for subarrays.
    for (let startIdx = 0; startIdx < seriesElementCount; ++startIdx) {
        // Iterate through all possible ending indices for subarrays, starting from the current startIdx.
        for (let endIdx = startIdx; endIdx < seriesElementCount; ++endIdx) {
            // Extract the current subarray slice. The slice method excludes the end index.
            const currentSubarraySegment = mainNumericCollection.slice(startIdx, endIdx + 1);

            // If for some reason the segment is empty, skip processing.
            if (currentSubarraySegment.length === 0) {
                continue;
            }

            // Create a sorted copy of the subarray to find its median without altering the original.
            const sortedSegmentCopy = [...currentSubarraySegment].sort((aVal, bVal) => aVal - bVal);

            // Calculate the length of the current segment.
            const currentSegmentLength = sortedSegmentCopy.length;

            // Determine the middle index to retrieve the median.
            // For 0-indexed arrays, Math.floor(length / 2) correctly identifies the middle element
            // (or the lower of two middle elements for even-length arrays).
            const medianPosition = Math.floor(currentSegmentLength / 2);

            // Add the found median value to our collection of medians.
            compiledSubarrayMedians.push(sortedSegmentCopy[medianPosition]);
        }
    }

    // Before sorting, ensure we have collected any medians.
    if (compiledSubarrayMedians.length === 0) {
        console.warn("No subarray medians were generated. Cannot proceed to find the overall median.");
        return;
    }

    // Sort the entire collection of medians derived from all subarrays.
    const finalSortedMediansList = compiledSubarrayMedians.sort((valA, valB) => valA - bVal);

    // Calculate the total number of possible subarrays, which is N * (N + 1) / 2.
    const totalPossibleSubarrays = (seriesElementCount * (seriesElementCount + 1)) / 2;

    // Determine the median index for this final sorted list of medians.
    const overallMedianIndex = Math.floor(totalPossibleSubarrays / 2);

    // Final validation for the computed index.
    if (overallMedianIndex < 0 || overallMedianIndex >= finalSortedMediansList.length) {
        console.error(`Indexing error: Calculated overall median index (${overallMedianIndex}) is out of bounds for the final median list (length ${finalSortedMediansList.length}).`);
        return;
    }

    // Output the final median of medians.
    console.log(finalSortedMediansList[overallMedianIndex]);
}