const fileSystemModule = require("fs");

const STANDARD_INPUT_PATH = '/dev/stdin';

function checkPythagoreanTriple(sideA, sideB, hypotenuse) {
    const squareA = Math.pow(sideA, 2);
    const squareB = Math.pow(sideB, 2);
    const squareC = Math.pow(hypotenuse, 2);
    return squareA + squareB === squareC;
}

function parseTriangleSides(linePartsArray) {
    const valA = parseInt(linePartsArray.shift());
    const valB = parseInt(linePartsArray.shift());
    const valC = parseInt(linePartsArray.shift());
    return { valA, valB, valC };
}

const rawInputData = fileSystemModule.readFileSync(STANDARD_INPUT_PATH).toString();
const allInputLines = rawInputData.split("\n");

const numberOfTestCases = parseInt(allInputLines.shift());

for (let currentCaseIndex = 0; currentCaseIndex < numberOfTestCases; currentCaseIndex++) {
    const currentLineParts = allInputLines[currentCaseIndex].split(" ");
    const { valA, valB, valC } = parseTriangleSides(currentLineParts);

    const sumOfSides = valA + valB + valC;

    if (!isNaN(sumOfSides)) {
        const isRightTriangle = checkPythagoreanTriple(valA, valB, valC);
        console.log(isRightTriangle ? "YES" : "NO");
    }
}
