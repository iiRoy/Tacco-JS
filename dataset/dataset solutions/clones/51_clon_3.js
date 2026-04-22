// This script processes geometric data from standard input to determine
// if a given query point lies strictly inside a triangle defined by three other points.
// It uses the cross product method for point-in-triangle testing.

// Core module for file system operations, used for standard input.
const fileSystemHandler = require('fs');

/**
 * Reads all content from standard input synchronously.
 * Handles potential errors during the read operation.
 * @returns {string} The trimmed content read from stdin, or an empty string if no content.
 */
function readStdinContent() {
    try {
        const stdinDescriptor = process.stdin.fd;
        const fileStatistics = fileSystemHandler.fstatSync(stdinDescriptor);
        const contentSizeInBytes = fileStatistics.size;

        // If no content is available, return early.
        if (contentSizeInBytes === 0) {
            return '';
        }

        // Allocate a buffer to hold the raw input data.
        const rawInputBuffer = Buffer.alloc(contentSizeInBytes);
        // Read the actual bytes into the buffer.
        const actualBytesTransferred = fileSystemHandler.readSync(
            stdinDescriptor,
            rawInputBuffer,
            0,
            contentSizeInBytes,
            0
        );

        // Convert buffer to UTF-8 string and trim whitespace.
        return rawInputBuffer.toString('utf8', 0, actualBytesTransferred).trim();

    } catch (ioError) {
        // Log critical errors during input reading and exit.
        console.error("Critical error reading standard input:", ioError.message);
        process.exit(1); // Terminate with an error code.
    }
}

/**
 * Represents a 2D point or a vector in a Cartesian coordinate system.
 * Provides methods for vector arithmetic like subtraction and cross product.
 */
class GeometryPoint {
    /**
     * Creates an instance of GeometryPoint.
     * @param {number|string} coordX - The X-coordinate.
     * @param {number|string} coordY - The Y-coordinate.
     * @throws {Error} If coordinates cannot be parsed as valid numbers.
     */
    constructor(coordX, coordY) {
        // Explicitly parse coordinates to floating-point numbers for robustness.
        this.coordX = parseFloat(coordX);
        this.coordY = parseFloat(coordY);

        // Validate that coordinates are indeed numbers.
        if (isNaN(this.coordX) || isNaN(this.coordY)) {
            throw new Error(`Invalid numeric coordinates provided: (${coordX}, ${coordY})`);
        }
    }

    /**
     * Calculates the vector difference between this point and another point.
     * Conceptually, returns 'this - otherPoint'.
     * @param {GeometryPoint} otherPoint - The point to subtract.
     * @returns {GeometryPoint} A new GeometryPoint representing the resulting vector.
     */
    getVectorDifference(otherPoint) {
        return new GeometryPoint(this.coordX - otherPoint.coordX, this.coordY - otherPoint.coordY);
    }

    /**
     * Computes the Z-component of the 2D cross product between this vector and another vector.
     * The sign of the result indicates the orientation of 'otherVector' relative to 'this' vector.
     * @param {GeometryPoint} otherVector - The second vector in the cross product.
     * @returns {number} The scalar Z-component of the 2D cross product.
     */
    calculateCrossProductZComponent(otherVector) {
        return this.coordX * otherVector.coordY - this.coordY * otherVector.coordX;
    }

    /**
     * Static factory method to create a GeometryPoint from an array of numbers.
     * @param {number[]} coordinates - An array containing numeric coordinates.
     * @param {number} [startIndex=0] - The starting index for X and Y coordinates in the array.
     * @returns {GeometryPoint} A new GeometryPoint instance.
     * @throws {Error} If there are not enough coordinates in the array.
     */
    static fromArray(coordinates, startIndex = 0) {
        if (coordinates.length < startIndex + 2) {
            throw new Error(`Insufficient coordinates in array for GeometryPoint at index ${startIndex}.`);
        }
        return new GeometryPoint(coordinates[startIndex], coordinates[startIndex + 1]);
    }
}

/**
 * The main execution function that orchestrates reading input and performing geometric analysis.
 * It processes each line of input to determine if a query point is inside a triangle.
 */
