const fileSystem = require('fs');

const summationCounts = (() => {
    const maxDigitsAllowed = 4;
    const maxSingleDigitValue = 8;
    const maxPossibleTotal = maxDigitsAllowed * maxSingleDigitValue;

    const dynamicProgrammingTable = Array(maxDigitsAllowed + 1)
        .fill(null)
        .map(() => Array(maxPossibleTotal + 1).fill(0));

    dynamicProgrammingTable[0][0] = 1;

    for (let currentDigitQuantity = 1; currentDigitQuantity <= maxDigitsAllowed; currentDigitQuantity++) {
        for (let currentAccumulatedSum = 0; currentAccumulatedSum <= maxPossibleTotal; currentAccumulatedSum++) {
            for (let valueForCurrentDigit = 0; valueForCurrentDigit <= maxSingleDigitValue; valueForCurrentDigit++) {
                if (currentAccumulatedSum - valueForCurrentDigit >= 0) {
                    dynamicProgrammingTable[currentDigitQuantity][currentAccumulatedSum] +=
                        dynamicProgrammingTable[currentDigitQuantity - 1][currentAccumulatedSum - valueForCurrentDigit];
                }
            }
        }
    }
    return dynamicProgrammingTable[maxDigitsAllowed];
})();

const processIncomingData = (fullTextStream) => {
    const dataRecords = fullTextStream.split('\n').filter(entry => entry.trim() !== '');

    dataRecords.forEach(currentEntry => {
        const numericValue = Number(currentEntry);

        process.stdout.write(currentEntry + '\n');
        process.stdout.write(numericValue + '\n');

        const resultFromLookup = (numericValue >= 0 && numericValue < summationCounts.length)
                                  ? summationCounts[numericValue]
                                  : 0;

        process.stdout.write(resultFromLookup + '\n');
    });
};

fileSystem.readFile('/dev/stdin', 'utf8', (readError, fileContents) => {
    if (readError) {
        return;
    }
    processIncomingData(fileContents);
});