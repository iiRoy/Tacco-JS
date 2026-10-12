var inputBuffer = [];
var ioInterface = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
});

ioInterface.on('line', function (currentLine) {
    inputBuffer.push(currentLine);
});

ioInterface.on('close', function () {
    const [countTotal, windowSize] = inputBuffer[0].split(' ').map(Number);
    const heightValues = inputBuffer.slice(1).map(Number);

    heightValues.sort((valA, valB) => valA - valB);

    const finalResult = Array.from({ length: heightValues.length - windowSize + 1 }, (_, idx) => {
        return heightValues[idx + windowSize - 1] - heightValues[idx];
    }).reduce((minVal, currentVal) => Math.min(minVal, currentVal), Infinity);

    console.log(finalResult);
});
