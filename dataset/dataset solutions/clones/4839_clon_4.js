const inputProcessor = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

const collectedInputLines = [];

inputProcessor.on('line', (currentInputLine) => {
    collectedInputLines.push(currentInputLine);
});

inputProcessor.on('close', () => {
    const [operandA, operandB, divisorC] = collectedInputLines[0].split(' ').map(Number);

    const adjustedOperandA = operandA - (operandA % divisorC === 0 ? divisorC : 0);
    const finalOutcome = (operandB - adjustedOperandA) / divisorC;

    console.log(finalOutcome);
});
