const fs = require('fs');

const inputData = fs.readFileSync('/dev/stdin', 'utf8').trim();

let adjustedInput = inputData;
if (adjustedInput.charAt(0) === '>') {
    adjustedInput = '<' + adjustedInput;
}

const sumUpTo = (upperBound) => {
    if (upperBound < 0) {
        return 0;
    }
    return upperBound * (upperBound + 1) / 2;
};

const characterBlocks = adjustedInput.match(/(<+)|(>+)/g) || [];

let cumulativeValue = 0;

for (let blockIndex = 0; blockIndex < characterBlocks.length; blockIndex += 2) {
    const leftBlock = characterBlocks[blockIndex];
    const rightBlock = characterBlocks[blockIndex + 1];

    const leftCount = leftBlock ? leftBlock.length : 0;
    const rightCount = rightBlock ? rightBlock.length : 0;

    if (leftCount > rightCount) {
        cumulativeValue += sumUpTo(leftCount);
        cumulativeValue += sumUpTo(rightCount - 1);
    } else {
        cumulativeValue += sumUpTo(leftCount - 1);
        cumulativeValue += sumUpTo(rightCount);
    }
}

console.log(cumulativeValue);
