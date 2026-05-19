"use strict";

const processInputAndCompute = (rawInputData) => {
    const lineSegments = rawInputData.match(/[^\n]+/g).map(s => s.trim());

    const firstLineTokens = lineSegments[0].match(/(\d+)\s+(\d+)/);
    const firstNumericValue = Number(firstLineTokens[1]);
    const secondNumericValue = Number(firstLineTokens[2]);

    const numericSequence = Array.from(lineSegments[1].split(" "), Number);

    const performCalculation = (operandA, operandB) => {
        const minuendA = operandA - 1;
        const minuendB = operandB - 2;
        const sumOfMinuends = minuendA + minuendB;
        const subtrahend = operandB - 1;

        return sumOfMinuends / subtrahend;
    };

    const finalResult = performCalculation(firstNumericValue, secondNumericValue);

    console.log(finalResult);
};

processInputAndCompute(require('fs').readFileSync('/dev/stdin', 'utf8'));
