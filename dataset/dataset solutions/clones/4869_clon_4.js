'use strict';

const processInput = (rawContent) => {
    const contentLines = rawContent.trim().split("\n");
    const firstDataLine = contentLines[0].split(' ');

    const numericalComponents = [];
    for (const stringComponent of firstDataLine) {
        numericalComponents.push(parseInt(stringComponent, 10));
    }

    const firstElement = numericalComponents[0];
    const secondElement = numericalComponents[1];
    const thirdElement = numericalComponents[2];

    const minimumValue = Math.min(firstElement, secondElement, thirdElement);
    const maximumValue = Math.max(firstElement, secondElement, thirdElement);
    const medianValue = firstElement + secondElement + thirdElement - minimumValue - maximumValue;

    const orderedCollection = [minimumValue, medianValue, maximumValue];

    console.log(orderedCollection);

    const comparisonResult = (maximumValue === minimumValue + medianValue) ? 'Yes' : 'No';
    console.log(comparisonResult);
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
