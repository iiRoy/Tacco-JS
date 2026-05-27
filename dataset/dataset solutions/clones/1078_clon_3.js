function calculateMinimumCost(inputArray, arrayLength) {
    let totalCost = 0;
    const visitedIndices = new Array(arrayLength).fill(false);
    const sortedValues = Array.from(inputArray);
    const valueToIndexMap = [];

    const overallMinVal = Math.min(...inputArray);

    sortedValues.sort((a, b) => a - b);

    for (let k = 0; k < arrayLength; k++) {
        const currentSortedValue = sortedValues[k];
        valueToIndexMap[currentSortedValue] = k;
    }

    for (let currentStartIdx = 0; currentStartIdx < arrayLength; currentStartIdx++) {
        if (visitedIndices[currentStartIdx]) {
            continue;
        }

        let cycleCurrentIdx = currentStartIdx;
        let cycleSum = 0;
        let cycleMinVal = 10000;
        let cycleElementCount = 0;

        while (true) {
            visitedIndices[cycleCurrentIdx] = true;
            cycleElementCount++;
            const currentValue = inputArray[cycleCurrentIdx];
            cycleMinVal = Math.min(cycleMinVal, currentValue);
            cycleSum += currentValue;

            const nextCycleIndex = valueToIndexMap[currentValue];
            cycleCurrentIdx = nextCycleIndex;

            if (visitedIndices[cycleCurrentIdx]) {
                break;
            }
        }

        const option1Cost = cycleSum + (cycleElementCount - 2) * cycleMinVal;
        const option2Cost = cycleMinVal + cycleSum + (cycleElementCount + 1) * overallMinVal;

        totalCost += Math.min(option1Cost, option2Cost);
    }

    return totalCost;
}

function processInputAndSolve(rawInputString) {
    const inputLines = rawInputString.split('\n');
    
    const firstLineContent = inputLines.shift();
    const arrayLength = parseInt(firstLineContent, 10);

    const secondLineContent = inputLines.shift();
    const sequenceStringElements = secondLineContent.split(' ');
    const sequenceData = sequenceStringElements.map(elementString => parseInt(elementString, 10));

    const finalAnswer = calculateMinimumCost(sequenceData, arrayLength);
    console.log(finalAnswer);
}

processInputAndSolve(require('fs').readFileSync('/dev/stdin', 'utf8'));
