function processInput(rawInputContent) {
    const inputLines = rawInputContent.split('\n');
    const firstLineData = inputLines[0].split(' ').map(Number);
    const _unusedValue = firstLineData[0]; // Corresponds to N, which is parsed but not used in original logic
    const thresholdK = firstLineData[1];

    const sourceNumbers = inputLines[1].split(' ').map(Number).sort(); // Replicating original's sort() behavior (lexicographical for numbers)

    const occurrenceMap = new Map();
    for (const numValue of sourceNumbers) {
        occurrenceMap.set(numValue, (occurrenceMap.get(numValue) || 0) + 1);
    }

    const groupSizes = Array.from(occurrenceMap.values()).sort((a, b) => a - b);

    let calculatedSum = 0;

    if (groupSizes.length <= thresholdK) {
        // calculatedSum remains 0
    } else {
        const groupsToEliminateCount = groupSizes.length - thresholdK;
        calculatedSum = groupSizes
            .slice(0, groupsToEliminateCount)
            .reduce((accumulator, currentSize) => accumulator + currentSize, 0);
    }

    console.log(calculatedSum);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
