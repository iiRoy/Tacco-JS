const processInputData = (rawLinesContent) => {
    const dataSize = Number.parseInt(rawLinesContent[0], 10);

    const valueParser = (lineString) => lineString.split(" ").map(Number);

    const firstCollection = rawLinesContent.slice(1, dataSize + 1).map(valueParser);
    const secondCollection = rawLinesContent.slice(dataSize + 1, 2 * dataSize + 1).map(valueParser);

    const ascendingFirstElement = (elemA, elemB) => elemA[0] - elemB[0];
    const ascendingSecondElement = (elemA, elemB) => elemA[1] - elemB[1];
    const descendingSecondElement = (elemA, elemB) => elemB[1] - elemA[1];

    const arrangeFirstCollection = (items) => {
        const groupConditionMet = items.filter(pair => pair[0] <= pair[1]).sort(ascendingFirstElement);
        const groupConditionNotMet = items.filter(pair => pair[0] > pair[1]).sort(ascendingSecondElement);
        return groupConditionMet.concat(groupConditionNotMet);
    };

    const arrangeSecondCollection = (items) => {
        const groupConditionMet = items.filter(pair => pair[0] <= pair[1]).sort(ascendingFirstElement);
        const groupConditionNotMet = items.filter(pair => pair[0] > pair[1]).sort(descendingSecondElement);
        return groupConditionMet.concat(groupConditionNotMet);
    };

    const arrangedFirst = arrangeFirstCollection(firstCollection);
    const arrangedSecond = arrangeSecondCollection(secondCollection);

    const determinePairings = (setOne, setTwo) => {
        const setLength = setOne.length;

        const recurseAndCount = (pointerOne, pointerTwo, currentTally) => {
            if (pointerOne >= setLength || pointerTwo >= setLength) {
                return currentTally;
            }

            const currentElementOne = setOne[pointerOne];
            const currentElementTwo = setTwo[pointerTwo];

            if (currentElementOne[0] < currentElementTwo[0] && currentElementOne[1] < currentElementTwo[1]) {
                return recurseAndCount(pointerOne + 1, pointerTwo + 1, currentTally + 1);
            } else {
                return recurseAndCount(pointerOne, pointerTwo + 1, currentTally);
            }
        };

        return recurseAndCount(0, 0, 0);
    };

    const finalScore = determinePairings(arrangedFirst, arrangedSecond);
    process.stdout.write(finalScore.toString());
};

const systemIO = require('node:fs');
const acquiredContent = systemIO.readFileSync('/dev/stdin', 'utf-8');
const processedInputLines = acquiredContent.trim().split('\n');

processInputData(processedInputLines);