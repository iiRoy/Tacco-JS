const inputOutputUtil = require('fs');

const computationEngine = (rawLineData) => {
    let numericRecords = [];
    for (let i = 1; i < rawLineData.length; i++) {
        numericRecords.push(Number(rawLineData[i]));
    }

    if (numericRecords.length === 0) {
        console.log(0);
        return;
    }

    let highestValue = -Infinity;
    let currentRecordIndex = 0;
    while (currentRecordIndex < numericRecords.length) {
        if (numericRecords[currentRecordIndex] > highestValue) {
            highestValue = numericRecords[currentRecordIndex];
        }
        currentRecordIndex++;
    }

    let overallTotal = 0;
    let sumIndex = 0;
    do {
        overallTotal += numericRecords[sumIndex];
        sumIndex++;
    } while (sumIndex < numericRecords.length);

    console.log(overallTotal - (highestValue / 2));
};

computationEngine(inputOutputUtil.readFileSync('/dev/stdin', 'utf8').trim().split('\n'));