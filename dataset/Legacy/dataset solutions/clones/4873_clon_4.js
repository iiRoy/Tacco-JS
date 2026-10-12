'use strict';

const processInputData = (rawText) => {
    const allLines = rawText.trim().split('\n');

    const [initialWidth, initialHeight, operationCount] = allLines[0].split(' ').map(Number);

    const operationRecords = allLines.slice(1).map(lineContent => {
        const numericParts = lineContent.split(' ').map(Number);
        return { xCoordinate: numericParts[0], yCoordinate: numericParts[1], operationKind: numericParts[2] };
    });

    return { initialWidth, initialHeight, operationCount, operationRecords };
};

const computeFinalArea = (parsedInput) => {
    let currentMinimumX = 0;
    let currentMaximumX = parsedInput.initialWidth;
    let currentMinimumY = 0;
    let currentMaximumY = parsedInput.initialHeight;

    parsedInput.operationRecords.forEach(record => {
        const { xCoordinate: opX, yCoordinate: opY, operationKind: opType } = record;

        if (opType === 1) {
            currentMinimumX = Math.max(currentMinimumX, opX);
        } else if (opType === 2) {
            currentMaximumX = Math.min(currentMaximumX, opX);
        } else if (opType === 3) {
            currentMinimumY = Math.max(currentMinimumY, opY);
        } else if (opType === 4) {
            currentMaximumY = Math.min(currentMaximumY, opY);
        }
    });

    const resultingWidth = currentMaximumX - currentMinimumX;
    const resultingHeight = currentMaximumY - currentMinimumY;

    const calculatedArea = (resultingWidth > 0 && resultingHeight > 0) ? (resultingWidth * resultingHeight) : 0;

    console.log(calculatedArea);
};

const applicationEntry = (sourceInput) => {
    const processedData = processInputData(sourceInput);
    computeFinalArea(processedData);
};

applicationEntry(require('fs').readFileSync('/dev/stdin', 'utf8'));
