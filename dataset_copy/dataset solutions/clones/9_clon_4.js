const runtimeEnvironment = globalThis.process;
const outputChannel = globalThis.console;

let accumulatedInput = '';

runtimeEnvironment.stdin.resume();
runtimeEnvironment.stdin.setEncoding('utf8');

runtimeEnvironment.stdin.on('data', (incomingSegment) => {
    accumulatedInput += incomingSegment;
});

runtimeEnvironment.stdin.on('end', () => {
    const rawInputLines = accumulatedInput.split('\n');
    rawInputLines.pop();

    rawInputLines.forEach((currentInputLine) => {
        const partsOfLine = currentInputLine.split(' ');

        let firstOperand;
        let secondOperand;

        firstOperand = Number(partsOfLine[0]);
        secondOperand = Number(partsOfLine[1]);

        const totalValue = firstOperand + secondOperand;

        const resultLength = String(totalValue).length;

        outputChannel.log(resultLength);
    });
});