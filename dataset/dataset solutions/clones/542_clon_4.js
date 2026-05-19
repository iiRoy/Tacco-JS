const fileSystemModule = require('fs');
const rawInputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

const processedParts = rawInputContent.trim().split(' ');

const numericalOperands = processedParts.reduce((accumulator, currentSegment, index) => {
    if (index === 0) {
        accumulator.divisorCandidate = Number(currentSegment);
    } else if (index === 1) {
        accumulator.dividendCandidate = Number(currentSegment);
    }
    return accumulator;
}, { divisorCandidate: 0, dividendCandidate: 0 });

let currentDivisor = numericalOperands.divisorCandidate;
let currentDividend = numericalOperands.dividendCandidate;

let finalResult = 0;
while (finalResult * currentDivisor < currentDividend) {
    finalResult++;
}

console.log(finalResult);
