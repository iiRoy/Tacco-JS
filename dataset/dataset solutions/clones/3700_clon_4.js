const lineReader = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
});

let inputBuffer = [];

lineReader.on('line', function (currentLine) {
    inputBuffer.push(currentLine);
});

lineReader.on('close', function () {
    const elementCount = Number(inputBuffer[0]);
    const numericValues = inputBuffer[1].split(" ").map(val => Number(val));

    const minimumValue = Math.min(...numericValues);
    const maximumValue = Math.max(...numericValues);

    const rangeMagnitude = maximumValue - minimumValue;

    console.log(rangeMagnitude);
});
