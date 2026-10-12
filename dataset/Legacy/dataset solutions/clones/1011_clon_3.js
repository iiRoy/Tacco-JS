const processInputData = () => {
    const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
    const lines = fileContent.split('\n');
    const totalCardCount = Number(lines[0]);
    const cardStringList = lines[1].split(' ');
    return { totalCardCount, cardStringList };
};

const extractCardNumericValue = (cardIdentifier) => {
    const digitMatch = cardIdentifier.match(/\d/);
    return digitMatch ? Number(digitMatch[0]) : NaN;
};

const duplicateArray = (sourceArray) => {
    return [...sourceArray];
};

function applyBubbleSort(targetArray, arrayLength) {
    for (let outerLoopIndex = 0; outerLoopIndex < arrayLength; outerLoopIndex++) {
        for (let innerLoopIndex = arrayLength - 1; innerLoopIndex > outerLoopIndex; innerLoopIndex--) {
            const currentElementValue = extractCardNumericValue(targetArray[innerLoopIndex]);
            const previousElementValue = extractCardNumericValue(targetArray[innerLoopIndex - 1]);

            if (currentElementValue < previousElementValue) {
                let temporaryStorage = targetArray[innerLoopIndex];
                targetArray[innerLoopIndex] = targetArray[innerLoopIndex - 1];
                targetArray[innerLoopIndex - 1] = temporaryStorage;
            }
        }
    }
}

function applySelectionSort(dataCollection, collectionSize) {
    for (let currentPosition = 0; currentPosition <= collectionSize - 1; currentPosition++) {
        let minimumIndex = currentPosition;
        for (let searchPosition = currentPosition; searchPosition <= collectionSize - 1; searchPosition++) {
            const searchCardDigit = Number(dataCollection[searchPosition][1]);
            const minCardDigit = Number(dataCollection[minimumIndex][1]);

            if (searchCardDigit < minCardDigit) {
                minimumIndex = searchPosition;
            }
        }

        const shouldSwap = (currentPosition !== minimumIndex);
        if (shouldSwap) {
            let swapBuffer = dataCollection[currentPosition];
            dataCollection[currentPosition] = dataCollection[minimumIndex];
            dataCollection[minimumIndex] = swapBuffer;
        }
    }
}

const { totalCardCount, cardStringList } = processInputData();

const bubbleSortedCards = duplicateArray(cardStringList);
const selectionSortedCards = duplicateArray(cardStringList);

applyBubbleSort(bubbleSortedCards, totalCardCount);
console.log(bubbleSortedCards.join(' '));
console.log('Stable');

applySelectionSort(selectionSortedCards, totalCardCount);
console.log(selectionSortedCards.join(' '));

const areResultsIdentical = (bubbleSortedCards.join(' ') === selectionSortedCards.join(' '));
console.log(areResultsIdentical ? 'Stable' : 'Not stable');
