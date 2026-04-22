'use strict';

const performCalculation = (inputBuffer) => {
    const lineOfNumbers = inputBuffer.substring(0, inputBuffer.indexOf('\n'));

    const firstDelimiterPos = lineOfNumbers.indexOf(' ');
    const secondDelimiterPos = lineOfNumbers.indexOf(' ', firstDelimiterPos + 1);

    const secondNumString = lineOfNumbers.substring(firstDelimiterPos + 1, secondDelimiterPos);
    const thirdNumString = lineOfNumbers.substring(secondDelimiterPos + 1);

    const valueOne = parseInt(secondNumString, 10);
    const valueTwo = parseInt(thirdNumString, 10);

    const parityOne = valueOne & 1;
    const parityTwo = valueTwo & 1;

    const parityXOR = parityOne ^ parityTwo;

    const decisionTable = ['Alice', 'Borys'];

    console.log(decisionTable[parityXOR]);
};

performCalculation(require("fs").readFileSync("/dev/stdin", "utf8"));