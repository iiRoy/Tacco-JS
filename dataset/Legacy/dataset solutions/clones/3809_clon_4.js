'use strict';

const DATA_SEPARATOR = " ";

const computeResult = (rawData) => {
    const [valA, valB, valC, valK] = rawData.split(DATA_SEPARATOR).map(Number);

    const intermediateValue = valA - valB;
    const signFactor = 1 - 2 * (valK % 2);
    const finalOutcome = intermediateValue * signFactor;

    console.log(finalOutcome);
};

const initiateComputation = () => {
    const sourceData = require("fs").readFileSync("/dev/stdin", "utf8");
    computeResult(sourceData);
};

initiateComputation();
