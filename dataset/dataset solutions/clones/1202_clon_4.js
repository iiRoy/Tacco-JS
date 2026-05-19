const inputHandler = require('readline');

process.stdin.resume();
process.stdin.setEncoding('utf-8');

const streamProcessor = inputHandler.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

streamProcessor.on('line', (receivedDatum) => {
    const numericalValue = Number(receivedDatum);
    const calculatedResult = Math.pow(numericalValue, 3);
    console.log(calculatedResult);
});
