'use strict';

// Helper function to acquire raw input from standard input and parse it into structured data.
function acquireAndProcessRawInput() {
    // Attempt to read all data from standard input synchronously.
    const rawDataBuffer = require('fs').readFileSync('/dev/stdin', 'utf8');
    // Clean up the input: trim whitespace and split into individual lines.
    const cleanedInputLines = rawDataBuffer.trim().split('\n');

    // Basic validation: ensure there are at least two lines (N and the array A).
    if (cleanedInputLines.length < 2) {
        console.error("Error: Insufficient input data provided. Expected at least two lines.");
        process.exit(1); // Exit with an error code.
    }

    // Parse the first line, which should contain the total count of elements.
    const firstLineValue = Number.parseInt(cleanedInputLines[0].trim(), 10);
    // Validate that N is a positive integer.
    if (Number.isNaN(firstLineValue) || firstLineValue <= 0) {
        console.error("Error: The first line must be a positive integer representing the total number of elements.");
        process.exit(1);
    }
    const elementCount = firstLineValue;

    // Parse the second line, which contains the space-separated elements of the array.
    // Use a regex to split by one or more whitespace characters and filter out empty tokens.
    const secondLineTokens = cleanedInputLines[1].trim().split(/\s+/).filter(token => token !== '');
    // Validate that the number of parsed elements matches the declared count.
    if (secondLineTokens.length !== elementCount) {
        console.error(`Error: Expected ${elementCount} elements on the second line, but found ${secondLineTokens.length}.`);
        process.exit(1);
    }

    // Convert string tokens to numeric values and perform individual element validation.
    const numericValues = secondLineTokens.map(str => {
        const num = Number.parseInt(str, 10);
        // Assuming element values are distinct and range from 1 to elementCount (N).
        if (Number.isNaN(num) || num < 1 || num > elementCount) {
            console.error(`Error: Invalid element value '${str}'. Elements must be integers between 1 and ${elementCount}.`);
            process.exit(1);
        }
        return num;
    });

    // Return the parsed data as an object.
    return { elementCount, numericValues };
}

// Helper function to construct a map from each unique value to its original 0-indexed position.
// This map is essential for quickly locating the index of a specific value.
function constructValueIndexMapping(sourceArray, maxPossibleValue) {
    // Initialize an array to store the mapping. Array index (value - 1) will store the original index.
    // Filled with -1 to indicate unmapped values (or values not yet encountered).
    const valueMap = new Array(maxPossibleValue).fill(-1);

    const seenValues = new Set(); // To detect duplicate values.
    // Iterate through the source array to populate the map.
    for (let currentIdx = 0; currentIdx < sourceArray.length; ++currentIdx) {
        const currentValue = sourceArray[currentIdx];

        // Perform bounds checking for the value.
        if (currentValue < 1 || currentValue > maxPossibleValue) {
            console.error(`Error: Value ${currentValue} at index ${currentIdx} is out of expected range [1, ${maxPossibleValue}].`);
            process.exit(1);
        }
        // Check for duplicate values, which would break the assumption of unique values 1 to N.
        if (seenValues.has(currentValue)) {
            console.error(`Error: Duplicate value ${currentValue} found in the input array.`);
            process.exit(1);
        }
        seenValues.add(currentValue);

        // Store the 0-indexed original position for the value.
        valueMap[currentValue - 1] = currentIdx;
    }

    // Optional: Validate that all values from 1 to maxPossibleValue are indeed present.
    // This is often an implicit requirement for problems leveraging this specific mapping strategy.
    for (let i = 0; i < maxPossibleValue; i++) {
        if (valueMap[i] === -1) {
            console.error(`Error: Missing value ${i + 1} in the input array. All values from 1 to ${maxPossibleValue} must be present.`);
            process.exit(1);
        }
    }

    return valueMap;
}

// A class to represent a segment (sub-problem) that needs to be processed.
// This improves readability compared to using raw arrays for queue elements.
class ProcessingSegment {
    /**
     * @param {number} segmentStart - The starting index of the current array segment (inclusive).
     * @param {number} segmentEnd - The ending index of the current array segment (inclusive).
     * @param {number} minValSearchInitiator - The 0-indexed position in `valueToOriginalIndexMap`
     *                                         from which to start searching for the minimum element's value.
     */
    constructor(segmentStart, segmentEnd, minValSearchInitiator) {
        this.leftBoundary = segmentStart;
        this.rightBoundary = segmentEnd;
        this.minValSearchStartPos = minValSearchInitiator;
    }
}

