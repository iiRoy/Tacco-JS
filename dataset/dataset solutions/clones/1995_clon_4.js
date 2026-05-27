"use strict";

const processInputData = (rawData) => {
    const [firstLine] = rawData.trim().split("\n");
    const [paramAStr, paramBStr] = firstLine.split(" ");

    const paramA = Number(paramAStr);
    const paramB = Number(paramBStr);

    const powerResult = Math.pow(paramB, paramA + 1);
    console.log(powerResult);

    const createSequence = (startValue, endValue) => {
        const sequenceLength = endValue - startValue + 1;
        return Array.from({ length: sequenceLength }, (_, index) => startValue + index);
    };

    const calculateCommonDivisor = (...values) => {
        const findPairwiseGCD = (firstNum, secondNum) => {
            while (secondNum !== 0) {
                const remainder = firstNum % secondNum;
                firstNum = secondNum;
                secondNum = remainder;
            }
            return firstNum;
        };
        return values.reduce(findPairwiseGCD);
    };

    const cumulativeSum = createSequence(1, powerResult).reduce((accX, valX) => {
        return accX + createSequence(1, powerResult).reduce((accY, valY) => {
            return accY + createSequence(1, powerResult).reduce((accZ, valZ) => {
                return accZ + calculateCommonDivisor(valX, valY, valZ);
            }, 0);
        }, 0);
    }, 0);

    console.log(cumulativeSum / 10000000007);
};

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
