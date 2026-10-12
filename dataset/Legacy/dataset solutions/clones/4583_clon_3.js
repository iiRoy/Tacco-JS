"use strict";

const parseInputHeader = (headerLine) => {
    const parts = headerLine.split(" ");
    const numEntries = parseInt(parts[0], 10);
    const targetValue = parseInt(parts[1], 10);
    return { numEntries, targetValue };
};

const parseDataPair = (pairString) => {
    const values = pairString.split(" ").map(s => parseInt(s, 10));
    return {
        firstVal: values[0],
        secondVal: values[1]
    };
};

const processDataAndFindTarget = (rawInputContent) => {
    const inputLines = rawInputContent.trim().split("\n");

    const { numEntries, targetValue } = parseInputHeader(inputLines[0]);

    const dataPairs = inputLines.slice(1, numEntries + 1).map(parseDataPair);

    let cumulativeRecords = [];
    let runningTotalSum = 0;

    for (let idx = 0; idx < numEntries; ++idx) {
        const currentPair = dataPairs[idx];
        runningTotalSum += currentPair.secondVal;
        
        const recordEntry = {
            num: currentPair.firstVal,
            amount: currentPair.secondVal,
            totalAmount: runningTotalSum
        };
        cumulativeRecords.push(recordEntry);
    }

    for (let idx = 0; idx < cumulativeRecords.length; ++idx) {
        const currentRecord = cumulativeRecords[idx];
        
        if (currentRecord.totalAmount >= targetValue) {
            console.log(JSON.stringify(currentRecord));
            
            let finalResultIdentifier;
            const sumBeforeCurrentAmount = currentRecord.totalAmount - currentRecord.amount;
            
            if (sumBeforeCurrentAmount < targetValue) {
                finalResultIdentifier = currentRecord.num;
            } else {
                // This path is only taken if idx > 0, as sumBeforeCurrentAmount would be 0 for idx=0,
                // and 0 < targetValue is typically true for positive targetValue.
                finalResultIdentifier = cumulativeRecords[idx - 1].num;
            }
            
            console.log(finalResultIdentifier);
            return; 
        }
    }
    
    console.log(JSON.stringify(cumulativeRecords));
};

processDataAndFindTarget(require('fs').readFileSync('/dev/stdin', 'utf8'));
