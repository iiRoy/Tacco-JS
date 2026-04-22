const inputSource = require('readline');

const divisorConstant = 1000000007;

const lineReader = inputSource.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

let inputNumberValue;

lineReader.on('line', (individualLine) => {
    inputNumberValue = parseInt(individualLine.trim(), 10);
});

lineReader.on('close', () => {
    if (typeof inputNumberValue === 'number' && !isNaN(inputNumberValue)) {
        const sequenceForProduct = Array.from({ length: inputNumberValue }, (_, idx) => idx + 1);

        const calculatedResult = sequenceForProduct.reduce((currentProduct, factorElement) => {
            return (currentProduct * factorElement) % divisorConstant;
        }, 1);

        console.log(calculatedResult);
    }
});