function executeGeometricAnalysis() {
    const rawInputContent = readStdinContent();
    // Handle cases where no input was provided.
    if (!rawInputContent) {
        console.log("No input data was provided for analysis.");
        return;
    }

    // Split the input into individual lines for processing.
    const inputDataLines = rawInputContent.split('\n');
    let successfulInclusionsCounter = 0; // Tracks points deemed inside triangles.
    let failedInclusionsCounter = 0;     // Tracks points deemed outside or lines with errors.

    // Iterate over each line of the input data.
    for (let lineIdentifier = 0; lineIdentifier < inputDataLines.length; lineIdentifier++) {
        const currentDataLine = inputDataLines[lineIdentifier].trim();

        // Skip any empty lines encountered in the input.
        if (currentDataLine === '') {
            continue;
        }

        let parsedNumericCoordinates;
        try {
            // Split the line by space and immediately parse all parts to floating-point numbers.
            parsedNumericCoordinates = currentDataLine.split(' ').map(parseFloat);
        } catch (parsingError) {
            // Log and skip lines that fail during initial parsing.
            console.error(`Skipping line ${lineIdentifier} due to parsing error: ${parsingError.message}. Content: "${currentDataLine}"`);
            failedInclusionsCounter++;
            continue;
        }

        // A valid line must contain 8 numeric coordinates (4 points * 2 dimensions).
        // Also check if any parsed value turned out to be NaN.
        if (parsedNumericCoordinates.length !== 8 || parsedNumericCoordinates.some(isNaN)) {
            console.error(`Invalid coordinate count or format on line ${lineIdentifier}. Expected 8 numeric values, got: "${currentDataLine}". Skipping.`);
            failedInclusionsCounter++;
            continue;
        }

        try {
            // Instantiate the four geometric points from the parsed coordinates.
            // These represent the three vertices of the triangle (A, B, C) and the query point (P).
            const triangleVertexA = GeometryPoint.fromArray(parsedNumericCoordinates, 0);
            const triangleVertexB = GeometryPoint.fromArray(parsedNumericCoordinates, 2);
            const triangleVertexC = GeometryPoint.fromArray(parsedNumericCoordinates, 4);
            const queryPoint = GeometryPoint.fromArray(parsedNumericCoordinates, 6);

            // Calculate the vectors required for the cross product test.
            // These vectors define the edges of the triangle and the vectors from vertices to the query point.
            // The specific vector combinations are crucial for the cross product orientation test.
            const vector_V1_V2 = triangleVertexB.getVectorDifference(triangleVertexA); // V2 - V1
            const vector_V2_QP = queryPoint.getVectorDifference(triangleVertexB);      // QP - V2

            const vector_V2_V3 = triangleVertexC.getVectorDifference(triangleVertexB); // V3 - V2
            const vector_V3_QP = queryPoint.getVectorDifference(triangleVertexC);      // QP - V3

            const vector_V3_V1 = triangleVertexA.getVectorDifference(triangleVertexC); // V1 - V3
            const vector_V1_QP = queryPoint.getVectorDifference(triangleVertexA);      // QP - V1

            // Compute the Z-component of the cross products.
            // The sign of these results determines the orientation of the query point relative to each triangle edge.
            const crossProductResult1 = vector_V1_V2.calculateCrossProductZComponent(vector_V2_QP);
            const crossProductResult2 = vector_V2_V3.calculateCrossProductZComponent(vector_V3_QP);
            const crossProductResult3 = vector_V3_V1.calculateCrossProductZComponent(vector_V1_QP);

            // A point is strictly inside a triangle if and only if all three cross products
            // have the same non-zero sign (all positive or all negative).
            const areAllCrossProductsPositive = (crossProductResult1 > 0 && crossProductResult2 > 0 && crossProductResult3 > 0);
            const areAllCrossProductsNegative = (crossProductResult1 < 0 && crossProductResult2 < 0 && crossProductResult3 < 0);

            if (areAllCrossProductsPositive || areAllCrossProductsNegative) {
                console.log('YES'); // The query point is strictly inside the triangle.
                successfulInclusionsCounter++;
            } else {
                console.log('NO'); // The query point is outside or on an edge/vertex.
                failedInclusionsCounter++;
            }
        } catch (processingError) {
            // Catch and report errors that occur during geometric calculations or point instantiation.
            console.error(`Error processing geometric data on line ${lineIdentifier}: ${processingError.message}. Content: "${currentDataLine}". Skipping.`);
            failedInclusionsCounter++; // Count as a failure due to processing issues.
        }
    }

    // Optional: Output a summary of the analysis.
    /*
    console.log('\n--- Geometric Analysis Summary ---');
    console.log(`Total data lines processed: ${inputDataLines.length}`);
    console.log(`Query points strictly inside triangles: ${successfulInclusionsCounter}`);
    console.log(`Query points outside, on edge, or processing errors: ${failedInclusionsCounter}`);
    */
}

// Initiate the geometric analysis process.
executeGeometricAnalysis();