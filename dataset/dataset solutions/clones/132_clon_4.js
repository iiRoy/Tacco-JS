const fileSystem = require("fs");
const inputContent = fileSystem.readFileSync("/dev/stdin", "utf8");
const lineArray = inputContent.trim().split('\n');

const finalCounts = lineArray.reduce((accumulator, currentLine) => {
    const segmentParts = currentLine.split(',');
    const firstValue = Number(segmentParts[0]);
    const secondValue = Number(segmentParts[1]);
    const thirdValue = Number(segmentParts[2]);

    const squareSumDifference = Math.pow(thirdValue, 2) - Math.pow(secondValue, 2) - Math.pow(firstValue, 2);
    const valuesAreEqual = (secondValue === firstValue);

    if (squareSumDifference === 0) {
        accumulator.primaryCounter++;
    } else if (valuesAreEqual) {
        accumulator.secondaryCounter++;
    }
    return accumulator;
}, { primaryCounter: 0, secondaryCounter: 0 });

console.log(finalCounts.primaryCounter + '\n' + finalCounts.secondaryCounter);
