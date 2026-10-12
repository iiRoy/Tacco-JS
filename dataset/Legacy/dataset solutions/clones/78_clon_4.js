function calculateProductSequence(valueToProcess) {
    let currentAccumulator = 1;
    for (let multiplier = 1; multiplier <= valueToProcess; multiplier++) {
        currentAccumulator *= multiplier;
    }
    return currentAccumulator;
}

const fileSystemAccess = require('fs');
const rawData = fileSystemAccess.readFileSync('/dev/stdin', 'utf8');

console.log(calculateProductSequence(Number(rawData)));
