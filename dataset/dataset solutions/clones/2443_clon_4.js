"use strict";

const processingUnit = (incomingData) => {
    const extractPrimaryValue = (rawText) => {
        const cleanedText = rawText.trim();
        const textLines = cleanedText.split('\n');
        return Number(textLines[0]);
    };

    const applyTransformation = (numericOperand) => {
        return (numericOperand % 2 === 0)
            ? (numericOperand / 2 - 1)
            : ((numericOperand - 1) / 2);
    };

    const initialDigit = extractPrimaryValue(incomingData);
    const transformedOutcome = applyTransformation(initialDigit);

    return transformedOutcome;
};

const orchestrateProgram = () => {
    const ioHandler = require('node:fs');

    const rawContentBuffer = ioHandler.readFileSync('/dev/stdin', { encoding: 'utf8', flag: 'r' });

    const finalCalculation = processingUnit(rawContentBuffer);

    process.stdout.write(String(finalCalculation) + '\n');
};

orchestrateProgram();