'use strict';

const processSequence = (dataStream) => {
    const sourceChars = dataStream.split('');
    const quantity = Number.parseInt(sourceChars[0], 10);
    const actionElements = sourceChars.slice(2, 2 + quantity);

    const resultingState = actionElements.reduce((accumulator, instruction) => {
        const change = (instruction === 'I') ? 1 : -1;
        const newBalance = accumulator.currentBalance + change;
        const newPeak = Math.max(accumulator.peakBalance, newBalance);
        return { currentBalance: newBalance, peakBalance: newPeak };
    }, { currentBalance: 0, peakBalance: 0 });

    console.log(resultingState.peakBalance);
};

processSequence(require("node:fs").readFileSync("/dev/stdin", "utf8"));