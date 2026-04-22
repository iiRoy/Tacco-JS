const getOverlap = (firstCollection, secondCollection) => {
    // This function identifies common elements between two numeric arrays.
    // It's an intersection operation.
    const commonElements = firstCollection.filter(element => secondCollection.includes(element));
    return commonElements;
};

const processInputData = (inputStringContent) => {
    // Clean and split the raw input into individual lines.
    // The .trim() ensures no leading/trailing empty lines affect processing.
    let processedLines = inputStringContent.trim().split('\n');

    // The first line is typically metadata (e.g., count of subsequent lines)
    // and is removed as per the original logic.
    processedLines.shift();

    // If no data lines remain after removing the header, there's nothing to process.
    if (processedLines.length === 0) {
        console.log("0");
        return;
    }

    // This array will store collections of numbers representing segments or ranges.
    let segmentIntervals = [];

    // Populate segmentIntervals by parsing each line of input data.
    // Each line is expected to contain two space-separated numbers: START END.
    // The segment will then include numbers from START (inclusive) up to END (exclusive).
    for (let currentLineIndex = 0; currentLineIndex < processedLines.length; currentLineIndex++) {
        const lineContent = processedLines[currentLineIndex];
        const parts = lineContent.split(' ').map(Number); // Convert string parts to numbers

        const segmentStart = parts[0];
        const segmentEnd = parts[1];

        // Basic validation for parsed numbers to handle malformed input.
        // If parsing fails or segment definition is invalid (start >= end),
        // an empty segment is added to maintain array structure, and a warning is logged.
        if (isNaN(segmentStart) || isNaN(segmentEnd) || segmentStart >= segmentEnd) {
            console.error(`Warning: Skipping invalid or empty segment definition: "${lineContent}"`);
            segmentIntervals.push([]); // Add an empty array for invalid lines
            continue;
        }

        let currentSegment = [];
        // Generate the sequence of numbers for the current segment.
        // This loop populates `currentSegment` with integers from `segmentStart` to `segmentEnd - 1`.
        for (let currentVal = segmentStart; currentVal < segmentEnd; currentVal++) {
            currentSegment.push(currentVal);
        }
        segmentIntervals.push(currentSegment);
    }

    // Initialize the count of distinct (non-overlapping) segments.
    // If there are segments, we start with at least one distinct group.
    let distinctSegmentCount = (segmentIntervals.length > 0) ? 1 : 0;

    // Iterate through the segment collections to find and merge overlaps.
    // The loop continues as long as there's a next segment to compare with the current one.
    let currentEvaluationIndex = 0;
    while (currentEvaluationIndex < segmentIntervals.length - 1) {
        const primarySegment = segmentIntervals[currentEvaluationIndex];
        const secondarySegment = segmentIntervals[currentEvaluationIndex + 1];

        // Determine the intersection (common elements) of the two adjacent segments.
        const intersectionResult = getOverlap(primarySegment, secondarySegment);

        // If the intersection array has elements, it means the segments overlap.
        if (intersectionResult.length > 0) {
            // Replace the primary segment with their common (overlapping) part.
            segmentIntervals[currentEvaluationIndex] = intersectionResult;
            // Remove the secondary segment as it has been effectively merged into the primary.
            segmentIntervals.splice(currentEvaluationIndex + 1, 1);
            // Decrement the index to re-evaluate the newly merged segment
            // with the element that is now at `currentEvaluationIndex + 1`.
            currentEvaluationIndex--;
            // Ensure the index doesn't become negative.
            if (currentEvaluationIndex < 0) {
                currentEvaluationIndex = 0;
            }
        } else {
            // If no overlap, these are distinct segments. Increment the count.
            distinctSegmentCount++;
            // Move to the next primary segment for comparison.
            currentEvaluationIndex++;
        }
    }

    // Output the final count of distinct segments.
    console.log(`${distinctSegmentCount}`);
};

// Main execution block: reads input from stdin and passes it to the processing function.
try {
    const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
    processInputData(fileContent);
} catch (error) {
    console.error("An error occurred while reading input or processing data:", error.message);
    // Optionally, provide a default or exit behavior for robustness.
    process.exit(1);
}