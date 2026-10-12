const STD_IN_PATH = '/dev/stdin';
const INITIAL_ACCUMULATOR_VALUE = 0;

const parseNumericArrayFromString = (inputLine) => {
    return inputLine.split(" ").map(Number);
};

const rawInputData = require('fs').readFileSync(STD_IN_PATH, 'utf8');
let processedLines = rawInputData.trim().split("\n");

while (true) {
    let currentCaseCount = Number(processedLines.shift());

    if (currentCaseCount === INITIAL_ACCUMULATOR_VALUE) {
        break;
    }

    const pCollection = parseNumericArrayFromString(processedLines.shift());
    let jCollection = parseNumericArrayFromString(processedLines.shift());

    const pSumTotal = pCollection.reduce((acc, currentVal) => acc + currentVal, INITIAL_ACCUMULATOR_VALUE);

    jCollection.sort((valA, valB) => valB - valA);

    let maximumAchieved = pSumTotal * currentCaseCount;

    let remainingCount = currentCaseCount;
    while (jCollection.length > INITIAL_ACCUMULATOR_VALUE) {
        remainingCount--;
        const nextJElement = jCollection.shift();
        const currentIterationResult = (pSumTotal + nextJElement) * remainingCount;
        maximumAchieved = Math.max(maximumAchieved, currentIterationResult);
    }

    console.log(maximumAchieved);
}
