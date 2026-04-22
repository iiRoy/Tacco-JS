const CONVERSION_FACTOR_DEG_TO_RAD = Math.PI / 180.0;
const OUTPUT_PRECISION_DIGITS = 6;

class GeometricShapeEvaluator {
    constructor(sideOne, sideTwo, angleInDegrees) {
        this.edgeA = sideOne;
        this.edgeB = sideTwo;
        this.vertexAngleDegrees = angleInDegrees;
        this.vertexAngleRadians = this.vertexAngleDegrees * CONVERSION_FACTOR_DEG_TO_RAD;
    }

    // Computes the length of the third edge using the law of cosines
    determineOppositeEdgeLength() {
        const termX = this.edgeA * this.edgeA;
        const termY = this.edgeB * this.edgeB;
        const termZ = 2 * this.edgeA * this.edgeB * Math.cos(this.vertexAngleRadians);
        const thirdEdgeSquared = termX + termY - termZ;
        return Math.sqrt(thirdEdgeSquared);
    }

    // Calculates the total enclosed area
    calculateEnclosedSurface() {
        return 0.5 * this.edgeA * this.edgeB * Math.sin(this.vertexAngleRadians);
    }

    // Calculates the total length of the boundary
    calculateTotalBoundary(thirdEdgeLength) {
        return this.edgeA + this.edgeB + thirdEdgeLength;
    }

    // Calculates the altitude (height) relative to edgeA
    calculateVerticalExtent(enclosedSurface) {
        // Derived from Area = 0.5 * base * height
        return (2 * enclosedSurface) / this.edgeA;
    }

    // Orchestrates all calculations and formats the output
    retrieveFormattedMetrics() {
        const edgeC = this.determineOppositeEdgeLength();
        const surfaceAreaResult = this.calculateEnclosedSurface();
        const boundaryLengthResult = this.calculateTotalBoundary(edgeC);
        const verticalExtentResult = this.calculateVerticalExtent(surfaceAreaResult);

        return [
            surfaceAreaResult.toFixed(OUTPUT_PRECISION_DIGITS),
            boundaryLengthResult.toFixed(OUTPUT_PRECISION_DIGITS),
            verticalExtentResult.toFixed(OUTPUT_PRECISION_DIGITS),
        ].join(' ');
    }
}

// Function to handle and process a single line of input
function processSingleInputLine(inputLineSegment) {
    const numericTokens = inputLineSegment.split(/\s+/).map(Number);
    const [val1, val2, valAngle] = numericTokens;

    // Assuming valid input as per original problem constraints
    const shapeEvaluator = new GeometricShapeEvaluator(val1, val2, valAngle);
    return shapeEvaluator.retrieveFormattedMetrics();
}

// Node.js standard input handling using the 'readline' module
const inputInterface = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

let collectedInputSegments = [];

inputInterface.on('line', (currentLine) => {
    collectedInputSegments.push(currentLine);
});

inputInterface.on('close', () => {
    // Process only the first line based on typical problem structure
    if (collectedInputSegments.length > 0) {
        const finalOutput = processSingleInputLine(collectedInputSegments[0]);
        console.log(finalOutput);
    }
});