// --- Main execution block encapsulated in an Immediately-Invoked Function Expression (IIFE) ---
(function calculateOverallWeightedSum() {
    // 1. Acquire and parse the initial input data.
    const { elementCount: totalElementsCount, numericValues: inputNumericArray } = acquireAndProcessRawInput();

    // 2. Pre-process the input array to create a mapping from value to its original index.
    // This map allows for efficient lookup of an element's position based on its value.
    const valueToOriginalIndexMap = constructValueIndexMapping(inputNumericArray, totalElementsCount);

    let totalWeightedSum = 0; // Initialize the accumulator for the final result.

    // 3. Initialize the processing queue. This queue will hold `ProcessingSegment` objects.
    // It's a breadth-first search (BFS) like approach to divide and conquer.
    const segmentProcessingQueue = [];

    // Add the initial, entire array segment to the queue.
    // The search for the minimum value in the full array starts from the smallest possible value (index 0 in valueToOriginalIndexMap).
    segmentProcessingQueue.push(new ProcessingSegment(0, totalElementsCount - 1, 0));

    // 4. Process segments from the queue until it becomes empty.
    while (segmentProcessingQueue.length > 0) {
        // Dequeue the next segment to be processed.
        const currentSegment = segmentProcessingQueue.shift();
        // Use object destructuring for cleaner access to segment properties.
        const { leftBoundary: currentSegmentLeft, rightBoundary: currentSegmentRight, minValSearchStartPos: currentMinSearchStart } = currentSegment;

        // Guard clause: If the segment is invalid (left index > right index), skip it.
        if (currentSegmentLeft > currentSegmentRight) {
            continue;
        }

        // 5. Find the actual minimum element within the current segment [currentSegmentLeft, currentSegmentRight].
        // We iterate through possible values (represented by their 0-indexed positions in `valueToOriginalIndexMap`),
        // starting from `currentMinSearchStart`. The first value whose original index falls within the current segment
        // is guaranteed to be the minimum for this segment.
        let candidateValueIndexInMap = currentMinSearchStart;
        let actualMinimumElementOriginalIndex = -1; // Placeholder for the 0-indexed position of the minimum element.

        // Loop to find the smallest value (and its index) that lies within the current segment boundaries.
        // Given the problem constraints (permutation of 1 to N), this loop is guaranteed to find a value.
        while (candidateValueIndexInMap < totalElementsCount) {
            const potentialOriginalIndex = valueToOriginalIndexMap[candidateValueIndexInMap];
            // Check if the original index of the current candidate value falls within the segment.
            if (potentialOriginalIndex >= currentSegmentLeft && potentialOriginalIndex <= currentSegmentRight) {
                actualMinimumElementOriginalIndex = potentialOriginalIndex;
                break; // Found the minimum element for this segment!
            }
            candidateValueIndexInMap++; // Move to the next smallest value to test.
        }

        // Defensive check: If no minimum was found, something is wrong with the input or logic.
        if (actualMinimumElementOriginalIndex === -1) {
             console.error("Critical Error: Failed to locate the minimum element within a valid segment. Check input data or algorithm logic.");
             process.exit(1);
        }

        // 6. Retrieve the actual value of the minimum element from the input array.
        const valueAtMinimumIndex = inputNumericArray[actualMinimumElementOriginalIndex];

        // 7. Calculate the contribution of this minimum element to the total sum.
        // The contribution is the value of the minimum element multiplied by the number of
        // sub-arrays it is the minimum for. This is derived from:
        // (number of possible left endpoints in the segment) * (number of possible right endpoints in the segment).
        const possibleLeftEndpoints = actualMinimumElementOriginalIndex - currentSegmentLeft + 1;
        const possibleRightEndpoints = currentSegmentRight - actualMinimumElementOriginalIndex + 1;
        
        const currentSegmentContribution = valueAtMinimumIndex * possibleLeftEndpoints * possibleRightEndpoints;
        totalWeightedSum += currentSegmentContribution;

        // 8. Prepare for processing child segments (divide and conquer).
        // For any child segment, the minimum element must have a value greater than
        // the minimum element of the parent segment. Thus, we can start searching
        // for the minimum in child segments from `candidateValueIndexInMap + 1`.
        const nextMinSearchPositionForChildren = candidateValueIndexInMap + 1;

        // Enqueue the left sub-segment if it is a valid range.
        const leftSubsegmentEnd = actualMinimumElementOriginalIndex - 1;
        if (currentSegmentLeft <= leftSubsegmentEnd) {
            segmentProcessingQueue.push(new ProcessingSegment(currentSegmentLeft, leftSubsegmentEnd, nextMinSearchPositionForChildren));
        }

        // Enqueue the right sub-segment if it is a valid range.
        const rightSubsegmentStart = actualMinimumElementOriginalIndex + 1;
        if (rightSubsegmentStart <= currentSegmentRight) {
            segmentProcessingQueue.push(new ProcessingSegment(rightSubsegmentStart, currentSegmentRight, nextMinSearchPositionForChildren));
        }
    }

    // 9. Output the final accumulated weighted sum.
    console.log(totalWeightedSum);

})(); // End of IIFE.