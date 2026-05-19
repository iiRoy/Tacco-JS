const inputLinesBuffer = [];
const ioModule = require('readline');

const inputOutputInterface = ioModule.createInterface({
    input: process.stdin,
    output: process.stdout,
});

inputOutputInterface.on('line', function (receivedLine) {
    inputLinesBuffer.push(receivedLine);
});

inputOutputInterface.on('close', function () {
    const numQueries = Number(inputLinesBuffer[0]);
    inputLinesBuffer.shift();

    const queryRangePairs = inputLinesBuffer.map(lineContent =>
        lineContent.split(" ").map(numString => Number(numString))
    );

    let maxUpperLimit = 0;
    if (queryRangePairs.length > 0) {
        maxUpperLimit = queryRangePairs.reduce((currentMax, pair) => Math.max(currentMax, pair[1]), 0);
    }

    const cumulativePrimeCounts = Array(maxUpperLimit + 1).fill(0);

    cumulativePrimeCounts[0] = 0;
    cumulativePrimeCounts[1] = 1;
    cumulativePrimeCounts[2] = 2;
    cumulativePrimeCounts[3] = 3;

    const checkSpecialPrimeCondition = (currentNum) => {
        if (currentNum < 4) {
            return false;
        }
        const sqrtOfCurrentNum = Math.sqrt(currentNum);
        const floorSqrtOfCurrentNum = Math.floor(sqrtOfCurrentNum);
        const halfPlusOneValue = (currentNum + 1) / 2;

        for (let potentialDivisor = 2; potentialDivisor <= sqrtOfCurrentNum; potentialDivisor++) {
            if (currentNum % potentialDivisor === 0) {
                return false;
            }
            if (halfPlusOneValue % potentialDivisor === 0) {
                return false;
            }
            if (potentialDivisor === floorSqrtOfCurrentNum) {
                return true;
            }
        }
        return false;
    };

    for (let currentNumber = 4; currentNumber <= maxUpperLimit; currentNumber++) {
        let incrementForCurrent = 0;
        if (checkSpecialPrimeCondition(currentNumber)) {
            incrementForCurrent = 1;
        }
        cumulativePrimeCounts[currentNumber] = cumulativePrimeCounts[currentNumber - 1] + incrementForCurrent;
    }

    const calculateRangeSpecialPrimeCount = (lowerBound, upperBound, countsArray) => {
        if (upperBound === lowerBound) {
            return 1;
        }
        return countsArray[upperBound - 1] - countsArray[lowerBound - 1];
    };

    for (let queryIndex = 0; queryIndex < numQueries; queryIndex++) {
        const currentQueryRange = queryRangePairs[queryIndex];
        const queryLowerBound = currentQueryRange[0];
        const queryUpperBound = currentQueryRange[1];

        console.log(
            calculateRangeSpecialPrimeCount(queryLowerBound, queryUpperBound, cumulativePrimeCounts)
        );
    }
});
