const readlineInterface = require('readline');
const standardInput = process.stdin;
const standardOutput = process.stdout;

const ioHandler = readlineInterface.createInterface({
    input: standardInput,
    output: standardOutput
});

const collectedInputLines = [];
ioHandler.on('line', function (singleLine) {
    collectedInputLines.push(singleLine);
});

ioHandler.on('close', function () {
    const MIN_REQUIRED_QUOTIENT = 1000000000;

    const inputNumericValue = Number(collectedInputLines[0]);

    let candidateFactor = 1;

    while (true) {
        const isDivisible = (inputNumericValue % candidateFactor === 0);
        if (!isDivisible) {
            break;
        }

        const currentQuotient = inputNumericValue / candidateFactor;
        const isQuotientLargeEnough = (currentQuotient >= MIN_REQUIRED_QUOTIENT);

        if (!isQuotientLargeEnough) {
            break;
        }

        candidateFactor++;
    }

    const outputPrefix = "0 0 ";
    const outputMiddle = " 0 0 ";
    const finalQuotientValue = inputNumericValue / candidateFactor;

    console.log(outputPrefix + candidateFactor + outputMiddle + finalQuotientValue);
});
