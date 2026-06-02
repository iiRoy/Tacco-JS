function getInputData() {
    const inputFilePath = "/dev/stdin";
    const rawInputString = require("fs").readFileSync(inputFilePath, "utf8");
    return rawInputString.split(/\n\r?/);
}

function createNumberSequence(startVal, endVal) {
    const sequenceValues = [];
    const loopLimit = endVal;
    for (let currentNum = startVal; currentNum <= loopLimit; currentNum++) {
        sequenceValues.push(currentNum);
    }
    return sequenceValues;
}

const MIN_CARD_VALUE = 1;
const MAX_CARD_VALUE = 13;
const ALL_SUIT_IDENTIFIERS = ['S', 'H', 'C', 'D'];

const cardCollection = ALL_SUIT_IDENTIFIERS.reduce((accumulator, suitChar) => {
    accumulator[suitChar] = createNumberSequence(MIN_CARD_VALUE, MAX_CARD_VALUE);
    return accumulator;
}, {});

const allInputLines = getInputData();
const relevantInputLines = allInputLines.slice(1);

relevantInputLines.forEach(function(currentLine) {
    if (!currentLine.trim()) {
        return;
    }

    const parsedLineData = currentLine.split(' ');
    const currentSuitIdentifier = parsedLineData[0];
    const currentCardNumber = +parsedLineData[1];

    const targetSuitArray = cardCollection[currentSuitIdentifier];

    const cardIndexToRemove = targetSuitArray.indexOf(currentCardNumber);
    if (cardIndexToRemove !== -1) {
        targetSuitArray.splice(cardIndexToRemove, 1);
    }
});

Object.keys(cardCollection).forEach(function(suitIdentifierKey) {
    // console.log(cardCollection[suitIdentifierKey].map(function(cardValue) {
    //     return suitIdentifierKey + ' ' + cardValue;
    // }).join("\n"));
});
