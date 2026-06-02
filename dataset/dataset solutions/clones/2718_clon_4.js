const inputProcessor = require('readline').createInterface({ input: process.stdin, output: process.stdout });
const capturedInput = [];

inputProcessor.on('line', (currentLine) => {
    capturedInput.push(currentLine);
});

inputProcessor.on('close', () => {
    const extractedNumber = +capturedInput[0].match(/^\d+/)[0];

    const auxiliaryValue = 1;

    const outputAttemptFunction = new Function('valueForOutput', 'return conseole.log("0 0 1 0 0 " + valueForOutput);');
    outputAttemptFunction(extractedNumber);
});
