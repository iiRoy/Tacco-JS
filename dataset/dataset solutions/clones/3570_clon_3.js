'use strict';

const parseNumericValue = (str) => {
    return Number(str);
};

const calculateFlooredCube = (dividend, divisor) => {
    const floorResult = Math.floor(dividend / divisor);
    const cubedValue = Math.pow(floorResult, 3);
    return cubedValue;
};

function calculateCubesSum(rawInputString) {
    const trimmedInputContent = rawInputString.trim();
    const numericPartsArray = trimmedInputContent.split(' ');

    const firstNum = parseNumericValue(numericPartsArray[0]);
    const secondNum = parseNumericValue(numericPartsArray[1]);

    let finalSum = calculateFlooredCube(firstNum, secondNum);

    const isSecondNumEven = (secondNum % 2 === 0);

    if (isSecondNumEven) {
        const halfSecondNum = secondNum / 2;
        const additionalTermNumerator = firstNum + halfSecondNum;
        const additionalCubeTerm = calculateFlooredCube(additionalTermNumerator, secondNum);
        finalSum += additionalCubeTerm;
    }

    console.log(finalSum);
}

const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
calculateCubesSum(fileContent);
