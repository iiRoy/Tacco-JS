const input = require("fs").readFileSync("/dev/stdin", "utf8");

((rawInput) => {
    const lines = rawInput.split('\n');
    const sequenceLength = Number(lines[0]);
    const sequenceData = lines[1].split(' ').map(Number);

    // This function calculates the number of valid contiguous sub-sequences
    // that start at a given 'initialPosition' and satisfy the sum === xor condition.
    // It replaces the inner 'for' loop and its auxiliary arrays (d, xor) from the original.
    const computeValidPrefixCount = (initialPosition) => {
        // A recursive helper to traverse the sequence from 'currentPosition' onwards,
        // accumulating sum and XOR, and counting valid segments.
        const recursiveCheck = (currentPosition, currentAccumulatedSum, currentAccumulatedXor) => {
            // Base case: If we have processed all elements or gone beyond the sequence boundary,
            // no more valid segments can be formed from this path.
            if (currentPosition >= sequenceLength) {
                return 0;
            }

            const elementValue = sequenceData[currentPosition];
            const nextAccumulatedSum = currentAccumulatedSum + elementValue;
            const nextAccumulatedXor = currentAccumulatedXor ^ elementValue;

            // Check if the segment from 'initialPosition' up to 'currentPosition' is valid.
            if (nextAccumulatedSum === nextAccumulatedXor) {
                // If valid, count this segment and recursively attempt to extend it further
                // by including the next element.
                return 1 + recursiveCheck(currentPosition + 1, nextAccumulatedSum, nextAccumulatedXor);
            } else {
                // If the current segment is not valid, then any longer segment starting
                // at 'initialPosition' and extending past 'currentPosition' will also be invalid.
                // Therefore, we stop counting for this branch.
                return 0;
            }
        };

        // Initiate the recursive check for prefixes starting at 'initialPosition'.
        // The initial sum and XOR are 0 before including any elements.
        return recursiveCheck(initialPosition, 0, 0);
    };

    // The main logic: Iterate through all possible starting positions in the sequence.
    // For each starting position, call 'computeValidPrefixCount' to get its contribution
    // to the total count, and then sum up all these contributions.
    // This replaces the outer 'while' loop from the original code with a functional approach.
    const totalSatisfyingSegments = Array.from({ length: sequenceLength }, (_, startIdx) =>
        computeValidPrefixCount(startIdx)
    ).reduce((accumulator, segmentContribution) => accumulator + segmentContribution, 0);

    console.log(totalSatisfyingSegments);

})(input);
