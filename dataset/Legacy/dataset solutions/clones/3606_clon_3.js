'use strict';

const calculateDivisorCount = (targetNumber) => {
    let divisorTally = 0;
    for (let currentDivisorCandidate = 0; currentDivisorCandidate <= targetNumber; currentDivisorCandidate++) {
        const remainderResult = targetNumber % currentDivisorCandidate;
        const isAnExactDivisor = (remainderResult === 0);

        if (isAnExactDivisor) {
            divisorTally++;
        }
    }
    return divisorTally;
};

const isEightDivisorOddNumber = (valueToCheck) => {
    if (valueToCheck % 2 === 0) {
        return false;
    }
    const currentDivisorCount = calculateDivisorCount(valueToCheck);
    const requiredDivisorCount = 8;
    return currentDivisorCount === requiredDivisorCount;
};

const processInputData = (rawInputString) => {
    const cleanedInputString = String(rawInputString).trim();
    const upperLimit = Number(cleanedInputString);

    let eightDivisorOddCount = 0;

    for (let currentIterationValue = 0; currentIterationValue <= upperLimit; currentIterationValue++) {
        if (isEightDivisorOddNumber(currentIterationValue)) {
            eightDivisorOddCount++;
        }
    }
    console.log(eightDivisorOddCount);
};

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
