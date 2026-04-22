"use strict";

const analyzeSequenceData = (rawInputContent) => {
    if (typeof rawInputContent !== 'string' || rawInputContent.trim() === '') {
        console.error("Input content is invalid or empty.");
        return;
    }

    const cleanedLines = rawInputContent.trim().split("\n");

    const paramLineParts = cleanedLines[0].split(" ");
    const totalCount = Number(paramLineParts[0]);
    const windowLength = Number(paramLineParts[1]);

    if (isNaN(totalCount) || isNaN(windowLength) || totalCount < 1 || windowLength < 1 || windowLength > totalCount) {
        console.error("Invalid N or K values provided.");
        return;
    }

    const numberSeries = cleanedLines[1].split(" ").map(Number);

    if (numberSeries.length !== totalCount) {
        console.error("Number series length does not match N.");
        return;
    }

    const computeSubarrayProduct = (arr, startIdx, endIdx) => {
        let currentWindowProduct = 1;
        for (let j = startIdx; j < endIdx; j++) {
            currentWindowProduct *= arr[j];
        }
        return currentWindowProduct;
    };

    const productCollection = [];

    let currentWindowValue = computeSubarrayProduct(numberSeries, 0, windowLength);
    productCollection.push(currentWindowValue);

    for (let currentElementIndex = windowLength; currentElementIndex < totalCount; currentElementIndex++) {
        const departingElement = numberSeries[currentElementIndex - windowLength];
        const incomingElement = numberSeries[currentElementIndex];

        if (departingElement === 0) {
            currentWindowValue = computeSubarrayProduct(numberSeries, currentElementIndex - windowLength + 1, currentElementIndex + 1);
        } else {
            currentWindowValue = (currentWindowValue / departingElement) * incomingElement;
        }
        productCollection.push(currentWindowValue);
    }

    const outcomeMessages = [];
    const sequenceCount = productCollection.length;

    let compareIndex = 1;
    while (compareIndex < sequenceCount) {
        const previousProduct = productCollection[compareIndex - 1];
        const currentProduct = productCollection[compareIndex];

        const result = (currentProduct > previousProduct) ? "Yes" : "No";
        outcomeMessages.push(result);
        compareIndex++;
    }

    console.log(outcomeMessages.join("\n"));
};

analyzeSequenceData(require('fs').readFileSync('/dev/stdin', 'utf8'));