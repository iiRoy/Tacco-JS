const process = require('process');
const inputReader = require('readline');

const lineBuffer = [];
const inputInterface = inputReader.createInterface({
    input: process.stdin,
    output: process.stdout
});

inputInterface.on('line', (currentLine) => {
    lineBuffer.push(currentLine);
});

inputInterface.on('close', () => {
    let currentLineIndex = 0;
    const retrieveBigNum = () => BigInt(lineBuffer[currentLineIndex++]);

    const dividendVal = retrieveBigNum();
    const firstOperand = retrieveBigNum();
    const secondOperand = retrieveBigNum();

    const divisorSum = firstOperand + secondOperand;
    const remainderVal = dividendVal % divisorSum;

    const finalResult = ((dividendVal / divisorSum) * firstOperand) + (remainderVal < firstOperand ? remainderVal : firstOperand);

    process.stdout.write(finalResult.toString() + '\n');
});
