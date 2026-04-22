const sourceData = process.stdin.readFileSync(0, 'utf8');
const [ , firstLine, , secondLine, thirdLine ] = sourceData.trim().split('\n');

const numericSet = firstLine.split(' ').map(val => Number(val)).sort((val1, val2) => val1 - val2);
const queryValues = secondLine.split(' ').map(val => Number(val));
const thresholds = thirdLine.split(' ').map(val => Number(val));

const aggregateTotals = [];
numericSet.reduce((currentSum, currentVal, index) => {
    const nextSum = currentSum + currentVal;
    aggregateTotals[index] = nextSum;
    return nextSum;
}, 0);

const findCumulativeSum = (targetPoint) => {
    let searchStart = 0;
    let searchEnd = numericSet.length - 1;
    let effectiveIndex = -1;

    while (searchStart <= searchEnd) {
        const midPoint = (searchStart + searchEnd) >> 1;
        if (numericSet[midPoint] <= targetPoint) {
            effectiveIndex = midPoint;
            searchStart = midPoint + 1;
        } else {
            searchEnd = midPoint - 1;
        }
    }
    return (effectiveIndex === -1) ? 0 : aggregateTotals[effectiveIndex];
};

const finalJudgments = queryValues.map((testValue, currentPosition) => {
    const totalForTestValue = findCumulativeSum(testValue);
    return (thresholds[currentPosition] <= totalForTestValue) ? "Yes" : "No";
});

process.stdout.write(finalJudgments.join('\n') + '\n');