const fileSystemUtility = require('node:fs');

const calculateSpecialSum = (numericInputA, numericInputB) => {
    const aggregatedResult = Array.from({ length: numericInputA }, (_, iterationIndex) => iterationIndex + 1)
        .reduce((currentTotal, currentDivisorCandidate) => {
            const divisionQuotient = Math.floor(numericInputA / currentDivisorCandidate);
            const divisionRemainder = numericInputA % currentDivisorCandidate;

            const componentOne = divisionQuotient * Math.max(0, currentDivisorCandidate - numericInputB);
            const componentTwo = Math.max(0, divisionRemainder - numericInputB + 1);

            return currentTotal + componentOne + componentTwo;
        }, 0);

    return (numericInputB === 0) ? (aggregatedResult - numericInputA) : aggregatedResult;
};

(() => {
    const rawInputContent = fileSystemUtility.readFileSync('/dev/stdin', { encoding: 'utf8' });

    const [valA, valB] = rawInputContent
        .trim()
        .split('\n')[0]
        .split(' ')
        .map(Number);

    const finalOutcome = calculateSpecialSum(valA, valB);

    console.log(finalOutcome);
})();