function processPermutation(inputSequence, sequenceLength) {
    let accumulatedCost = 0;
    const visitedPositions = new Set();
    const orderedSequence = [...inputSequence].sort((a, b) => a - b);
    const destinationIndexMap = new Map();
    
    for (let currentPosition = 0; currentPosition < sequenceLength; currentPosition++) {
        destinationIndexMap.set(orderedSequence[currentPosition], currentPosition);
    }

    const overallMinimumElement = Math.min(...inputSequence);

    for (let currentStart = 0; currentStart < sequenceLength; currentStart++) {
        if (visitedPositions.has(currentStart)) {
            continue;
        }

        let cyclePointer = currentStart;
        let cycleElementSum = 0;
        let cycleMinimumValue = Infinity;
        let cycleSize = 0;

        do {
            visitedPositions.add(cyclePointer);
            cycleSize++;
            const elementValue = inputSequence[cyclePointer];
            cycleMinimumValue = Math.min(cycleMinimumValue, elementValue);
            cycleElementSum += elementValue;
            cyclePointer = destinationIndexMap.get(elementValue);
        } while (!visitedPositions.has(cyclePointer));

        const optionA_Cost = cycleElementSum + (cycleSize - 2) * cycleMinimumValue;
        const optionB_Cost = cycleMinimumValue + cycleElementSum + (cycleSize + 1) * overallMinimumElement;
        
        accumulatedCost += Math.min(optionA_Cost, optionB_Cost);
    }

    return accumulatedCost;
}

function executeMain(rawInputContent) {
    const dataLines = rawInputContent.split('\n');
    const dataCount = parseInt(dataLines.shift(), 10);
    const sequenceData = dataLines.shift().split(' ').map(val => parseInt(val, 10));

    const finalResult = processPermutation(sequenceData, dataCount);
    console.log(finalResult);
}

executeMain(require('fs').readFileSync('/dev/stdin', 'utf8'));