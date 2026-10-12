const fileSystemAccess = require("fs");

function processAndOutputResult(inputLines) {
    const dataSize = Number(inputLines[0]);
    const originalNumbers = inputLines[1].split(" ").map(Number);

    const transformedNumbers = originalNumbers.map((value, index) => value - index - 1);

    transformedNumbers.sort((a, b) => a - b);

    let referencePoint;
    const midIndex = Math.floor(dataSize / 2);

    if (dataSize % 2 === 0) {
        referencePoint = transformedNumbers[midIndex - 1] + transformedNumbers[midIndex];
    } else {
        referencePoint = transformedNumbers[midIndex];
    }

    const totalAbsoluteDifference = transformedNumbers.reduce((sumAccumulator, currentNumber) => {
        return sumAccumulator + Math.abs(currentNumber - referencePoint);
    }, 0);

    console.log(totalAbsoluteDifference);
}

const rawInputContent = fileSystemAccess.readFileSync("/dev/stdin", "UTF-8");
const parsedInputLines = rawInputContent.split("\n");

processAndOutputResult(parsedInputLines);
