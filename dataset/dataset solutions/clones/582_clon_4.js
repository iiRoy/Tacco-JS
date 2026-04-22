const lineInterpreter = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

let collectedDataLines = [];
lineInterpreter.on('line', (dataLine) => {
    collectedDataLines.push(dataLine);
});

lineInterpreter.on('close', () => {
    processAllDataSets(collectedDataLines);
});

function findUpperLimitIndex(sortedCollection, targetValue) {
    let lowBound = 0;
    let highBound = sortedCollection.length - 1;
    let resultIndex = -1;

    while (lowBound <= highBound) {
        let middleIndex = Math.floor((lowBound + highBound) / 2);
        if (sortedCollection[middleIndex] <= targetValue) {
            resultIndex = middleIndex;
            lowBound = middleIndex + 1;
        } else {
            highBound = middleIndex - 1;
        }
    }
    return resultIndex;
}

function processAllDataSets(completeInputLines) {
    let currentPosition = 0;

    const executeNextCalculation = () => {
        if (currentPosition >= completeInputLines.length) {
            return;
        }

        const currentConfigurationLine = completeInputLines[currentPosition];
        currentPosition++;

        const [dimensionCountStr, ceilingValueStr] = currentConfigurationLine.split(' ');
        const dimensionCount = parseInt(dimensionCountStr, 10);
        const ceilingValue = parseInt(ceilingValueStr, 10);

        if (dimensionCount === 0 && ceilingValue === 0) {
            return;
        }

        const sourceNumbers = [];
        for (let i = 0; i < dimensionCount; i++) {
            sourceNumbers.push(parseInt(completeInputLines[currentPosition], 10));
            currentPosition++;
        }
        sourceNumbers.push(0);

        const allPossiblePairings = sourceNumbers.flatMap((valA, idxA) =>
            sourceNumbers.slice(idxA).map(valB => valA + valB)
        );
        allPossiblePairings.sort((elem1, elem2) => elem1 - elem2);

        let currentMaximumAchieved = 0;
        for (const sumComponentA of allPossiblePairings) {
            const requiredRemainder = ceilingValue - sumComponentA;
            const suitableIndexB = findUpperLimitIndex(allPossiblePairings, requiredRemainder);

            if (suitableIndexB !== -1) {
                currentMaximumAchieved = Math.max(currentMaximumAchieved, sumComponentA + allPossiblePairings[suitableIndexB]);
            }
        }
        console.log(currentMaximumAchieved);

        executeNextCalculation();
    };

    executeNextCalculation();
}