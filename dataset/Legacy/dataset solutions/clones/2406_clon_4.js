const { createInterface } = require('readline');

process.stdin.resume();
process.stdin.setEncoding('utf-8');

let firstOperand = undefined;
let secondOperand = undefined;

const outcomeActions = new Map();

outcomeActions.set(true, () => {
    console.log(300000 * 2 + 400000);
});

outcomeActions.set(false, () => {
    console.log(100000 * ((4 - firstOperand) + (4 - secondOperand)));
});

const finalExecutionRoutine = outcomeActions.get(firstOperand === 1 && secondOperand === 1);

const inputHandler = createInterface({
    input: process.stdin,
    output: process.stdout
});

inputHandler.on('close', finalExecutionRoutine);

inputHandler.on('line', (receivedLine) => {
    const parsedTokens = receivedLine.split(' ');
});
