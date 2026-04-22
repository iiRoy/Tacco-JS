const inputProcessor = require('readline');
const collectedData = [];

const inputInterface = inputProcessor.createInterface({
    input: process.stdin,
    output: process.stdout
});

inputInterface.on('line', (contentSegment) => {
    collectedData.push(contentSegment);
    if (collectedData.length === 4) {
        inputInterface.close();
    }
});

const determineMinimum = (valueA, valueB) => {
    return valueA < valueB ? valueA : valueB;
};

inputInterface.on('close', () => {
    const convertedNumbers = collectedData.map(strValue => parseFloat(strValue));

    const firstGroupMinimum = determineMinimum(convertedNumbers[0], convertedNumbers[1]);
    const secondGroupMinimum = determineMinimum(convertedNumbers[2], convertedNumbers[3]);

    const combinedOutcome = firstGroupMinimum + secondGroupMinimum;

    process.stdout.write(String(combinedOutcome) + '\n');
});