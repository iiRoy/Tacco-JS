const PI_CONSTANT = 3.141592653589793;
const DEGREE_TO_RADIAN_CONVERSION = PI_CONSTANT / 180.0;

function acquireNumeric(textRepresentation) {
    return parseFloat(textRepresentation);
}

function calculateSine(angleInDegrees) {
    return Math.sin(angleInDegrees * DEGREE_TO_RADIAN_CONVERSION);
}

function calculateCosine(angleInDegrees) {
    return Math.cos(angleInDegrees * DEGREE_TO_RADIAN_CONVERSION);
}

function calculateSquareRoot(valueToRoot) {
    return Math.sqrt(valueToRoot);
}

function formatDecimalOutput(numericValue) {
    return numericValue.toFixed(8);
}

function processGeometricConfiguration(measurements) {
    const sideA = measurements[0];
    const sideB = measurements[1];
    const includedAngle = measurements[2];

    const surfaceExtent = 0.5 * sideA * sideB * calculateSine(includedAngle);

    const squareOfSideA = sideA * sideA;
    const squareOfSideB = sideB * sideB;
    const termForThirdSide = 2 * sideA * sideB * calculateCosine(includedAngle);
    const sideC = calculateSquareRoot(squareOfSideA + squareOfSideB - termForThirdSide);

    const verticalDimension = (2 * surfaceExtent) / sideA;

    const boundaryTotal = sideA + sideB + sideC;

    return {
        areaValue: surfaceExtent,
        perimeterValue: boundaryTotal,
        heightValue: verticalDimension
    };
}

const rawTextContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const processedNumbers = rawTextContent.trim().split(" ").map(acquireNumeric);

const derivedGeometricFacts = processGeometricConfiguration(processedNumbers);

const finalOutputString = formatDecimalOutput(derivedGeometricFacts.areaValue) + " " +
                         formatDecimalOutput(derivedGeometricFacts.perimeterValue) + " " +
                         formatDecimalOutput(derivedGeometricFacts.heightValue);

process.stdout.write(finalOutputString + "\n");