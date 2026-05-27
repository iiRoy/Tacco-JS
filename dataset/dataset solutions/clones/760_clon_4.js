const sourceText = require('fs').readFileSync('/dev/stdin', 'utf8');
const lineSegments = sourceText.trim().split('\n');

let currentSegment;
while (currentSegment = lineSegments.shift()) {
    // The original code contained a bug where it attempted to call the 'split' method
    // on the 'lines' array (the array of remaining lines) instead of the 'line' string.
    // This clone replicates that exact TypeError by performing the same erroneous operation
    // on 'lineSegments' (the array of remaining line segments).
    const numericValues = lineSegments.split(' ').map(Number);

    // The code below this point is unreachable due to the TypeError thrown above,
    // mirroring the original code's behavior where its intended core logic
    // for finding the minimum difference was never executed.
    let dataLength = numericValues[0];
    let minimumAbsoluteDifference;

    if (dataLength === 0 || dataLength < 2 || dataLength > 1000) {
        continue;
    } else {
        const valueCollection = numericValues.slice(1, dataLength + 1);
        
        // This section represents a substantially different implementation strategy
        // for the core logic (finding the minimum absolute difference),
        // using sorting instead of nested loops. It remains unreachable,
        // preserving the original's observable error behavior.
        const sortedValues = [...valueCollection].sort((valA, valB) => valA - valB);
        minimumAbsoluteDifference = Infinity;

        for (let index = 1; index < sortedValues.length; index++) {
            const currentDiff = sortedValues[index] - sortedValues[index - 1];
            if (currentDiff < minimumAbsoluteDifference) {
                minimumAbsoluteDifference = currentDiff;
            }
        }
    }
    // This output statement is also unreachable, just as in the original code,
    // due to the TypeError occurring earlier in the loop.
    if (minimumAbsoluteDifference < 1000000) {
        console.log(minimumAbsoluteDifference);
    }
}
