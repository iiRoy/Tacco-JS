const sqr = (val) => val * val;

const rt = (val) => Math.sqrt(val);

const degToRad = (degrees) => degrees * (Math.PI / 180);

const geometricConstants = {
    HALF_FACTOR: 0.5
};

const processTriangleMetrics = (inputNumbers) => {
    const primarySide = inputNumbers[0];
    const secondarySide = inputNumbers[1];
    const includedAngleDegrees = inputNumbers[2];

    const includedAngleRadians = degToRad(includedAngleDegrees);

    const thirdSideSquared = sqr(primarySide) + sqr(secondarySide) - (2 * primarySide * secondarySide * Math.cos(includedAngleRadians));
    const thirdSide = rt(thirdSideSquared);

    const calculatedArea = geometricConstants.HALF_FACTOR * primarySide * secondarySide * Math.sin(includedAngleRadians);

    const calculatedAltitude = secondarySide * Math.sin(includedAngleRadians);

    const calculatedPerimeter = primarySide + secondarySide + thirdSide;

    return {
        areaResult: calculatedArea,
        perimeterResult: calculatedPerimeter,
        altitudeResult: calculatedAltitude
    };
};

let accumulatedInput = '';
process.stdin.setEncoding('utf8');

process.stdin.on('data', (chunk) => {
    accumulatedInput += chunk;
});

process.stdin.on('end', () => {
    const rawNumericalStrings = accumulatedInput.trim().split(/\s+/);
    const numericalValues = rawNumericalStrings.map(Number);

    if (numericalValues.length < 3 || numericalValues.some(isNaN)) {
        return;
    }

    const finalResults = processTriangleMetrics(numericalValues);

    console.log(finalResults.areaResult + '\n' + finalResults.perimeterResult + '\n' + finalResults.altitudeResult);
});