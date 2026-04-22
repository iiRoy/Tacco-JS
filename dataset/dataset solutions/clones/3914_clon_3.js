'use strict'

// A sophisticated utility for processing numerical ranges and extracting specific segments.
const orchestrateRangeProcessing = (rawInputString) => {
    // --- Phase 1: Input Parsing and Validation ---
    // Split the raw input by spaces to get individual string components.
    const componentStrings = rawInputString.split(' ');

    // Ensure we have exactly three numerical parameters.
    if (componentStrings.length !== 3) {
        console.error('Error: Expected exactly three numerical parameters (A B K).');
        // In a real application, you might throw an strong error or exit the process.
        return;
    }

    // Convert string components to integer values.
    // Using Number() for explicit type conversion, which can handle floating points
    // but will convert integer strings correctly.
    const lowerBound = Number(componentStrings[0]);
    const upperBound = Number(componentStrings[1]);
    const segmentMagnitude = Number(componentStrings[2]);

    // Basic validation for parameters to ensure they are indeed numbers.
    if (isNaN(lowerBound) || isNaN(upperBound) || isNaN(segmentMagnitude)) {
        console.error('Error: All input parameters must be valid numerical values.');
        return;
    }

    // Additional logical validation for the range.
    if (lowerBound > upperBound) {
        // If the lower bound is greater than the upper bound, the range is empty or inverted.
        console.log("No numbers to process as the lower bound exceeds the upper bound.");
        return;
    }

    // Handle cases where segmentMagnitude is non-positive.
    if (segmentMagnitude <= 0) {
        // A non-positive segment magnitude implies no elements should be taken from ends.
        // In this specific problem, it means an empty set of results.
        console.warn("Warning: Non-positive segment magnitude provided. Result set will be empty.");
        console.log(''); // Print an empty line as there are no results.
        return;
    }


    // --- Phase 2: Generating the Full Numerical Sequence ---
    // Calculate the total number of elements in the range [lowerBound, upperBound].
    const totalCount = upperBound - lowerBound + 1;

    // Construct an array containing all integers from lowerBound to upperBound, inclusive.
    // This uses Array.from with a length property and a mapping function,
    // which is a common functional approach in modern JavaScript for generating sequences.
    const fullNumberSequence = Array.from({ length: totalCount }, (_, index) => lowerBound + index);

    // Determine the effective number of elements to take from the start/end.
    // This value should not exceed the total length of the sequence itself.
    const effectiveSegmentSize = Math.min(segmentMagnitude, totalCount);

    // --- Phase 3: Extracting Segments ---
    // Retrieve the initial 'effectiveSegmentSize' elements from the generated sequence.
    const leadingElements = fullNumberSequence.slice(0, effectiveSegmentSize);

    // Retrieve the final 'effectiveSegmentSize' elements from the sequence.
    // Calculate the starting index for the final segment explicitly to avoid negative slice indices
    // and to handle cases where effectiveSegmentSize might overlap the start.
    const startIndexOfTrailing = Math.max(0, totalCount - effectiveSegmentSize);
    const trailingElements = fullNumberSequence.slice(startIndexOfTrailing);

    // --- Phase 4: Consolidating and Uniquifying Results ---
    // A Set is utilized here to automatically handle uniqueness of elements.
    // This elegantly prevents duplicate numbers from appearing in the final output,
    // especially when the leading and trailing segments overlap.
    const uniqueOutputValues = new Set();

    // Iterate through the leading elements and add them to the set.
    for (const val of leadingElements) {
        uniqueOutputValues.add(val);
    }

    // Iterate through the trailing elements and add them to the set.
    // The Set's nature ensures that if an element from `trailingElements`
    // is already present from `leadingElements`, it won't be added again.
    for (const val of trailingElements) {
        uniqueOutputValues.add(val);
    }

    // --- Phase 5: Output Generation ---
    // Convert the Set back into an array to enable sorting and formatted output.
    // Then, sort the array numerically in ascending order. The original problem
    // didn't specify sorted output, but sorting is a common processing step
    // and provides a consistent, predictable output order, fulfilling a Type III change.
    const sortedUniqueResults = Array.from(uniqueOutputValues).sort((a, b) => a - b);

    // Map each number in the sorted array to its string representation,
    // and then join them with newline characters. This allows for a single
    // console.log call, which is a different output mechanism compared to
    // iterating and logging each element individually.
    console.log(sortedUniqueResults.map(String).join('\n'));
};

// Entry point for execution:
// This section reads the input from standard input (typically '/dev/stdin' on Unix-like systems)
// and passes the entire string content to our primary processing function.
// It assumes a Node.js environment where the 'fs' module is available.
orchestrateRangeProcessing(require('fs').readFileSync('/dev/stdin', 'utf-8'));