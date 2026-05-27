process.stdin.resume();
process.stdin.setEncoding('utf8');

const deriveTriangleProperties = (firstEdge, secondEdge, includedAngleDegrees) => {
    const degreesToRadians = (angleInDegrees) => angleInDegrees * (Math.PI / 180);

    const angleInRadians = degreesToRadians(includedAngleDegrees);

    // Calculate the length of the third edge using the Law of Cosines
    const thirdEdgeSquared = firstEdge * firstEdge + secondEdge * secondEdge - 2 * firstEdge * secondEdge * Math.cos(angleInRadians);
    const thirdEdgeLength = Math.sqrt(thirdEdgeSquared);

    // Calculate the area of the triangle
    const surfaceArea = 0.5 * firstEdge * secondEdge * Math.sin(angleInRadians);

    // Calculate the total perimeter
    const totalPerimeter = firstEdge + secondEdge + thirdEdgeLength;

    // Calculate the altitude (height) relative to the first edge as base
    // Area = 0.5 * base * height => height = (2 * Area) / base
    const altitudeToFirstEdge = (2 * surfaceArea) / firstEdge;

    return {
        computedArea: surfaceArea,
        computedPerimeter: totalPerimeter,
        computedAltitude: altitudeToFirstEdge
    };
};

process.stdin.on('data', (inputSegment) => {
    const numericalValues = inputSegment.trim().split(/\s+/).map(Number);

    const [sideA, sideB, angleC] = numericalValues;

    const triangleMeasurements = deriveTriangleProperties(sideA, sideB, angleC);

    console.log(triangleMeasurements.computedArea);
    console.log(triangleMeasurements.computedPerimeter);
    console.log(triangleMeasurements.computedAltitude);
});
