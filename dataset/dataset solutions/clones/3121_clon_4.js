var inputBuffer = [];
const moduloConstant = Math.pow(10, 9) + 7;
let finalProduct = 1;

const ioHandler = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
});

ioHandler.on('line', function (lineContent) {
    inputBuffer.push(lineContent);
});

ioHandler.on('close', function () {
    const strLength = Number(inputBuffer[0]);
    const charSequence = inputBuffer[1];

    const frequencyMap = new Map();
    for (const charUnit of charSequence) {
        frequencyMap.set(charUnit, (frequencyMap.get(charUnit) || 0) + 1);
    }

    finalProduct = Array.from(frequencyMap.values()).reduce((accumulator, currentCount) => {
        return accumulator * (currentCount + 1);
    }, 1);

    console.log(finalProduct - 1);
});
