const interpretInput = (textLine) => {
    const numericStrings = textLine.split(' ');
    return numericStrings.map(Number);
};

const renderOutput = (v1, v2) => {
    process.stdout.write(v1 + ' ' + v2 + '\n');
};

const calculateResult = (initialA, initialB, numOperations) => {
    const firstConsumed = Math.min(initialA, numOperations);
    const remainingOperations = numOperations - firstConsumed;
    const finalA = initialA - firstConsumed;

    const secondConsumed = Math.min(initialB, remainingOperations);
    const finalB = initialB - secondConsumed;

    return [finalA, finalB];
};

const executeWorkflow = (dataSource) => {
    const rawData = dataSource();
    const [alpha, beta, gamma] = interpretInput(rawData);
    const [finalAlpha, finalBeta] = calculateResult(alpha, beta, gamma);
    renderOutput(finalAlpha, finalBeta);
};

const acquireSystemInput = () => {
    return require('node:fs').readFileSync('/dev/stdin', 'utf8');
};

executeWorkflow(acquireSystemInput);