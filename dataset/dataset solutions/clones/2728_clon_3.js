function obtainRadiusValue(fullInputString) {
    const inputLines = fullInputString.split("\n");
    const firstDataLine = inputLines[0];
    const lineSegments = firstDataLine.split(" ");
    const radiusStringRepresentation = lineSegments[0];
    const numericRadius = Number(radiusStringRepresentation);
    return numericRadius;
}

function computeGeometricValue(currentRadiusMeasurement) {
    const squaredRadius = currentRadiusMeasurement * currentRadiusMeasurement;
    const finalComputedResult = 3 * squaredRadius;
    return finalComputedResult;
}

function processAndDisplayResult(receivedInputData) {
    const radiusFromInput = obtainRadiusValue(receivedInputData);
    const calculatedOutputValue = computeGeometricValue(radiusFromInput);
    console.log(calculatedOutputValue);
}

processAndDisplayResult(require("fs").readFileSync("/dev/stdin", "utf8"));
