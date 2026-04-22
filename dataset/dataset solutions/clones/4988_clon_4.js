'use strict';

const processInput = (rawDataContent) => {
    const numericComponents = rawDataContent
        .trim()
        .split(/\s+/)
        .map(Number);

    const [componentA, componentB, componentC] = numericComponents;

    if (!((componentA & 1) && (componentB & 1) && (componentC & 1))) {
        console.log(0);
        return;
    }

    const sortedComponents = [componentA, componentB, componentC].sort((valX, valY) => valX - valY);

    const smallestValue = sortedComponents[0];
    const centralValue = sortedComponents[1];
    const greatestValue = sortedComponents[2];

    let computedResult;

    if (smallestValue === greatestValue) {
        computedResult = greatestValue * greatestValue;
    } else if (centralValue === greatestValue) {
        computedResult = smallestValue * greatestValue;
    } else {
        computedResult = smallestValue * centralValue;
    }

    console.log(computedResult);
};

const sourceData = require('node:fs').readFileSync(0, 'utf8');
processInput(sourceData);