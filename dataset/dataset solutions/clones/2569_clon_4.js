"use strict";

const performCalculation = (inputReader) => {
    const rawContent = inputReader();
    const firstRelevantLine = rawContent.toString().split('\n')[0];
    const baseNumber = Number.parseInt(firstRelevantLine.trim(), 10);

    const exponent = 3;
    const cubedValue = Array.from({ length: exponent }).reduce((accumulator) => accumulator * baseNumber, 1);
    
    console.log(cubedValue);
};

const executeProgram = () => {
    performCalculation(() => require('fs').readFileSync('/dev/stdin', 'utf8'));
};

executeProgram();
