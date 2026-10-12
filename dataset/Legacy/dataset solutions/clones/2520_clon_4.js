process.stdin.resume();
process.stdin.setEncoding('utf8');

let receivedInputLine = null;
const inputProcessor = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

inputProcessor.on('line', (currentLine) => {
    if (receivedInputLine === null) {
        receivedInputLine = currentLine;
    }
});

inputProcessor.on('close', () => {
    const numericValue = Number(receivedInputLine);
    let finalOutcome;

    if ((numericValue & 1) === 0) {
        finalOutcome = 0.5;
    } else {
        finalOutcome = (numericValue + 1) / (numericValue << 1);
    }
    console.log(finalOutcome);
});
