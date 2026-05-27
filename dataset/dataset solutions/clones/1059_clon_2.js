const appSettings = {
    input: '/dev/stdin', // Specifies the input source as standard input
    newline: '\n'        // Defines the character used to separate lines in the input
};

// Reads the entire content from the specified input path, decodes it as UTF-8,
// and then splits it into an array of strings based on the newline character.
const inputData = require('fs').readFileSync(appSettings.input, 'utf-8').split(appSettings.newline);

/**
 * Creates a simple 2D point object with x and y coordinates.
 * @param {number} xCoord - The horizontal coordinate.
 * @param {number} yCoord - The vertical coordinate.
 * @returns {object} An object representing a point.
 */
const createPoint = (xCoord, yCoord) => {
    return { x : xCoord, y : yCoord };
};

/**
 * Recursively generates the points for a Koch curve segment between two given points.
 * This function implements the core fractal generation logic.
 * @param {object} startPoint - The beginning point of the current segment.
 * @param {object} endPoint - The ending point of the current segment.
 * @param {number} iterationCount - The remaining number of iterations to perform.
 * @returns {Array<object>} An array of points that form the Koch curve segment.
 */
const generateKochSegment = (startPoint, endPoint, iterationCount) => {
    // Base case: If no more iterations are needed, return an empty array.
    // This means the segment is not subdivided further.
    if (iterationCount === 0) {
        return [];
    }

    // Pre-calculate cosine and sine of 60 degrees (PI/3 radians) for rotation.
    const cosineVal = Math.cos(Math.PI / 3.0);
    const sineVal = Math.sin(Math.PI / 3.0);

    // Calculate the first dividing point (s) which is 1/3 of the way from startPoint to endPoint.
    const segmentOne = createPoint(
        (2 * startPoint.x + endPoint.x) / 3,
        (2 * startPoint.y + endPoint.y) / 3
    );

    // Calculate the second dividing point (t) which is 2/3 of the way from startPoint to endPoint.
    const segmentTwo = createPoint(
        (startPoint.x + 2 * endPoint.x) / 3,
        (startPoint.y + 2 * endPoint.y) / 3
    );

    // Calculate the peak point (u) of the equilateral triangle.
    // This point is obtained by rotating the vector (segmentTwo - segmentOne) by 60 degrees
    // counter-clockwise around segmentOne.
    const peakPoint = createPoint(
        (segmentTwo.x - segmentOne.x) * cosineVal - (segmentTwo.y - segmentOne.y) * sineVal + segmentOne.x,
        (segmentTwo.x - segmentOne.x) * sineVal + (segmentTwo.y - segmentOne.y) * cosineVal + segmentOne.y
    );
    
    // Recursively call generateKochSegment for the four new sub-segments
    // and concatenate their results along with the new intermediate points.
    return generateKochSegment(startPoint, segmentOne, iterationCount - 1)
               .concat(segmentOne) // Add point 's'
               .concat(generateKochSegment(segmentOne, peakPoint, iterationCount - 1))
               .concat(peakPoint)  // Add point 'u'
               .concat(generateKochSegment(peakPoint, segmentTwo, iterationCount - 1))
               .concat(segmentTwo) // Add point 't'
               .concat(generateKochSegment(segmentTwo, endPoint, iterationCount - 1));
};

/**
 * Computes the complete Koch curve starting from (0,0) to (100,0) for a given number of iterations.
 * @param {number} iterationCount - The total number of iterations for the Koch curve generation.
 * @returns {Array<object>} An array of points that define the entire Koch curve.
 */
const computeKochCurve = (iterationCount) => {
    // If iterationCount is 0, the curve is just the initial straight line segment.
    if (iterationCount === 0) {
        return [createPoint(0.0, 0.0), createPoint(100.0, 0.0)];
    }
    // For N iterations, generate the segments and include the start and end points.
    return [
        createPoint(0.0, 0.0), // The very first point of the curve
        ...generateKochSegment(createPoint(0.0, 0.0), createPoint(100.0, 0.0), iterationCount),
        createPoint(100.0, 0.0) // The very last point of the curve
    ];
};

// Parse the first line of input to get the number of iterations.
const numIterations = parseInt(inputData[0]);

// Generate the Koch curve and then iterate through each point to print its coordinates.
computeKochCurve(numIterations)
    .forEach(currentPoint => {
        // Print x and y coordinates, formatted to 8 decimal places, separated by a space.
        console.log(currentPoint.x.toFixed(8), currentPoint.y.toFixed(8));
    });
