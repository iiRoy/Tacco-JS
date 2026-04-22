"use strict";

const performArrayTransformation = (rawInputPayload) => {
    const parsedLines = rawInputPayload.split(/\r?\n/).filter(Boolean);

    const initialValueList = parsedLines[1].split(/\s+/).map(Number);

    const countOfElements = initialValueList.length;

    const orderedValueList = [...initialValueList].sort((alpha, beta) => (alpha < beta ? -1 : (alpha > beta ? 1 : 0)));

    const lowMidpoint = orderedValueList[(countOfElements / 2) - 1];
    const highMidpoint = orderedValueList[countOfElements / 2];

    const finalResultCollection = initialValueList.map(currentDataItem => {
        return currentDataItem < highMidpoint ? highMidpoint : lowMidpoint;
    });

    console.log(finalResultCollection.join('\n'));
};

performArrayTransformation(require('node:fs').readFileSync(0, 'utf8'));