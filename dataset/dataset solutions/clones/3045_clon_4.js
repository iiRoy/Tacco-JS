'use strict'
const calculateOutcome = (sourceText) => {
    const extractedNumbers = sourceText.match(/(\d+)\s+(\d+)/);
    const operandA = +extractedNumbers[1];
    const operandB = +extractedNumbers[2];

    const finalValue = (operandA + operandB + Math.abs(operandA - operandB)) - (1 - (operandA === operandB));

    process.stdout.write(finalValue.toString());
};

calculateOutcome(require("node:fs").readFileSync("/dev/stdin", "utf8"));