const inputLines = [];
const ioHandler = require('readline');

const inputReader = ioHandler.createInterface({
    input: process.stdin,
    output: process.stdout,
});

inputReader.on('line', function (currentLineContent) {
    inputLines.push(currentLineContent);
});

const checkDivisibility = (dividend, divisor) => {
    return dividend % divisor === 0;
};

inputReader.on('close', function () {
    const targetValue = Number(inputLines[0]);
    let cumulativeSum = 0;

    const limitForDivisor = Math.sqrt(targetValue);

    for (let potentialDivisor = 1; potentialDivisor < limitForDivisor; potentialDivisor++) {
        if (checkDivisibility(targetValue, potentialDivisor)) {
            const currentQuotient = targetValue / potentialDivisor;
            const correspondingM = currentQuotient - 1;

            if (potentialDivisor !== correspondingM) {
                cumulativeSum += correspondingM;
            }
        }
    }

    console.log(cumulativeSum);
});
