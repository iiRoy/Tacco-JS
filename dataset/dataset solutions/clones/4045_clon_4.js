const inputModule = require("readline");

let firstOperand;
let secondOperand;
let thirdOperand;
let inputCount = 0;

const streamProcessor = inputModule.createInterface({
    input: process.stdin,
    output: process.stdout
});

streamProcessor.on('line', (currentInput) => {
    inputCount++;
    const numericValue = Number(currentInput);

    if (inputCount === 1) {
        firstOperand = numericValue;
    } else if (inputCount === 2) {
        secondOperand = numericValue;
    } else if (inputCount === 3) {
        thirdOperand = numericValue;
        const finalOutcome = (firstOperand - secondOperand) % thirdOperand;
        console.log(finalOutcome);
        streamProcessor.close();
    }
});

streamProcessor.on('close', () => {
    process.exit();
});
