'use strict';

const SEP_CHAR = " ";
const IDX_A = 0;
const IDX_B = 1;
const IDX_C = 2;
const IDX_K = 3;
const REQUIRED_ELEMENT_COUNT = 4;

// Helper function to parse an integer from a specific index of an array
const retrieveAndParseInt = (sourceArray, targetIndex) => {
    return parseInt(sourceArray[targetIndex]);
};

const computeResult = rawData => {
    const inputSegments = rawData.split(SEP_CHAR);

    const valueA = retrieveAndParseInt(inputSegments, IDX_A);
    const valueB = retrieveAndParseInt(inputSegments, IDX_B);
    const valueC = retrieveAndParseInt(inputSegments, IDX_C);
    const factorK = retrieveAndParseInt(inputSegments, IDX_K);

    // Intermediate calculation step
    const calculatedDifference = valueA - valueB;

    let finalCalculatedValue;
    // Structural change: replaced ternary with if-else block
    if (factorK % 2 === 0) {
        finalCalculatedValue = calculatedDifference;
    } else {
        finalCalculatedValue = -calculatedDifference;
    }

    console.log(finalCalculatedValue);
};

computeResult(require("fs").readFileSync("/dev/stdin", "utf8"));
