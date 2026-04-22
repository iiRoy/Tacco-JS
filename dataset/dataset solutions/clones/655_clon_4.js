const inputSource = require('readline');

const processingInterface = inputSource.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

const numberPattern = /^(\d+)\s+(\d+)$/;

processingInterface.on('line', (individualLine) => {
    const lineMatch = individualLine.match(numberPattern);

    if (lineMatch && lineMatch.length === 3) {
        const firstValue = +lineMatch[1];
        const secondValue = +lineMatch[2];
        const totalSum = firstValue + secondValue;
        console.log(totalSum);
    }
});