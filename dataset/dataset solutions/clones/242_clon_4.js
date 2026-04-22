const dataStream = require('node:fs').readFileSync('/dev/stdin', 'utf8');
const processedRecords = dataStream.trim().split('\n');

for (const currentRecord of processedRecords) {
    const stringSegments = currentRecord.split(' ');
    const firstOperand = +stringSegments[0];
    const secondOperand = +stringSegments[1];
    const thirdOperand = +stringSegments[2];

    const prohibitedDigits = new Set([firstOperand, secondOperand, thirdOperand]);
    const eligibleDigitsCollection = [];
    for (let digitCandidate = 1; digitCandidate <= 10; ++digitCandidate) {
        if (!prohibitedDigits.has(digitCandidate)) {
            eligibleDigitsCollection.push(digitCandidate);
        }
    }

    let positiveOutcomeCounter = 0;
    const baseSumForCheck = firstOperand + secondOperand;

    for (const testDigit of eligibleDigitsCollection) {
        if (baseSumForCheck + testDigit <= 20) {
            positiveOutcomeCounter++;
        }
    }

    const totalEligibleCount = eligibleDigitsCollection.length;
    const negativeOutcomeCounter = totalEligibleCount - positiveOutcomeCounter;

    process.stdout.write((positiveOutcomeCounter >= negativeOutcomeCounter ? "YES" : "NO") + '\n');
}