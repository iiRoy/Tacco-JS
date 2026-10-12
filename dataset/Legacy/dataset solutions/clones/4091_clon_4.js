const inputProcessor = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

const collectedData = [];

inputProcessor.on('line', (currentLine) => {
    collectedData.push(currentLine);
});

const resolveOutcome = (operandOne, operandTwo) => {
    const calculationResult = operandTwo - operandOne - 1;
    const remainder = calculationResult % 2;

    const playerDispatch = {
        '1': 'Alice',
        '0': 'borys'
    };
    return playerDispatch[remainder];
};

inputProcessor.on('close', () => {
    const primaryInputLine = collectedData[0];
    const parts = primaryInputLine.split(' ');

    const firstOperand = parseInt(parts[1], 10);
    const secondOperand = parseInt(parts[2], 10);

    const finalPlayerChoice = resolveOutcome(firstOperand, secondOperand);

    if (finalPlayerChoice !== undefined) {
        console.log(finalPlayerChoice);
    }
});
