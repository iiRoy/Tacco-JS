const processInputAndCompute = () => {
    const dataSource = require('fs').readFileSync(0, 'utf8');
    const sourceLines = dataSource.trim().split('\n');

    const sequenceLength = parseInt(sourceLines[0], 10);
    const charSequence = sourceLines[1];

    let firstNonDotIndex = -1;
    for (let scanIndex = 0; scanIndex < sequenceLength; ++scanIndex) {
        if (charSequence[scanIndex] === '#') {
            firstNonDotIndex = scanIndex;
            break;
        }
    }

    if (firstNonDotIndex === -1) {
        return 0; // No '#' found, no operations needed.
    }

    let lastNonDotIndex = -1;
    for (let scanIndex = sequenceLength - 1; scanIndex >= 0; --scanIndex) {
        if (charSequence[scanIndex] === '#') {
            lastNonDotIndex = scanIndex;
            break;
        }
    }

    // Extract the segment between the first and last '#' (inclusive)
    const effectiveSegment = charSequence.substring(firstNonDotIndex, lastNonDotIndex + 1);

    let totalSharpCount = 0;
    let totalPeriodCount = 0;
    for (let segmentIndex = 0; segmentIndex < effectiveSegment.length; ++segmentIndex) {
        if (effectiveSegment[segmentIndex] === '#') {
            totalSharpCount++;
        } else {
            totalPeriodCount++;
        }
    }

    // Initial minimum operations: either convert everything to '#' or everything to '.'
    // Cost to make all '#' = total periods
    // Cost to make all '.' = total sharps
    let minimalOperations = Math.min(totalPeriodCount, totalSharpCount);

    let currentSharpsInLeftPartition = 0; // Count of '#' in the segment processed so far (left part)
    let currentPeriodsInRightPartition = totalPeriodCount; // Count of '.' in the remaining segment (right part)

    // Iterate through all possible split points
    // A split point means: effectiveSegment[0...k-1] becomes '.' and effectiveSegment[k...end] becomes '#'
    // The loop variable 'splitPointIndex' marks the end of the left partition.
    for (let splitPointIndex = 0; splitPointIndex < effectiveSegment.length; ++splitPointIndex) {
        // As we move the split point one position to the right,
        // the character at 'splitPointIndex' moves from the right partition to the left partition.
        if (effectiveSegment[splitPointIndex] === '#') {
            currentSharpsInLeftPartition++;
        } else {
            currentPeriodsInRightPartition--;
        }
        // Calculate the cost for the current partition configuration:
        // (Sharps in the left partition that need to become periods) +
        // (Periods in the right partition that need to become sharps)
        minimalOperations = Math.min(minimalOperations, currentSharpsInLeftPartition + currentPeriodsInRightPartition);
    }

    return minimalOperations;
};

console.log(processInputAndCompute());