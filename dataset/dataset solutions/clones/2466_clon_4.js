const systemInputFlow = process.stdin;
const systemOutputFlow = process.stdout;

let collectedDataBuffer = '';

const computeOutcome = (operandPair) => {
    const firstOperand = operandPair[0];
    const secondOperand = operandPair[1];

    const exceedsThreshold = [firstOperand, secondOperand].some(val => val > 9);
    
    return exceedsThreshold ? -1 : firstOperand * secondOperand;
};

systemInputFlow.setEncoding('utf8');

systemInputFlow.addListener('data', (portion) => {
    collectedDataBuffer += portion;
});

systemInputFlow.addListener('end', () => {
    const receivedTextLine = collectedDataBuffer.trim();
    
    const numericStrings = receivedTextLine.match(/\d+/g);
    
    const parsedOperands = [];
    for (let idx = 0; idx < 2; idx++) {
        if (numericStrings && numericStrings[idx] !== undefined) {
            parsedOperands.push(Number(numericStrings[idx]));
        } else {
            parsedOperands.push(NaN);
        }
    }
    
    const finalResult = computeOutcome(parsedOperands);
    
    systemOutputFlow.write(String(finalResult) + '\n');
    
    process.exit(0);
});

systemInputFlow.addListener('error', (err) => {
    systemOutputFlow.write(`Input stream failure: ${err.message}\n`);
    process.exit(1);
});