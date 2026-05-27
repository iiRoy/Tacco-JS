const operationRegistry = new Map();

operationRegistry.set('+', (firstVal, secondVal) => firstVal + secondVal);
operationRegistry.set('-', (firstVal, secondVal) => firstVal - secondVal);
operationRegistry.set('/', (firstVal, secondVal) => Math.floor(firstVal / secondVal));
operationRegistry.set('*', (firstVal, secondVal) => firstVal * secondVal);

const inputProcessor = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

inputProcessor.on('line', (currentLineContent) => {
    const normalizedContent = currentLineContent.trim();

    if (normalizedContent === '0 ? 0') {
        inputProcessor.close();
        return;
    }

    const contentSegments = normalizedContent.split(/\s+/);

    if (contentSegments.length !== 3) {
        return;
    }

    const valA = Number(contentSegments[0]);
    const valB = Number(contentSegments[1]);
    const operatorKey = contentSegments[2];

    if (isNaN(valA) || isNaN(valB)) {
        return;
    }

    const operationFunction = operationRegistry.get(operatorKey);

    if (operationFunction) {
        const computedResult = operationFunction(valA, valB);
        console.log(computedResult);
    }
});
