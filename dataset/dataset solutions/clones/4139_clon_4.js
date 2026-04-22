"use strict";

const extractNumericPair = (sourceContent) => {
    const [firstNumber, secondNumber] = sourceContent.trim().split('\n')[0].split(' ').map(Number);
    return {
        firstNumber,
        secondNumber
    };
};

const determineSequenceCount = (numericPair) => {
    const {
        firstNumber: startingValue,
        secondNumber: ceilingValue
    } = numericPair;

    return (startingValue > ceilingValue)
        ? 1
        : Math.floor(Math.log2(ceilingValue / startingValue)) + 1;
};

const executeCalculation = () => {
    const rawInput = require('fs').readFileSync('/dev/stdin', 'utf8');
    const parsedValues = extractNumericPair(rawInput);
    const calculatedResult = determineSequenceCount(parsedValues);
    console.log(calculatedResult);
};

executeCalculation();