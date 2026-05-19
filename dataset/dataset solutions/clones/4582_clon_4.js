"use strict";

const processInput = (rawInput) => {
    const inputLines = rawInput.trim().split("\n");

    const [entryCountStr, thresholdValueStr] = inputLines[0].split(" ");
    const entryCount = Number(entryCountStr);
    const thresholdValue = Number(thresholdValueStr);

    const initialPairs = inputLines.slice(1, entryCount + 1).map(lineContent =>
        lineContent.split(" ").map(Number)
    );

    let currentCumulativeSum = 0;
    let previousQuantity = 0;

    const cumulativeRecords = initialPairs.map((pairEntry, recordIndex) => {
        const [identifierValue, quantityValue] = pairEntry;
        let recordCumulativeQuantity;

        if (recordIndex === 0) {
            recordCumulativeQuantity = quantityValue;
            currentCumulativeSum = quantityValue;
        } else {
            currentCumulativeSum += previousQuantity;
            recordCumulativeQuantity = currentCumulativeSum;
        }

        previousQuantity = quantityValue;

        return {
            identifier: identifierValue,
            quantity: quantityValue,
            cumulativeQuantity: recordCumulativeQuantity
        };
    });

    const matchingRecordIndex = cumulativeRecords.findIndex(
        (recordItem) => recordItem.cumulativeQuantity >= thresholdValue
    );

    if (matchingRecordIndex !== -1) {
        const matchedRecord = cumulativeRecords[matchingRecordIndex];
        const priorRecord = cumulativeRecords[matchingRecordIndex - 1];

        const finalIdentifier =
            (matchedRecord.cumulativeQuantity - matchedRecord.quantity < thresholdValue)
                ? matchedRecord.identifier
                : priorRecord.identifier;

        console.log(finalIdentifier);
    } else {
        console.log(JSON.stringify(cumulativeRecords));
    }
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
