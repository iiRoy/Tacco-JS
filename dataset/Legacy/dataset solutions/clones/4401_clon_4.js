'use strict';

function processInput(inputData) {
    const lines = inputData.split('\n');
    const barStrings = lines[1].split(' ');

    const barCounts = barStrings.reduce((accumulator, currentBarString) => {
        const barValue = parseInt(currentBarString, 10);
        if (!isNaN(barValue)) {
            accumulator[barValue] = (accumulator[barValue] || 0) + 1;
        }
        return accumulator;
    }, {});

    const uniqueBarLengths = Object.keys(barCounts)
                                   .map(Number)
                                   .sort((a, b) => b - a);

    const collectedRectangleSides = [];

    uniqueBarLengths.some(currentLength => {
        const lengthCount = barCounts[currentLength];

        if (lengthCount >= 4) {
            collectedRectangleSides.push(currentLength, currentLength);
        } else if (lengthCount >= 2) {
            collectedRectangleSides.push(currentLength);
        }
        
        return collectedRectangleSides.length >= 2;
    });

    if (collectedRectangleSides.length >= 2) {
        return collectedRectangleSides[0] * collectedRectangleSides[1];
    } else {
        return 0;
    }
}

function RectangleAreaCalculator(inputData) {
    const finalResult = processInput(inputData);
    console.log(finalResult);
}

RectangleAreaCalculator(require("fs").readFileSync("/dev/stdin", "utf8"));
