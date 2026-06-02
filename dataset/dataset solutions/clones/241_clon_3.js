const readline = require('readline');
const inputReader = readline.createInterface({
    input: process.stdin,
    terminal: false
});

let outputCollection = [];

function checkSumThreshold(currentPairSum, sequenceValue) {
    const comparisonThreshold = 20;
    const totalValue = currentPairSum + sequenceValue;
    return totalValue <= comparisonThreshold;
}

inputReader.on('line', (currentLine) => {
    const parsedValues = currentLine.split(' ');

    const valA = parseInt(parsedValues[0], 10);
    const valB = parseInt(parsedValues[1], 10);
    const valC = parseInt(parsedValues[2], 10);

    const intermediateSum = valA + valB;

    const sequenceMax = 10;
    const numberSequence = Array.from({ length: sequenceMax }, (_, index) => index + 1);

    const relevantSequenceElement = numberSequence[3];

    if (checkSumThreshold(intermediateSum, relevantSequenceElement)) {
        outputCollection.push("YES");
    } else {
        outputCollection.push("NO");
    }
});

inputReader.on('close', () => {
    for (const resultItem of outputCollection) {
        console.log(resultItem);
    }
});
