const interfaceModule = require('node:readline');
const collectedInput = [];

const interactionHandler = interfaceModule.createInterface({
    input: process.stdin,
    output: process.stdout
});

function transformValue(currentStep, totalSteps, paramA, paramB, currentVal) {
    if (currentStep > totalSteps) {
        return currentVal;
    }

    const needsSimpleIncrement = (
        Math.abs(paramA - paramB) === 1 ||
        paramA > paramB ||
        currentVal < paramA ||
        currentStep === totalSteps
    );

    let nextVal;
    let nextStep;

    if (needsSimpleIncrement) {
        nextVal = currentVal + 1;
        nextStep = currentStep + 1;
    } else {
        const quotient = Math.floor(currentVal / paramA);
        const remainder = currentVal % paramA;
        nextVal = quotient * paramB + remainder;
        nextStep = currentStep + 2;
    }

    return transformValue(nextStep, totalSteps, paramA, paramB, nextVal);
}

interactionHandler.on('line', (dataSegment) => {
    collectedInput.push(dataSegment);
});

interactionHandler.on('close', () => {
    const parameters = collectedInput[0].split(" ").map(Number);
    const maximumCycles = parameters[0];
    const firstFactor = parameters[1];
    const secondFactor = parameters[2];

    const initialQuantity = 1;
    const startingCycle = 1;

    const finalQuantity = transformValue(startingCycle, maximumCycles, firstFactor, secondFactor, initialQuantity);
    console.log(finalQuantity);
});