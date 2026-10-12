'use strict';

function ProcessInput(rawData) {
    const inputLines = rawData.split("\n");

    const count = parseInt(inputLines[0], 10);

    const parseStringArrayToNumbers = (strArray) => strArray.map(str => parseInt(str, 10));

    const dataArray = parseStringArrayToNumbers(inputLines[1].split(' '));

    const calculateGCD = (valA, valB) => {
        while (valB) {
            const tempVal = valB;
            valB = valA % valB;
            valA = tempVal;
        }
        return valA;
    };

    let greatestCommonDivisor = 1;

    const findArrayGCDExcludingIndex = (sourceArray, excludedIndex, currentOverallMax) => {
        const subsetNumbers = sourceArray.filter((_, idx) => idx !== excludedIndex);

        if (subsetNumbers.length === 0) {
            return undefined;
        }

        let currentSubsetGCD = subsetNumbers[0];

        for (let k = 1; k < subsetNumbers.length; k++) {
            currentSubsetGCD = calculateGCD(currentSubsetGCD, subsetNumbers[k]);
            if (currentSubsetGCD <= currentOverallMax) {
                return currentSubsetGCD;
            }
        }
        return currentSubsetGCD;
    };

    for (let outerIndex = 0; outerIndex < count; outerIndex++) {
        const currentGCDForExclusion = findArrayGCDExcludingIndex(dataArray, outerIndex, greatestCommonDivisor);

        if (currentGCDForExclusion === undefined) {
            greatestCommonDivisor = NaN;
            break;
        }

        greatestCommonDivisor = Math.max(greatestCommonDivisor, currentGCDForExclusion);
    }

    console.log(greatestCommonDivisor);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
