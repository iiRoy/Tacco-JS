const fileSystem = require('fs');

const fullInputContent = fileSystem.readFileSync('/dev/stdin', 'utf8');

const inputLines = fullInputContent.trim().split('\n');

const dimensions = inputLines[0].split(' ').map(numStr => parseInt(numStr, 10));
const totalItems = dimensions[0];
const subsegmentLength = dimensions[1];

const itemValues = inputLines[1].split(' ').map(numStr => parseInt(numStr, 10));

const resultObtainer = (currentMin, indexOffset) => {
    const startPoint = itemValues[indexOffset];
    const endPoint = itemValues[indexOffset + subsegmentLength - 1];

    const routeOne = Math.abs(startPoint) + Math.abs(endPoint - startPoint);
    const routeTwo = Math.abs(endPoint) + Math.abs(endPoint - startPoint);

    return Math.min(currentMin, routeOne, routeTwo);
};

const finalResult = Array.from({ length: totalItems - subsegmentLength + 1 }, (_, index) => index)
    .reduce(resultObtainer, Infinity);

console.log(finalResult);