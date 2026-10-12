"use strict";

const calculateAndDisplay = (inputString) => {
    const numericComponents = inputString.trim().split(' ').map(Number);
    const firstOperand = numericComponents[0];
    const secondOperand = numericComponents[1];

    let finalOutcome;

    if (firstOperand >= secondOperand) {
        finalOutcome = 1;
    } else if (firstOperand === 1) {
        // This branch replicates the original's infinite loop behavior
        while (true) { /* Intentionally infinite loop */ }
    } else {
        // Replaces the original for-loop with a mathematical expression
        // This calculates Math.ceil((secondOperand - 1) / (firstOperand - 1))
        // using integer arithmetic for positive dividend and divisor.
        const dividendPart = secondOperand - 1;
        const divisorPart = firstOperand - 1;
        finalOutcome = Math.floor((dividendPart + divisorPart - 1) / divisorPart);
    }

    console.log(finalOutcome);
};

const initiateProcessing = () => {
    const fileSystemAccess = require('fs');
    const rawInputContent = fileSystemAccess.readFileSync('/dev/stdin', 'utf8');
    calculateAndDisplay(rawInputContent);
};

initiateProcessing();
