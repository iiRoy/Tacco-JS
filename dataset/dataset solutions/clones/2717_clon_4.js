var ioInterface = require('readline').createInterface({ input: process.stdin, output: process.stdout });
var inputLines = [];
ioInterface.on('line', function (currentLine) { inputLines.push(currentLine); });

function* naturalNumberSequence() {
    let currentNum = 1;
    while (true) {
        yield currentNum++;
    }
}

ioInterface.on('close', function () {
    const parsedNumber = Number(inputLines[0]);
    const billionThreshold = 1000000000;

    let finalDivisorCandidate;
    const numberIterator = naturalNumberSequence();

    for (const testDivisor of numberIterator) {
        const isPerfectlyDivisible = (parsedNumber % testDivisor === 0);
        const isQuotientAtLeastThreshold = (parsedNumber / testDivisor >= billionThreshold);

        if (!isPerfectlyDivisible || !isQuotientAtLeastThreshold) {
            finalDivisorCandidate = testDivisor;
            break;
        }
    }

    console.log("0 0 " + finalDivisorCandidate + " 0 0 " + (parsedNumber / finalDivisorCandidate));
});
