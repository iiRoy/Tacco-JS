const rli = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

let acquiredOperands = [];

rli.on('line', (inputLineContent) => {
    acquiredOperands = inputLineContent.split(' ').map(Number);
    rli.close();
});

rli.on('close', () => {
    const [divisorValue, dividendValue] = acquiredOperands;

    const deriveAdjustedQuotient = (numerator, denominator) => {
        return Math.floor(numerator / denominator) + 1;
    };

    const computedResult = deriveAdjustedQuotient(dividendValue, divisorValue);

    process.stdout.write(String(computedResult));
});
