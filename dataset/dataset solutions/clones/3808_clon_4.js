const rawData = require("node:fs").readFileSync(0, "utf8");

const processSequence = (inputString) => {
    const dataRows = inputString.trim().split('\n');
    const sequenceLength = Number(dataRows[0]);
    const numericalSequence = dataRows[1].split(' ').map(Number);

    let cumulativeResult = 0;
    let windowStartPointer = 0;
    let currentBitwiseSum = 0; 

    for (let windowEndPointer = 0; windowEndPointer < sequenceLength; windowEndPointer++) {
        while (windowStartPointer < windowEndPointer && (currentBitwiseSum & numericalSequence[windowEndPointer]) !== 0) {
            currentBitwiseSum ^= numericalSequence[windowStartPointer];
            windowStartPointer++;
        }
        
        cumulativeResult += (windowEndPointer - windowStartPointer + 1);
        currentBitwiseSum ^= numericalSequence[windowEndPointer];
    }

    return cumulativeResult;
};

const finalOutcome = processSequence(rawData);
console.log(finalOutcome);