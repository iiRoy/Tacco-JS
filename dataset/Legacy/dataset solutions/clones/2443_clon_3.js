"use strict";

const parseInputLines = (rawContent) => {
    const processedContent = String(rawContent).trim();
    return processedContent.split("\n");
};

const performCalculation = (inputNum) => {
    const divisionResult = inputNum / 2;
    const ceilingValue = Math.ceil(divisionResult);
    return ceilingValue - 1;
};

const processData = (rawInputContent) => {
    const inputLines = parseInputLines(rawInputContent);

    const firstLineValue = inputLines[0];
    const parsedNumber = parseInt(firstLineValue);

    const finalOutput = performCalculation(parsedNumber);

    console.log(finalOutput);
};

processData(require('fs').readFileSync('/dev/stdin', 'utf8'));
