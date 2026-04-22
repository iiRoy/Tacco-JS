const dataHandler = require('fs');

const rawContent = dataHandler.readFileSync('/dev/stdin', 'utf8');

const numericExtractor = /(\d+)\s+(\d+)/;
const matchResult = rawContent.match(numericExtractor);

let valA;
let valB;

if (matchResult && matchResult.length >= 3) {
    valA = parseInt(matchResult[1], 10);
    valB = parseInt(matchResult[2], 10);
} else {
    valA = 0;
    valB = 0;
}

const baseFactor = (1 << valB);
const termOne = 1800 * valB;
const termTwo = 100 * valA;
const aggregateSum = termOne + termTwo;

const finalOutput = baseFactor * aggregateSum;

const outputChannel = process.stdout;
outputChannel.write(String(finalOutput) + '\n');