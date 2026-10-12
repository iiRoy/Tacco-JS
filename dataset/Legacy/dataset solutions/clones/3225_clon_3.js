function calculateAbsoluteDifferences(sortedValues) {
    const computedDifferences = [];
    for (let k = 0; k < sortedValues.length - 1; k++) {
        computedDifferences.push(Math.abs(sortedValues[k] - sortedValues[k + 1]));
    }
    return computedDifferences;
}

function processInputAndCalculate(rawInputData) {
    const inputLines = rawInputData.split('\n');

    const configStringParts = inputLines[0].split(' ');
    const spinPositionsStr = inputLines[1].split(' ');

    let countN = Number(configStringParts[0]);
    let countM = Number(configStringParts[1]);

    const spinPositions = spinPositionsStr.map(Number);

    spinPositions.sort((valA, valB) => valA - valB);

    let positionDifferences = calculateAbsoluteDifferences(spinPositions);

    let effectiveN = Math.min(countN, countM);

    // Type III transformation: Instead of iteratively finding and zeroing out maxes,
    // we sort the differences and sum the smallest ones.
    positionDifferences.sort((diffA, diffB) => diffA - diffB); // Sort ascending

    let totalDistance = 0;
    // The original logic removes N-1 largest differences.
    // This means we need to sum (M-1) - (N-1) smallest differences.
    // This simplifies to M - N differences.
    // If M=1, M-1=0 differences.
    // If N >= M, then effectiveN = M. M - effectiveN = 0. Sum 0 differences.
    // If N < M, then effectiveN = N. M - N differences.
    const numDifferencesToSum = countM - effectiveN;

    // Ensure we don't try to sum a negative number of differences
    const actualDifferencesToSum = Math.max(0, numDifferencesToSum);

    for (let loopIndex = 0; loopIndex < actualDifferencesToSum; loopIndex++) {
        totalDistance += positionDifferences[loopIndex];
    }

    console.log(totalDistance);
}

processInputAndCalculate(require('fs').readFileSync('/dev/stdin', 'utf8'));
