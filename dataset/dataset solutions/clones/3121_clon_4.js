const receivedData = [];

const streamUtility = require('readline');
const inputController = streamUtility.createInterface({
    input: process.stdin,
    output: process.stdout,
});

inputController.on('line', (dataSegment) => {
    receivedData.push(dataSegment);
});

inputController.on('close', () => {
    const lengthIndicator = Number(receivedData[0]);
    const inputString = receivedData[1];

    const frequencyMap = new Map();
    for (const individualChar of inputString) {
        frequencyMap.set(individualChar, (frequencyMap.get(individualChar) || 0) + 1);
    }

    const aggregateResult = Array.from(frequencyMap.values()).reduce((accumulator, countValue) => {
        return accumulator * (countValue + 1);
    }, 1);

    process.stdout.write((aggregateResult - 1).toString() + '\n');
});