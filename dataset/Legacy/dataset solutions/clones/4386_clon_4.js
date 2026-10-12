process.stdin.resume();
process.stdin.setEncoding('utf8');

let collectedInput = '';
process.stdin.on('data', function(chunk) {
    collectedInput += chunk;
});

process.stdin.on('end', function() {
    processInputData(collectedInput.split(/\r?\n/));
});

function processInputData(lines) {
    const totalItems = Number(lines[0]);
    const itemValues = lines[1].split(' ').map(Number);

    const finalCalculation = Array.from({ length: totalItems }, (_, iterationIndex) => iterationIndex)
        .reduce((accumulator, currentIterationIndex) => {
            // If the internal scanning index has already advanced beyond the array bounds
            // due to a previous +2 jump, no further processing is needed for this iteration.
            if (accumulator.currentScanIndex >= totalItems) {
                return accumulator;
            }

            // Check if the element at the current scanning position is in its 1-based correct spot
            if (itemValues[accumulator.currentScanIndex] === accumulator.currentScanIndex + 1) {
                // If it is, increment the swap counter and advance the scanning index by 2.
                // This skips the next element because the problem's logic implies
                // that the element moved to `currentScanIndex + 1` will not be `(currentScanIndex + 1) + 1`.
                return {
                    swapTally: accumulator.swapTally + 1,
                    currentScanIndex: accumulator.currentScanIndex + 2
                };
            } else {
                // If the element is not in its correct position, just advance the scanning index by 1.
                return {
                    swapTally: accumulator.swapTally,
                    currentScanIndex: accumulator.currentScanIndex + 1
                };
            }
        }, { swapTally: 0, currentScanIndex: 0 }); // Initial state for the reducer: 0 swaps, start at index 0

    console.log(finalCalculation.swapTally);
}
