function processData(rawData) {
    const dataLines = rawData.split('\n');

    const [countN, windowK] = dataLines[0].split(' ').map(Number);

    const parsedNumbers = dataLines.map((line, lineIndex) => {
        if (lineIndex === 0) {
            // The original code parses 'N K' as N, so we replicate that.
            return parseInt(line, 10);
        }
        return parseInt(line, 10);
    });

    // The original code sorts elements from index 1 up to (input.length - 2).
    // Given parsedNumbers.length is (countN + 1), this means sorting from index 1 up to countN - 1.
    // Element at index 0 (which is countN itself) is untouched.
    // Element at index countN (the last data point) is also untouched.
    const sortableSegment = parsedNumbers.slice(1, countN);
    sortableSegment.sort((valA, valB) => valA - valB);

    // Reconstruct the array to match the original's state after its partial sort.
    const finalNumericSequence = [parsedNumbers[0], ...sortableSegment];
    if (parsedNumbers.length > countN) {
        finalNumericSequence.push(parsedNumbers[countN]);
    }

    // Initialize the minimum span value.
    // Original: minTree = Math.abs(input[1]-input[init[1]]);
    // This translates to Math.abs(finalNumericSequence[1] - finalNumericSequence[windowK]).
    let minimumSpan = Math.abs(finalNumericSequence[1] - finalNumericSequence[windowK]);

    // The original loop iterates: for(var i=1; i < input.length - 2 - init[1]; i++)
    // input.length is (countN + 1). init[1] is windowK.
    // So, i goes from 1 up to (countN + 1) - 2 - windowK - 1 = countN - windowK - 2.
    // This means the loop runs for indices 1, 2, ..., (countN - windowK - 2).
    // If (countN - windowK - 2) is less than 1, the loop does not execute.
    const iterationRangeLength = countN - windowK - 1; // Upper bound for i is exclusive, so length is (upper bound - 1) - 1 + 1 = upper bound - 1
    
    if (iterationRangeLength > 0) {
        const indicesToEvaluate = Array.from({ length: iterationRangeLength }, (_, index) => index + 1);

        minimumSpan = indicesToEvaluate.reduce((currentMin, currentIdx) => {
            // Original: input[i + init[1]] - input[i]
            const currentDifference = finalNumericSequence[currentIdx + windowK] - finalNumericSequence[currentIdx];
            return Math.min(currentMin, currentDifference);
        }, minimumSpan);
    }

    console.log(minimumSpan);
}

processData(require("fs").readFileSync("/dev/stdin", "utf8"));
