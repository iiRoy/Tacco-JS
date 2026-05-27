const readlineModule = require('readline');
const inputInterface = readlineModule.createInterface({
    input: process.stdin,
    output: process.stdout
});

const collectedLines = [];
inputInterface.on('line', function (currentLineData) {
    collectedLines.push(currentLineData);
});

inputInterface.on('close', function () {
    const firstLineContent = collectedLines[0];
    const splitDelimiter = " ";
    const lineSegments = firstLineContent.split(splitDelimiter);
    const targetSegment = lineSegments[0];
    const numericInputVal = Number(targetSegment);

    const initialCounter = 1;

    const outputConstantPart = "0 0 1 0 0 ";
    const finalOutputString = outputConstantPart + numericInputVal;

    console.log(finalOutputString);
});
