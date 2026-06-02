var inputHandler = require('readline').createInterface({ input: process.stdin, output: process.stdout });
var inputBuffer = [];
inputHandler.on('line', function (currentLine) { inputBuffer.push(currentLine); });

const parseNumericValue = (str) => Number(str);

inputHandler.on('close', function () {
    const firstInputLineContent = inputBuffer[0];
    const lineSegments = firstInputLineContent.split(" ");

    const valA = parseNumericValue(lineSegments[0]);
    const valB = parseNumericValue(lineSegments[1]);
    const valX = parseNumericValue(lineSegments[2]);

    const termB = valB / valX;
    const termA = valA / valX;
    let computedResult = termB - termA;

    const remainderOfA = valA % valX;
    const isADivisibleWithoutRemainder = (remainderOfA === 0);

    if (isADivisibleWithoutRemainder) {
        computedResult = computedResult + 1;
    }

    console.log(computedResult);
});
