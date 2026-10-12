const extractCardValue = (cardString) => {
    return Number(cardString.substring(1));
};

const getCardsWithValue = (cardCollection, valueToMatch) => {
    return cardCollection.filter(card => extractCardValue(card) === valueToMatch).join('');
};

const checkStability = (initialOrder, finalOrder) => {
    for (let idx = 0; idx < initialOrder.length; idx++) {
        const currentCardValue = extractCardValue(initialOrder[idx]);
        if (getCardsWithValue(initialOrder, currentCardValue) !== getCardsWithValue(finalOrder, currentCardValue)) {
            return false;
        }
    }
    return true;
};

const swapElements = (arr, indexA, indexB) => {
    const temp = arr[indexA];
    arr[indexA] = arr[indexB];
    arr[indexB] = temp;
};

const performQuickSort = (cardArray, lowIndex, highIndex) => {
    if (lowIndex >= highIndex) {
        return;
    }

    const pivotCard = cardArray[highIndex];
    let storeIndex = lowIndex - 1;

    for (let currentIndex = lowIndex; currentIndex <= highIndex - 1; currentIndex++) {
        if (extractCardValue(cardArray[currentIndex]) <= extractCardValue(pivotCard)) {
            storeIndex++;
            swapElements(cardArray, storeIndex, currentIndex);
        }
    }

    if (storeIndex + 1 === highIndex) {
        return;
    }

    swapElements(cardArray, storeIndex + 1, highIndex);

    performQuickSort(cardArray, lowIndex, storeIndex + 1);
    performQuickSort(cardArray, storeIndex + 1, highIndex);
};

const executeSortingProcess = (inputData) => {
    const inputLines = inputData.split('\n');
    const cardCount = Number(inputLines.shift());
    const cardsToSort = inputLines.slice(0, cardCount);
    const originalCardOrder = [...cardsToSort];

    performQuickSort(cardsToSort, 0, cardsToSort.length - 1);
    console.log(checkStability(originalCardOrder, cardsToSort) ? 'Stable' : 'Not stable');
    console.log(cardsToSort.join('\n'));
};

executeSortingProcess(require('fs').readFileSync('/dev/stdin', 'utf8'));
