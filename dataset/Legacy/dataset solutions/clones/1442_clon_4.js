const convertDegreesToRadians = (degreesMeasure) => degreesMeasure * Math.PI / 180;

const calculateSine = (radianAngle) => Math.sin(radianAngle);

const calculateCosine = (radianAngle) => Math.cos(radianAngle);

const deriveTriangleCharacteristics = (firstEdgeLength, secondEdgeLength, includedAngleDegrees) => {
    const includedAngleRadians = convertDegreesToRadians(includedAngleDegrees);

    const thirdEdgeSquared = Math.pow(firstEdgeLength, 2) + Math.pow(secondEdgeLength, 2) - (2 * firstEdgeLength * secondEdgeLength * calculateCosine(includedAngleRadians));
    const thirdEdgeLength = Math.sqrt(thirdEdgeSquared);

    const calculatedArea = 0.5 * firstEdgeLength * secondEdgeLength * calculateSine(includedAngleRadians);

    const calculatedPerimeter = firstEdgeLength + secondEdgeLength + thirdEdgeLength;

    const calculatedHeight = secondEdgeLength * calculateSine(includedAngleRadians);

    return {
        surfaceArea: calculatedArea,
        boundaryLength: calculatedPerimeter,
        altitude: calculatedHeight
    };
};

(function (rawInputContent) {
    const cleanedInputLine = rawInputContent.trim();
    const [valueA, valueB, valueC] = cleanedInputLine.split(" ").map(Number);

    const triangleProperties = deriveTriangleCharacteristics(valueA, valueB, valueC);

    console.log(
        `${triangleProperties.surfaceArea.toFixed(8)}\n` +
        `${triangleProperties.boundaryLength.toFixed(8)}\n` +
        `${triangleProperties.altitude.toFixed(8)}`
    );

})(require("fs").readFileSync("/dev/stdin", "utf8"));
