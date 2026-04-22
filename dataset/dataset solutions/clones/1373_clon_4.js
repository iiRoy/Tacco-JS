const interfaceModule = require('readline');

const inputProcessor = interfaceModule.createInterface({
    input: process.stdin
});

let storedLines = [];

inputProcessor.on('line', (individualLine) => {
    storedLines.push(individualLine);
});

inputProcessor.on('close', () => {
    function determineCombinations(currentSumAccumulated, itemsSelected, startFrom, maxBound, requiredSum) {
        const remainingItems = 3 - itemsSelected;

        if (remainingItems === 0) {
            return currentSumAccumulated === requiredSum ? 1 : 0;
        }

        if (maxBound - startFrom + 1 < remainingItems) {
            return 0;
        }

        let minPossibleSum = currentSumAccumulated;
        for (let idx = 0; idx < remainingItems; idx++) {
            minPossibleSum += (startFrom + idx);
        }
        if (minPossibleSum > requiredSum) {
            return 0;
        }

        let maxPossibleSum = currentSumAccumulated;
        for (let idx = 0; idx < remainingItems; idx++) {
            maxPossibleSum += (maxBound - idx);
        }
        if (maxPossibleSum < requiredSum) {
            return 0;
        }

        let currentProblemSolutions = 0;
        const loopUpperBound = maxBound - (remainingItems - 1);

        for (let choice = startFrom; choice <= loopUpperBound; choice++) {
            currentProblemSolutions += determineCombinations(
                currentSumAccumulated + choice,
                itemsSelected + 1,
                choice + 1,
                maxBound,
                requiredSum
            );
        }
        return currentProblemSolutions;
    }

    for (let lineIndex = 0; lineIndex < storedLines.length; lineIndex++) {
        const currentDataRow = storedLines[lineIndex];
        const numberParts = currentDataRow.split(' ');
        const limitValue = parseInt(numberParts[0], 10);
        const targetValue = parseInt(numberParts[1], 10);

        if (limitValue === 0 && targetValue === 0) {
            break;
        }

        const calculatedCount = determineCombinations(0, 0, 1, limitValue, targetValue);
        console.log(calculatedCount);
    }
});