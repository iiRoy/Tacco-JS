const fileSystem = require('fs');
const rawInputData = fileSystem.readFileSync('/dev/stdin', 'utf8');
const inputLines = rawInputData.split('\n');

const elementCount = parseInt(inputLines[0], 10);
const initialCardString = inputLines[1];
const originalCards = initialCardString.split(' ');

const getCardSortKey = (cardString) => {
    if (cardString && cardString.length > 1) {
        return cardString[1];
    }
    return '';
};

const bubbleSortedCards = [...originalCards];

for (let outerIdx = 0; outerIdx < elementCount; outerIdx++) {
    for (let innerIdx = elementCount - 1; innerIdx > outerIdx; innerIdx--) {
        const currentCardKey = getCardSortKey(bubbleSortedCards[innerIdx]);
        const previousCardKey = getCardSortKey(bubbleSortedCards[innerIdx - 1]);

        if (currentCardKey < previousCardKey) {
            const temporaryCard = bubbleSortedCards[innerIdx];
            bubbleSortedCards[innerIdx] = bubbleSortedCards[innerIdx - 1];
            bubbleSortedCards[innerIdx - 1] = temporaryCard;
        }
    }
}
console.log(bubbleSortedCards.join(' '));
console.log('Stable');

const selectionSortedCards = [...originalCards];

for (let outerIdx = 0; outerIdx < elementCount; outerIdx++) {
    let minKeyIndex = outerIdx;

    for (let innerIdx = outerIdx + 1; innerIdx < elementCount; innerIdx++) {
        const currentCardKey = getCardSortKey(selectionSortedCards[innerIdx]);
        const minCardKey = getCardSortKey(selectionSortedCards[minKeyIndex]);

        if (currentCardKey < minCardKey) {
            minKeyIndex = innerIdx;
        }
    }

    if (minKeyIndex !== outerIdx) {
        const temporaryCard = selectionSortedCards[outerIdx];
        selectionSortedCards[outerIdx] = selectionSortedCards[minKeyIndex];
        selectionSortedCards[minKeyIndex] = temporaryCard;
    }
}

console.log(selectionSortedCards.join(' '));

const areSortsIdentical = bubbleSortedCards.join(' ') === selectionSortedCards.join(' ');
console.log(areSortsIdentical ? 'Stable' : 'Not stable');
