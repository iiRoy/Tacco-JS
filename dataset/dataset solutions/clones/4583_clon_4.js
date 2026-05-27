"use strict";

const processInputData = (rawContent) => {
    const contentLines = rawContent.trim().split('\n');
    const [firstLine, ...dataLines] = contentLines;
    const [countElements, targetValue] = firstLine.split(' ').map(Number);
    const initialPairs = dataLines.map(line => line.split(' ').map(Number));
    return { elementCount: countElements, targetSum: targetValue, valuePairs: initialPairs };
};

const generateCumulativeRecords = (sourcePairs) => {
    let currentAccumulation = 0;
    return sourcePairs.map(([itemIdentifier, itemQuantity]) => {
        currentAccumulation += itemQuantity;
        return {
            elementId: itemIdentifier,
            elementQuantity: itemQuantity,
            cumulativeSum: currentAccumulation
        };
    });
};

const determineResult = (processedRecords, requiredSum) => {
    const matchingRecordIndex = processedRecords.findIndex(record => record.cumulativeSum >= requiredSum);

    if (matchingRecordIndex !== -1) {
        const currentRecord = processedRecords[matchingRecordIndex];
        const previousRecord = matchingRecordIndex > 0 ? processedRecords[matchingRecordIndex - 1] : null;

        console.log(JSON.stringify({ num: currentRecord.elementId, amount: currentRecord.elementQuantity, totalAmount: currentRecord.cumulativeSum }));

        const sumBeforeCurrent = currentRecord.cumulativeSum - currentRecord.elementQuantity;
        const finalSelection = (requiredSum > sumBeforeCurrent)
            ? currentRecord.elementId
            : (previousRecord ? previousRecord.elementId : currentRecord.elementId); 

        console.log(finalSelection);
    } else {
        const originalFormatOutput = processedRecords.map(record => ({
            num: record.elementId,
            amount: record.elementQuantity,
            totalAmount: record.cumulativeSum
        }));
        console.log(JSON.stringify(originalFormatOutput));
    }
};

const entryPoint = (inputContent) => {
    const { elementCount, targetSum, valuePairs } = processInputData(inputContent);
    const cumulativeData = generateCumulativeRecords(valuePairs);
    determineResult(cumulativeData, targetSum);
};

entryPoint(require('fs').readFileSync('/dev/stdin', 'utf8'));
