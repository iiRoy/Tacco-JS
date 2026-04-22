const libIO = require('fs');

const rawSource = libIO.readFileSync(0, { encoding: 'utf8' });

const lineSegments = rawSource.trim().split('\n');

const firstLineNumber = parseInt(lineSegments[0], 10);
const secondLineNumbers = lineSegments[1].split(' ').map(Number);
const thirdLineNumbers = lineSegments[2].split(' ').map(Number);

const derivedInputs = {
    upperBound: firstLineNumber,
    pointAlpha: secondLineNumbers[0] - 1,
    pointBeta: secondLineNumbers[1] - 1,
    pointGamma: thirdLineNumbers[0] - 1,
    pointDelta: thirdLineNumbers[1] - 1
};

const determineManhattanDistance = (valA, valB, dimension) => {
    const rowA = Math.floor(valA / dimension);
    const colA = valA % dimension;
    const rowB = Math.floor(valB / dimension);
    const colB = valB % dimension;
    return Math.abs(rowA - rowB) + Math.abs(colA - colB);
};

const generateSequence = (limit) => Array.from({ length: limit }, (_, index) => index + 1);

const finalResult = generateSequence(derivedInputs.upperBound).reduce((currentMinSum, currentDimension) => {
    const distOneTwo = determineManhattanDistance(
        derivedInputs.pointAlpha,
        derivedInputs.pointBeta,
        currentDimension
    );
    const distThreeFour = determineManhattanDistance(
        derivedInputs.pointGamma,
        derivedInputs.pointDelta,
        currentDimension
    );
    const combinedDistances = distOneTwo + distThreeFour;
    return Math.min(currentMinSum, combinedDistances);
}, Number.POSITIVE_INFINITY);

console.log(finalResult);