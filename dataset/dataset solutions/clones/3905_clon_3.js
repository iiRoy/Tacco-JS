let inputBufferAccumulator = ''; // Accumulates all incoming data chunks from standard input

// Configure standard input: set encoding to UTF-8 and resume the stream.
process.stdin.setEncoding('utf8');
process.stdin.resume();

// Event listener for 'data' event: appends each received chunk to the buffer.
process.stdin.on('data', (dataChunk) => {
    inputBufferAccumulator += dataChunk;
});

// Event listener for 'end' event: executed once the entire input stream has been received.
// This block contains the primary logic for processing the input.
process.stdin.on('end', () => {
    // Split the accumulated input into individual lines, filtering out any empty lines.
    const inputLines = inputBufferAccumulator.split('\n').filter(line => line.trim() !== '');

    // --- Input Validation and Parsing ---
    // Ensure that at least two lines are present (one for count, one for numbers).
    if (inputLines.length < 2) {
        console.error("Error: Insufficient input provided. Expected at least two non-empty lines.");
        return; // Terminate execution if input is malformed.
    }

    // Attempt to parse the total count of elements from the first line.
    const totalElementsCount = parseInt(inputLines[0].trim(), 10);

    // Validate the parsed count: must be a valid number and positive.
    if (isNaN(totalElementsCount) || totalElementsCount <= 0) {
        console.error("Error: Invalid or non-positive element count specified on the first line.");
        return;
    }

    // Split the second line into an array of string-represented numbers.
    const rawNumberStrings = inputLines[1].trim().split(' ');
    
    // Verify that the actual number of elements matches the declared count.
    if (rawNumberStrings.length !== totalElementsCount) {
        console.error(`Error: Declared element count (${totalElementsCount}) does not match the actual number of elements (${rawNumberStrings.length}) found on the second line.`);
        return;
    }

    // Convert the array of number strings into an array of actual numeric values.
    // Using `Number()` constructor for type conversion.
    const originalNumericSequence = rawNumberStrings.map(numStr => Number(numStr));

    // Create a new array that is a sorted copy of the original sequence.
    // The spread operator `...` creates a shallow copy before sorting.
    const orderedNumericSequence = [...originalNumericSequence].sort((a, b) => a - b);

    // --- Preprocessing for Rank-based Median Determination ---
    // A Map is used to store each unique numeric value from the sorted sequence
    // along with an array of its 0-indexed positions (ranks) within that sorted sequence.
    // This allows for unique consumption of ranks even for duplicate values.
    const valueToSortedPositionsMap = new Map();
    for (let k = 0; k < orderedNumericSequence.length; k++) {
        const currentSortedValue = orderedNumericSequence[k];
        if (!valueToSortedPositionsMap.has(currentSortedValue)) {
            valueToSortedPositionsMap.set(currentSortedValue, []);
        }
        valueToSortedPositionsMap.get(currentSortedValue).push(k);
    }

    // Calculate the "adjusted ceiling" for array indexing (totalElementsCount - 1).
    // This is used to determine the indices of the median candidates.
    const adjustedIndexCeiling = totalElementsCount - 1;

    // Determine the 0-indexed position of the lower median candidate.
    // For N elements, this is floor((N-1)/2).
    const lowerMedianCandidateIndex = Math.floor(adjustedIndexCeiling / 2);

    // Retrieve the actual numeric values for the lower and upper median candidates
    // from the sorted sequence.
    const lowerMedianCandidate = orderedNumericSequence[lowerMedianCandidateIndex];
    const upperMedianCandidate = orderedNumericSequence[lowerMedianCandidateIndex + 1];

    // --- Output Generation ---
    // Iterate through the original sequence of numbers.
    for (let currentElementIndex = 0; currentElementIndex < totalElementsCount; currentElementIndex++) {
        const currentValue = originalNumericSequence[currentElementIndex];
        
        // Retrieve a unique sorted rank for the current value from the map.
        // `pop()` is used to ensure each instance of a duplicate value gets a distinct rank.
        const sortedRank = valueToSortedPositionsMap.get(currentValue).pop();

        let resultantOutputValue; // Variable to store the final value to be printed.

        // Conditional logic to determine which median candidate to output.
        // If the current value's sorted rank is at or below the lower median index,
        // output the upper median candidate. Otherwise, output the lower one.
        if (sortedRank <= lowerMedianCandidateIndex) {
            resultantOutputValue = upperMedianCandidate;
        } else {
            resultantOutputValue = lowerMedianCandidate;
        }
        
        // Print the calculated result for the current element to standard output.
        console.log(resultantOutputValue);
    }
});

// Optional: Add an error handler for the standard input stream itself.
process.stdin.on('error', (err) => {
    console.error("An unhandled error occurred with the standard input stream:", err.message);
    process.exit(1); // Exit the process with an error code.
});