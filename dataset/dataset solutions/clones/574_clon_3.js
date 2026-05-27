const fs = require('fs');
const rawInputString = fs.readFileSync('/dev/stdin', 'utf8').trim();
const numericDataQueue = rawInputString.split("\n").map(Number);

let currentBlockSize;
while ((currentBlockSize = numericDataQueue.shift()) !== 0) {
    const processedValues = [];
    let isFirstInPair = true;

    for (let blockIndex = 0; blockIndex < currentBlockSize; blockIndex++) {
        const currentValue = numericDataQueue.shift();

        if (isFirstInPair) {
            processedValues.push(currentValue);
        } else {
            const lastProcessedValue = processedValues[processedValues.length - 1];
            if (lastProcessedValue === currentValue) {
                processedValues.push(currentValue);
            } else {
                processedValues.push(currentValue);
                let backtrackIndex = processedValues.length - 2;

                while (backtrackIndex >= 0) {
                    if (processedValues[backtrackIndex] === currentValue) {
                        break;
                    }
                    processedValues[backtrackIndex] = currentValue;
                    backtrackIndex--;
                }
            }
        }
        isFirstInPair = !isFirstInPair;
    }

    const zeroCount = processedValues.reduce((accumulator, value) => {
        return accumulator + (value === 0 ? 1 : 0);
    }, 0);
    console.log(zeroCount);
}
