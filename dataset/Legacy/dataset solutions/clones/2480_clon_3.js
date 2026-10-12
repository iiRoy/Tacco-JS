const PI_CONSTANT = Math.PI;

function calculateAngleInDegrees(radiansValue) {
    const DEGREES_PER_RADIAN_FACTOR = 180 / PI_CONSTANT;
    return radiansValue * DEGREES_PER_RADIAN_FACTOR;
}

function processInputData(rawInputLines) {
    const inputParts = rawInputLines[0].split(' ');
    let dimensionA = inputParts[0];
    let dimensionB = inputParts[1];
    let desiredVolume = inputParts[2];

    const aSquaredValue = dimensionA * dimensionA;
    const totalTankVolume = aSquaredValue * dimensionB;

    let currentHeightComponent;
    let computedAngleRadians;

    if (desiredVolume >= totalTankVolume / 2) {
        const volumeRatioTerm = desiredVolume / aSquaredValue;
        currentHeightComponent = 2 * (dimensionB - volumeRatioTerm);
        computedAngleRadians = Math.atan(currentHeightComponent / dimensionA);
    } else {
        currentHeightComponent = (2 * desiredVolume) / (dimensionA * dimensionB);
        computedAngleRadians = Math.atan(dimensionB / currentHeightComponent);
    }

    const finalCalculatedAngle = calculateAngleInDegrees(computedAngleRadians);
    console.log("%s", finalCalculatedAngle);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8").split("\n"));
