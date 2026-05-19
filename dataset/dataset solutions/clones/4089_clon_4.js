const inputProcessor = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

let capturedInputLine = '';

inputProcessor.on('line', (currentInput) => {
    capturedInputLine = currentInput;
});

inputProcessor.on('close', () => {
    const tokenSequence = capturedInputLine.match(/\S+/g);

    const firstValue = Number(tokenSequence[1]);
    const secondValue = Number(tokenSequence[2]);

    const calculatedDifference = secondValue - firstValue - 1;

    const parityIndicator = (calculatedDifference & 1); // 1 for odd, 0 for even

    const resultMapping = ['Borys', 'Alice']; // Index 0 for even, Index 1 for odd

    console.log(resultMapping[parityIndicator]);
});
