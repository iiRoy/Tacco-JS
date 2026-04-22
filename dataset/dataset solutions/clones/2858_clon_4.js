"use strict";

const computeFinalDifference = (sourceText) => {
    const extractionPattern = /^(\d+)\n([\d ]+)$/m;
    const contentMatch = sourceText.trim().match(extractionPattern);

    if (!contentMatch || contentMatch.length < 3) {
        throw new Error("Input data format is incorrect.");
    }

    const valueCollection = contentMatch[2].split(' ').map(Number);

    const totalAggregate = valueCollection.reduce((currentTotal, itemValue) => currentTotal + itemValue, 0);
    const thresholdPoint = totalAggregate / 2;

    const processingOutcome = valueCollection.reduce((partitionContainer, currentItem) => {
        if (partitionContainer.primarySum < thresholdPoint) {
            partitionContainer.primarySum += currentItem;
        } else if (partitionContainer.primarySum > thresholdPoint) {
            partitionContainer.secondarySum += currentItem;
        }
        return partitionContainer;
    }, { primarySum: 0, secondarySum: 0 });

    return processingOutcome.primarySum - processingOutcome.secondarySum;
};

const systemFileModule = require('fs');
const acquiredData = systemFileModule.readFileSync('/dev/stdin','utf8');
console.log(computeFinalDifference(acquiredData));