let accumulatedInput = '';
let outputQueue = [];

process.stdin.on('data', fragment => {
    accumulatedInput += fragment.toString();
});

process.stdin.on('end', () => {
    const inputSegments = accumulatedInput.trim().split('\n');

    const totalQueries = parseInt(inputSegments.shift(), 10);
    const queryRanges = inputSegments.map(textLine =>
        textLine.split(" ").map(numericalString => parseInt(numericalString, 10))
    );

    const rangeCollection = [...queryRanges];
    rangeCollection.sort((pairA, pairB) => pairB[1] - pairA[1]);

    const uppermostBound = rangeCollection[0][1];

    const specialNumberMarks = new Array(uppermostBound + 1).fill(false);
    specialNumberMarks[1] = true;
    specialNumberMarks[2] = true;
    specialNumberMarks[3] = true;

    for (let currentNum = 4; currentNum <= uppermostBound; currentNum++) {
        let passesChecks = true;
        const rootOfNum = Math.sqrt(currentNum);
        for (let testDivisor = 2; testDivisor <= rootOfNum; testDivisor++) {
            if (currentNum % testDivisor === 0) {
                passesChecks = false;
                break;
            }
            const relatedHalf = (currentNum + 1) / 2;
            if (relatedHalf % testDivisor === 0) {
                passesChecks = false;
                break;
            }
        }
        specialNumberMarks[currentNum] = passesChecks;
    }

    const cumulativeSpecialValues = new Array(uppermostBound + 1).fill(0);
    cumulativeSpecialValues[0] = 0;
    cumulativeSpecialValues[1] = 1;
    cumulativeSpecialValues[2] = 2;
    cumulativeSpecialValues[3] = 3;

    for (let currentNum = 4; currentNum <= uppermostBound; currentNum++) {
        cumulativeSpecialValues[currentNum] = cumulativeSpecialValues[currentNum - 1] + (specialNumberMarks[currentNum] ? 1 : 0);
    }

    for (let qIdx = 0; qIdx < totalQueries; qIdx++) {
        const currentQueryPair = queryRanges[qIdx];
        const lowerBound = currentQueryPair[0];
        const upperBound = currentQueryPair[1];

        if (upperBound === lowerBound) {
            outputQueue.push(1);
        } else {
            outputQueue.push(cumulativeSpecialValues[upperBound - 1] - cumulativeSpecialValues[lowerBound - 1]);
        }
    }

    process.stdout.write(outputQueue.join('\n'));
});