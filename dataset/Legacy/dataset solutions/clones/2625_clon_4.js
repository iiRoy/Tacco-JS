"use strict";

(() => {
    const inputPayload = require('fs').readFileSync('/dev/stdin', 'utf8');

    const contentPattern = /(?<numericPart>\d+)\n(?<stringPart>.*)/;
    const extractedParts = inputPayload.trim().match(contentPattern);

    const thresholdValue = parseInt(extractedParts.groups.numericPart, 10);
    const textContent = extractedParts.groups.stringPart;

    const outcomeSelector = {
        true: textContent,
        false: "red"
    };

    console.log(outcomeSelector[thresholdValue >= 3200]);
})();
