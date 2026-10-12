const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8').trim();
const inputSegments = rawInputData.split('\n');

let currentSegment;
while ((currentSegment = inputSegments.shift()) !== undefined) {
    const numericParts = currentSegment.split(' ').map(Number);
    const initialCount = numericParts[0];
    const operationCount = numericParts[1];

    if (initialCount + operationCount === 0) break;

    let cardStack = Array.from({ length: initialCount }, (_, index) => initialCount - index);

    for (let operationIndex = 0; operationIndex < operationCount; operationIndex++) {
        const operationParameters = inputSegments.shift().split(' ').map(Number);
        const startPosition = operationParameters[0];
        const numberOfCards = operationParameters[1];

        const cardsToRelocate = cardStack.slice(startPosition - 1, startPosition - 1 + numberOfCards);
        const precedingCards = cardStack.slice(0, startPosition - 1);
        const succeedingCards = cardStack.slice(startPosition - 1 + numberOfCards);

        cardStack = cardsToRelocate.concat(precedingCards, succeedingCards);
    }
    console.log(cardStack[0]);
}
