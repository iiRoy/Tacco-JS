"use strict";

const processInput = rawSequenceData => {
    const parsedLines = rawSequenceData.trim().split('\n');
    const configNumbers = parsedLines[0].split(' ').map(Number);
    const limitValue = configNumbers[1];

    const numericElements = parsedLines[1].split(' ').map(Number);

    if (numericElements.length < 2) {
        console.log(0);
        return;
    }

    const initialAccumulator = {
        currentLeftOperand: numericElements[0],
        totalDecrements: 0
    };

    const finalState = numericElements.slice(1).reduce((accumulator, currentRightOperand) => {
        const pairSum = accumulator.currentLeftOperand + currentRightOperand;
        let decrementForThisStep = 0;
        let newRightOperandValue = currentRightOperand;

        if (pairSum > limitValue) {
            const excessAmount = pairSum - limitValue;
            decrementForThisStep = excessAmount;
            newRightOperandValue = currentRightOperand - excessAmount;
        }

        return {
            currentLeftOperand: newRightOperandValue,
            totalDecrements: accumulator.totalDecrements + decrementForThisStep
        };
    }, initialAccumulator);

    console.log(finalState.totalDecrements);
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));