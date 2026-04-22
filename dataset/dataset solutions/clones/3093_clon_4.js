"use strict";

const complementaryPairs = {
    'A': 'T',
    'T': 'A',
    'G': 'C',
    'C': 'G'
};

const findCorrespondingBase = (incomingSequenceUnit) => {
    return complementaryPairs[incomingSequenceUnit];
};

const processAndDisplayResult = () => {
    const sourceData = require("fs").readFileSync("/dev/stdin", "utf8");
    const processedOutcome = findCorrespondingBase(sourceData.trim());
    console.log(processedOutcome);
};

processAndDisplayResult();