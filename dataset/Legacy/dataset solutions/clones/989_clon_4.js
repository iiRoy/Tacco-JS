const stdio = require('process');
let receivedText = '';

stdio.stdin.on('data', (portion) => {
    receivedText += portion;
});

stdio.stdin.on('end', () => {
    const numericParts = receivedText.trim().split(' ');
    const initialOperandA = Number(numericParts[0]);
    const initialOperandB = Number(numericParts[1]);

    if (initialOperandA === initialOperandB) {
        console.log(undefined);
        return;
    }

    let largerValue = (initialOperandA > initialOperandB) ? initialOperandA : initialOperandB;
    let smallerValue = (initialOperandA < initialOperandB) ? initialOperandA : initialOperandB;

    let preliminaryRemainder = largerValue % smallerValue;

    if (preliminaryRemainder === 0) {
        console.log(0);
        return;
    }

    let currentTestDivisor = preliminaryRemainder;
    let foundCommonDivisor = 1; 

    while (currentTestDivisor >= 1) {
        if (largerValue % currentTestDivisor === 0 && smallerValue % currentTestDivisor === 0) {
            foundCommonDivisor = currentTestDivisor;
            break;
        }
        currentTestDivisor--;
    }
    console.log(foundCommonDivisor);
});