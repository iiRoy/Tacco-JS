let rawData = require('fs').readFileSync('/dev/stdin', 'utf8').trim();
const dataRows = rawData.split('\n');

let currentRow;
while (currentRow = dataRows.shift()) {
    const numericParts = currentRow.split(' ');
    let totalCards = +numericParts[0];
    let numOperations = +numericParts[1];

    if (totalCards + numOperations === 0) {
        break;
    }

    let cardStack = [];
    for (let idx = totalCards; idx > 0; idx--) {
        cardStack.push(idx);
    }

    for (let idx = 0; idx < numOperations; idx++) {
        const opParams = dataRows.shift().split(' ').map(function(val){ return +val; });
        let startPos = opParams[0];
        let countCards = opParams[1];

        const extractedCards = cardStack.splice(startPos - 1, countCards);
        for (let k = 0; k < countCards; k++) {
            cardStack.unshift(extractedCards.pop());
        }
    }
    console.log(cardStack[0]);
}
