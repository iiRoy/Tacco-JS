const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const rawInputLines = fileContent.trim().split('\n');

let rightTriangleCount = 0;
let isoscelesTriangleCount = 0;

const parseLineToNumbers = (lineString) => {
    const stringParts = lineString.split(',');
    const numericValues = stringParts.map(function convertToNumber(str) {
        return Number(str);
    });
    return numericValues;
};

const checkRightAngleProperty = (sideOne, sideTwo, hypotenuse) => {
    const sideOneSquared = sideOne * sideOne;
    const sideTwoSquared = sideTwo * sideTwo;
    const hypotenuseSquared = hypotenuse * hypotenuse;
    return sideOneSquared + sideTwoSquared === hypotenuseSquared;
};

const checkIsoscelesProperty = (sideOne, sideTwo) => {
    return sideOne === sideTwo;
};

let currentInputLine;
while ((currentInputLine = rawInputLines.shift()) !== undefined) {
    if (currentInputLine.length === 0) {
        continue;
    }

    const parsedSides = parseLineToNumbers(currentInputLine);

    const sideA = parsedSides[0];
    const sideB = parsedSides[1];
    const sideC = parsedSides[2];

    if (checkRightAngleProperty(sideA, sideB, sideC)) {
        rightTriangleCount++;
    } else if (checkIsoscelesProperty(sideA, sideB)) {
        isoscelesTriangleCount++;
    }
}

console.log(rightTriangleCount);
console.log(isoscelesTriangleCount);
