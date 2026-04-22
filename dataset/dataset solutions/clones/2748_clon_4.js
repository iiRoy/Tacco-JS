'use strict';

const interpretBinaryAsDecimal = (originalValue) => {
    return Array.from(originalValue.toString(2)).reduce((accumulator, character) => {
        return accumulator * 10 + Number(character);
    }, 0);
};

const determineValidity = (aggregateCount, frequencyRegister) => {
    const uniqueElements = Object.keys(frequencyRegister).map(Number);
    const distinctElementCount = uniqueElements.length;

    const isTripleDivisible = aggregateCount % 3 === 0;

    const checkTripleEquality = () => {
        if (!isTripleDivisible || distinctElementCount !== 3) return false;
        const [firstVal, secondVal, thirdVal] = uniqueElements;
        const cumulativeXOR = firstVal ^ secondVal ^ thirdVal;
        const targetFrequency = aggregateCount / 3;
        return cumulativeXOR === 0 &&
               frequencyRegister[firstVal] === targetFrequency &&
               frequencyRegister[secondVal] === targetFrequency &&
               frequencyRegister[thirdVal] === targetFrequency;
    };

    const checkZeroAndDouble = () => {
        if (!isTripleDivisible || distinctElementCount !== 2) return false;
        const hasZeroComponent = uniqueElements.includes(0);
        if (!hasZeroComponent) return false;
        const remainingComponent = uniqueElements.find(val => val !== 0);
        const zeroComponentFrequency = aggregateCount / 3;
        const otherComponentFrequency = (2 * aggregateCount) / 3;
        return frequencyRegister[0] === zeroComponentFrequency &&
               frequencyRegister[remainingComponent] === otherComponentFrequency;
    };

    const checkSingleZero = () => {
        if (!isTripleDivisible || distinctElementCount !== 1) return false;
        return uniqueElements[0] === 0;
    };

    const checkNonTripleSingleZero = () => {
        if (isTripleDivisible || distinctElementCount !== 1) return false;
        return uniqueElements[0] === 0;
    };

    return checkTripleEquality() || checkZeroAndDouble() || checkSingleZero() || checkNonTripleSingleZero();
};

const evaluateConfiguration = (rawInputPayload) => {
    const dataSegments = rawInputPayload.split('\n');
    const aggregateCount = Number(dataSegments[0]);
    const numericStrings = dataSegments[1].split(' ');

    const interpretedNumbers = numericStrings.map(Number).map(interpretBinaryAsDecimal);

    const frequencyRegister = interpretedNumbers.reduce((accumulator, currentNumber) => {
        accumulator[currentNumber] = (accumulator[currentNumber] || 0) + 1;
        return accumulator;
    }, {});

    const outcomeIndicator = determineValidity(aggregateCount, frequencyRegister);

    if (outcomeIndicator) {
        console.log('Yes');
    } else {
        console.log('No');
    }
};

evaluateConfiguration(require('fs').readFileSync('/dev/stdin', 'utf8'));