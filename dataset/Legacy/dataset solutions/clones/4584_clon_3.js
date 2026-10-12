"use strict";

const parseItemDataLine = (lineContent) => {
    const parts = lineContent.split(" ");
    const itemValue = parseInt(parts[0], 10);
    const itemQuantity = parseInt(parts[1], 10);
    return { itemValue: itemValue, itemQuantity: itemQuantity };
};

const processInput = (rawInputString) => {
    const trimmedInput = rawInputString.trim();
    const inputLines = trimmedInput.split("\n");

    const firstLineParts = inputLines[0].split(" ");
    const countN = parseInt(firstLineParts[0], 10);
    const targetK = parseInt(firstLineParts[1], 10);

    const dataLines = inputLines.slice(1, countN + 1);

    const itemRecords = [];
    for (let recordIdx = 0; recordIdx < dataLines.length; recordIdx++) {
        const parsedRecord = parseItemDataLine(dataLines[recordIdx]);
        itemRecords.push(parsedRecord);
    }
    return { countN: countN, targetK: targetK, itemRecords: itemRecords };
};

const executeLogic = (processedData) => {
    const { targetK, itemRecords } = processedData;

    let currentSum = 0;
    let recordPointer = 0;

    while (currentSum < targetK) {
        const currentRecord = itemRecords[recordPointer];
        currentSum += currentRecord.itemQuantity;
        recordPointer++;
    }

    const finalRecord = itemRecords[recordPointer - 1];
    console.log(finalRecord.itemValue);
};

const main = (inputStr) => {
    const data = processInput(inputStr);
    executeLogic(data);
};

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
