function ProcessInput(inputData) {
    // A utility function for performing a numeric comparison during sorting.
    const numericSorter = (valueA, valueB) => valueA - valueB;

    // Extract the first line of input to get the total element count and sub-array length.
    const firstLineSegments = inputData.split('\n')[0].split(' ');
    let totalElements = Number(firstLineSegments[0]); // Corresponds to N
    let segmentLength = Number(firstLineSegments[1]); // Corresponds to K

    // Parse the second line of input to obtain the array of numerical values.
    const sourceNumbers = inputData.split('\n')[1].split(' ').map(item => Number(item)); // Corresponds to P

    // An array to accumulate the string representations of the modified sequences.
    let resultStrings = [];

    // Iterate through the source numbers to generate all possible sub-arrays of 'segmentLength'.
    for (let currentIdx = 0; currentIdx < totalElements - segmentLength + 1; currentIdx++) {
        // Create a temporary slice of the source numbers.
        let temporarySlice = sourceNumbers.slice(currentIdx, currentIdx + segmentLength);
        // Sort this temporary slice numerically using our custom sorter.
        temporarySlice.sort(numericSorter);

        // Reconstruct the full array by concatenating the parts before, the sorted slice, and the parts after.
        // Then, convert this reconstructed array into a single string and store it.
        resultStrings[currentIdx] = sourceNumbers.slice(0, currentIdx)
                                                .concat(temporarySlice)
                                                .concat(sourceNumbers.slice(currentIdx + segmentLength))
                                                .toString();
    }

    // Create a Set from the collected strings to automatically filter out duplicates.
    const distinctOutcomes = new Set(resultStrings);

    // Output the total number of unique string outcomes.
    console.log(distinctOutcomes.size);
}

// Invoke the main processing function, reading input from standard input.
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
