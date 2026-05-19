'use strict';

function processInputData(rawData) {
    const numericValues = rawData.split(/[\s\n]+/).filter(Boolean).map(Number);

    const [firstOperand, secondOperand, thirdOperand, fourthOperand] = numericValues;

    const leftAccumulator = firstOperand + secondOperand;
    const rightAccumulator = thirdOperand + fourthOperand;

    const netDifference = leftAccumulator - rightAccumulator;

    const outcomeMapping = {
        '1': 'Left',
        '-1': 'Right',
        '0': 'Balanced'
    };

    const finalOutput = outcomeMapping[Math.sign(netDifference)];

    console.log(finalOutput);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
