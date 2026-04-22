// A module for 2D geometrical calculations
// This JavaScript file defines fundamental classes and functions for handling
// vectors, points, lines, and segments in a 2D coordinate system.

/**
 * Represents a 2D position or displacement.
 * This can be used as both a point and a vector.
 * @param {number} coordX - The horizontal component.
 * @param {number} coordY - The vertical component.
 */
function Vec2D(coordX, coordY) {
    this.x = coordX;
    this.y = coordY;
}

// A static method to simplify creation of new Vec2D instances.
Vec2D.createFromCoords = (horiz, vert) => new Vec2D(horiz, vert);

// A small constant for floating-point comparisons to handle precision errors.
const EPSILON_FLOAT_COMP = 1e-9;

/**
 * Produces a new vector by rotating the input vector 90 degrees counter-clockwise.
 * @param {Vec2D} originalVec - The vector to be rotated.
 * @returns {Vec2D} A newly created vector representing the 90-degree rotation.
 */
const getRotatedNinetyDegrees = (originalVec) => {
    // The transformation for a 90-degree counter-clockwise rotation is (x, y) -> (-y, x).
    const newXCoord = -originalVec.y;
    const newYCoord = originalVec.x;
    return Vec2D.createFromCoords(newXCoord, newYCoord);
};

/**
 * Transforms an angle from degrees into radians.
 * @param {number} angleDegrees - The angle expressed in degrees.
 * @returns {number} The angle converted to radians.
 */
const convertDegreesToRad = (angleDegrees) => {
    // Utilize Math.PI for maximum precision in the conversion.
    return angleDegrees * (Math.PI / 180.0);
};

/**
 * Rotates a given vector by a specified angle around the origin.
 * @param {Vec2D} sourceVec - The vector that needs to be rotated.
 * @param {number} rotationAngleDegrees - The angle of rotation in degrees.
 * @returns {Vec2D} A brand new vector after applying the rotation.
 */
const generateRotatedVector = (sourceVec, rotationAngleDegrees) => {
    const angleInRadians = convertDegreesToRad(rotationAngleDegrees);

    const sineValue = Math.sin(angleInRadians);
    const cosineValue = Math.cos(angleInRadians);

    // Apply the 2D rotation matrix:
    // x' = x*cos(theta) - y*sin(theta)
    // y' = x*sin(theta) + y*cos(theta)
    const resultX = sourceVec.x * cosineValue - sourceVec.y * sineValue;
    const resultY = sourceVec.x * sineValue + sourceVec.y * cosineValue;

    return Vec2D.createFromCoords(resultX, resultY);
};

/**
 * Determines if two vectors are considered identical within a floating-point tolerance.
 * @param {Vec2D} firstOperand - The first vector for comparison.
 * @param {Vec2D} secondOperand - The second vector for comparison.
 * @returns {boolean} True if the vectors' components are approximately equal, false otherwise.
 */
const compareVectorsApprox = (firstOperand, secondOperand) => {
    // Check if the absolute difference between corresponding components is below the tolerance.
    const deltaX = firstOperand.x - secondOperand.x;
    const deltaY = firstOperand.y - secondOperand.y;
    return Math.abs(deltaX) < EPSILON_FLOAT_COMP && Math.abs(deltaY) < EPSILON_FLOAT_COMP;
};

/**
 * Computes the normalized (unit) vector of an input vector.
 * If the input vector has negligible length, it returns a zero vector to prevent division by zero.
 * @param {Vec2D} inputVector - The vector to be normalized.
 * @returns {Vec2D} A new unit vector, or a zero vector if the input magnitude is too small.
 */
const getUnitVector = (inputVector) => {
    const vecMagnitude = calculateMagnitude(inputVector);
    if (vecMagnitude > EPSILON_FLOAT_COMP) {
        return Vec2D.createFromCoords(inputVector.x / vecMagnitude, inputVector.y / vecMagnitude);
    }
    // Return a zero vector if the original vector has no significant length.
    return Vec2D.createFromCoords(0, 0);
};

/**
 * Calculates the Euclidean length (magnitude) of a 2D vector.
 * @param {Vec2D} targetVector - The vector whose length is to be calculated.
 * @returns {number} The scalar magnitude of the vector.
 */
const calculateMagnitude = (targetVector) => {
    // Math.hypot is preferred for its numerical stability and readability.
    return Math.hypot(targetVector.x, targetVector.y);
};

/**
 * Compares two floating-point numbers for approximate equality.
 * @param {number} valA - The first floating-point number.
 * @param {number} valB - The second floating-point number.
 * @returns {boolean} True if the numbers are approximately equal, false otherwise.
 */
const areFloatsNearlyEqual = (valA, valB) => {
    return Math.abs(valA - valB) < EPSILON_FLOAT_COMP;
};

/**
 * Determines if two vectors are parallel (or anti-parallel).
 * @param {Vec2D} vecA - The first vector.
 * @param {Vec2D} vecB - The second vector.
 * @returns {boolean} True if the vectors are parallel, false otherwise.
 */
const testVectorParallelism = (vecA, vecB) => {
    // Two vectors are parallel if the 2D cross product is zero.
    // Alternatively, if one vector rotated 90 degrees is perpendicular to the other.
    const rotatedA = getRotatedNinetyDegrees(vecA);
    return areFloatsNearlyEqual(0, computeScalarDotProduct(rotatedA, vecB));
};

/**
 * Checks if two vectors are perpendicular (orthogonal).
 * @param {Vec2D} vectorP - The first vector.
 * @param {Vec2D} vectorQ - The second vector.
 * @returns {boolean} True if the vectors are perpendicular, false otherwise.
 */
const testVectorPerpendicularity = (vectorP, vectorQ) => {
    // Two vectors are perpendicular if their dot product is zero.
    return areFloatsNearlyEqual(0, computeScalarDotProduct(vectorP, vectorQ));
};

/**
 * Subtracts the second vector from the first vector, creating a new vector.
 * @param {Vec2D} primaryVec - The vector from which to subtract.
 * @param {Vec2D} secondaryVec - The vector to be subtracted.
 * @returns {Vec2D} A new vector representing the difference.
 */
const getVectorDifference = (primaryVec, secondaryVec) => {
    return Vec2D.createFromCoords(primaryVec.x - secondaryVec.x, primaryVec.y - secondaryVec.y);
};

/**
 * Computes the dot product (scalar product) of two vectors.
 * @param {Vec2D} uVector - The first vector.
 * @param {Vec2D} vVector - The second vector.
 * @returns {number} The scalar dot product.
 */
const computeScalarDotProduct = (uVector, vVector) => {
    return uVector.x * vVector.x + uVector.y * vVector.y;
};

/**
 * Calculates the 2D cross product (or Z-component of 3D cross product) of two vectors.
 * This scalar value indicates the "signed area" of the parallelogram formed by the vectors.
 * @param {Vec2D} firstVec - The initial vector.
 * @param {Vec2D} secondVec - The terminal vector.
 * @returns {number} The scalar cross product.
 */
const calculateTwoDCrossProduct = (firstVec, secondVec) => {
    return firstVec.x * secondVec.y - firstVec.y * secondVec.x;
};

/**
 * Represents a straight line segment defined by two endpoints.
 * @param {Vec2D} startPt - The starting point of the segment.
 * @param {Vec2D} endPt - The ending point of the segment.
 */
class StraightSegment {
    constructor(startPt, endPt) {
        this.start = startPt;
        this.end = endPt;
    }
}

/**
 * Represents an infinite line defined by a point on the line and its direction.
 * @param {Vec2D} basePoint - A point that lies on the line.
 * @param {Vec2D} directionVector - A vector indicating the line's orientation.
 */
function InfiniteLine(basePoint, directionVector) {
    this.anchor = basePoint;
    this.orientation = directionVector;
}

/**
 * Checks if a line segment is entirely on one side of an infinite separating line.
 * This is a core component of the Separating Axis Theorem (SAT).
 * @param {InfiniteLine} separatorLine - The line acting as the separating axis.
 * @param {StraightSegment} targetSeg - The segment to test against the separator.
 * @returns {boolean} True if both endpoints of the target segment are on the same side
 *                    of the separator line (or one endpoint is exactly on the line).
 */
const isSegmentOnOneSide = (separatorLine, targetSeg) => {
    // Vectors from the separator's anchor to the target segment's endpoints.
    const vecToStart = getVectorDifference(targetSeg.start, separatorLine.anchor);
    const vecToEnd = getVectorDifference(targetSeg.end, separatorLine.anchor);

    // Get the normal vector to the separator line's orientation.
    const normalVec = getRotatedNinetyDegrees(separatorLine.orientation);

    // Compute the dot products. Their signs indicate which side of the line the points are on.
    const dotProductStart = computeScalarDotProduct(normalVec, vecToStart);
    const dotProductEnd = computeScalarDotProduct(normalVec, vecToEnd);

    // If the product of dot products is positive, they are on the same side.
    // If it's negative, they are on opposite sides (crossing the line).
    // If zero, one or both points are on the line itself.
    // We use EPSILON_FLOAT_COMP to handle cases where points are very close to the line.
    return (dotProductStart * dotProductEnd) > EPSILON_FLOAT_COMP;
};

/**
 * Determines if two 1D numerical ranges overlap.
 * @param {number} range1Min - Minimum value of the first range.
 * @param {number} range1Max - Maximum value of the first range.
 * @param {number} range2Min - Minimum value of the second range.
 * @param {number} range2Max - Maximum value of the second range.
 * @returns {boolean} True if the ranges intersect or touch, false otherwise.
 */
const checkRangeOverlap = (range1Min, range1Max, range2Min, range2Max) => {
    // Ranges overlap if neither range's end is before the other's start.
    return range1Min <= range2Max && range2Min <= range1Max;
};

/**
 * Checks if two line segments intersect using a combination of SAT and collinearity checks.
 * @param {StraightSegment} segOne - The first line segment.
 * @param {StraightSegment} segTwo - The second line segment.
 * @returns {boolean} True if the segments collide or touch, false otherwise.
 */
const detectSegmentCollision = (segOne, segTwo) => {
    // Create an infinite line from the first segment's direction.
    const dirOne = getVectorDifference(segOne.end, segOne.start);
    const lineFromSegOne = new InfiniteLine(segOne.start, dirOne);

    // If segment two is entirely on one side of line one, they don't intersect.
    if (isSegmentOnOneSide(lineFromSegOne, segTwo)) {
        return false;
    }

    // Create an infinite line from the second segment's direction.
    const dirTwo = getVectorDifference(segTwo.end, segTwo.start);
    const lineFromSegTwo = new InfiniteLine(segTwo.start, dirTwo);

    // If segment one is entirely on one side of line two, they don't intersect.
    if (isSegmentOnOneSide(lineFromSegTwo, segOne)) {
        return false;
    }

    // If the segments are parallel (or collinear), we need to check for 1D overlap.
    if (testVectorParallelism(dirOne, dirTwo)) {
        // Project both segments onto one of their direction vectors.
        const projRangeOne = projectSegmentToRange(segOne, dirOne);
        const projRangeTwo = projectSegmentToRange(segTwo, dirOne);

        // Check for overlap of these 1D projected ranges.
        return checkRangeOverlap(projRangeOne.minVal, projRangeOne.maxVal, projRangeTwo.minVal, projRangeTwo.maxVal);
    }

    // If they are not parallel and passed the one-side checks, they must intersect.
    return true;
};

/**
 * Represents a numerical interval with a minimum and maximum value.
 * @param {number} minVal - The smallest value in the range.
 * @param {number} maxVal - The largest value in the range.
 */
class ScalarRange {
    constructor(minVal, maxVal) {
        this.minVal = minVal;
        this.maxVal = maxVal;
    }
}

/**
 * Ensures that a ScalarRange's minVal is actually less than or equal to its maxVal.
 * Swaps them if they are in the wrong order.
 * @param {ScalarRange} inputRange - The range to normalize.
 * @returns {ScalarRange} A new, normalized ScalarRange.
 */
const normalizeScalarRange = (inputRange) => {
    if (inputRange.minVal > inputRange.maxVal) {
        return new ScalarRange(inputRange.maxVal, inputRange.minVal);
    }
    return new ScalarRange(inputRange.minVal, inputRange.maxVal);
};

/**
 * Creates a new vector with components negated from the input vector.
 * @param {Vec2D} originalVector - The vector to negate.
 * @returns {Vec2D} A new vector with components (-x, -y).
 */
const getNegatedVector = (originalVector) => {
    return Vec2D.createFromCoords(-originalVector.x, -originalVector.y);
};

/**
 * Adds two vectors component-wise, returning a new sum vector.
 * @param {Vec2D} addendOne - The first vector to add.
 * @param {Vec2D} addendTwo - The second vector to add.
 * @returns {Vec2D} A new vector representing the sum.
 */
const addVectors = (addendOne, addendTwo) => {
    return Vec2D.createFromCoords(addendOne.x + addendTwo.x, addendOne.y + addendTwo.y);
};

/**
 * Projects a line segment onto a specified axis vector, yielding a 1D scalar range.
 * @param {StraightSegment} segToProject - The segment to be projected.
 * @param {Vec2D} axisForProjection - The vector defining the projection axis.
 * @returns {ScalarRange} A ScalarRange representing the projected interval.
 */
const projectSegmentToRange = (segToProject, axisForProjection) => {
    const normalizedAxis = getUnitVector(axisForProjection);

    // Project each endpoint onto the unit axis.
    const projectionStart = computeScalarDotProduct(normalizedAxis, segToProject.start);
    const projectionEnd = computeScalarDotProduct(normalizedAxis, segToProject.end);

    // Ensure the min and max values of the range are correctly ordered.
    return normalizeScalarRange(new ScalarRange(projectionStart, projectionEnd));
};

/**
 * Scales a vector by a scalar factor, returning a new scaled vector.
 * @param {Vec2D} vecToScale - The vector to multiply.
 * @param {number} scalarFactor - The value to multiply the vector components by.
 * @returns {Vec2D} A new vector with scaled components.
 */
const multiplyVectorByScalar = (vecToScale, scalarFactor) => {
    return Vec2D.createFromCoords(vecToScale.x * scalarFactor, vecToScale.y * scalarFactor);
};

/**
 * Constrains a value to be within a specified minimum and maximum boundary.
 * @param {number} valueInput - The number to clamp.
 * @param {number} lowerBoundary - The smallest allowed value.
 * @param {number} upperBoundary - The largest allowed value.
 * @returns {number} The clamped value.
 */
const clampValue = (valueInput, lowerBoundary, upperBoundary) => {
    return Math.max(lowerBoundary, Math.min(valueInput, upperBoundary));
};

/**
 * Calculates the shortest perpendicular distance from a point to an infinite line.
 * The line is defined by a segment (whose endpoints lie on the line).
 * @param {StraightSegment} lineDefSegment - A segment whose endpoints define the line.
 * @param {Vec2D} testPoint - The point from which to measure the distance.
 * @returns {number} The shortest distance from the point to the line.
 */
const getPointToLineDistance = (lineDefSegment, testPoint) => {
    const lineDirection = getVectorDifference(lineDefSegment.end, lineDefSegment.start);
    const pointToLineStart = getVectorDifference(testPoint, lineDefSegment.start);

    // The magnitude of the 2D cross product of lineDirection and pointToLineStart
    // gives the area of the parallelogram formed by these two vectors.
    // Distance = Area / base_length (where base_length is magnitude of lineDirection)
    const crossProductMag = Math.abs(calculateTwoDCrossProduct(lineDirection, pointToLineStart));
    const lineLength = calculateMagnitude(lineDirection);

    if (lineLength < EPSILON_FLOAT_COMP) {
        // If the "line" segment is actually a point, return distance to that point.
        return calculateMagnitude(pointToLineStart);
    }
    return crossProductMag / lineLength;
};

/**
 * Calculates the shortest distance from a point to a finite line segment.
 * @param {StraightSegment} segmentTarget - The line segment.
 * @param {Vec2D} queryPoint - The point.
 * @returns {number} The shortest distance.
 */
const getPointToSegmentDistance = (segmentTarget, queryPoint) => {
    const segmentVec = getVectorDifference(segmentTarget.end, segmentTarget.start);
    const pointToStart = getVectorDifference(queryPoint, segmentTarget.start);
    const pointToEnd = getVectorDifference(queryPoint, segmentTarget.end);

    // If the projection of the point falls outside the segment, the closest point is an endpoint.
    // Check if point is 'behind' segment.start (dot product < 0)
    if (computeScalarDotProduct(pointToStart, segmentVec) < 0) {
        return calculateMagnitude(pointToStart);
    }
    // Check if point is 'beyond' segment.end (dot product of (point-end) and (-segmentVec) < 0)
    if (computeScalarDotProduct(pointToEnd, getNegatedVector(segmentVec)) < 0) {
        return calculateMagnitude(pointToEnd);
    }

    // Otherwise, the projection falls within the segment, so the distance is to the infinite line.
    return getPointToLineDistance(segmentTarget, queryPoint);
};

/**
 * Computes the minimum distance between two line segments.
 * @param {StraightSegment} segAlpha - The first line segment.
 * @param {StraightSegment} segBeta - The second line segment.
 * @returns {number} The shortest distance between the two segments.
 */
const calculateMinSegmentDistance = (segAlpha, segBeta) => {
    // If segments intersect, their distance is zero.
    if (detectSegmentCollision(segAlpha, segBeta)) {
        return 0;
    }

    // Otherwise, the minimum distance is one of the four point-to-segment distances.
    const distA1 = getPointToSegmentDistance(segAlpha, segBeta.start);
    const distA2 = getPointToSegmentDistance(segAlpha, segBeta.end);
    const distB1 = getPointToSegmentDistance(segBeta, segAlpha.start);
    const distB2 = getPointToSegmentDistance(segBeta, segAlpha.end);

    return Math.min(distA1, distA2, distB1, distB2);
};

/**
 * Determines the intersection point of two line segments.
 * This function assumes the segments are known to intersect.
 * @param {StraightSegment} segmentX - The first segment.
 * @param {StraightSegment} segmentY - The second segment.
 * @returns {Vec2D | null} The intersection point if found within segments, otherwise null.
 */
const findSegmentIntersection = (segmentX, segmentY) => {
    const p1 = segmentX.start;
    const p2 = segmentX.end;
    const p3 = segmentY.start;
    const p4 = segmentY.end;

    const s1_x = p2.x - p1.x;
    const s1_y = p2.y - p1.y;
    const s2_x = p4.x - p3.x;
    const s2_y = p4.y - p3.y;

    const denominator = (-s2_x * s1_y + s1_x * s2_y);

    // If denominator is zero, lines are parallel or collinear.
    if (Math.abs(denominator) < EPSILON_FLOAT_COMP) {
        return null; // For simple intersection, we don't handle collinear overlap here.
    }

    const tParam = (s2_x * (p1.y - p3.y) - s2_y * (p1.x - p3.x)) / denominator;
    const uParam = (-s1_y * (p1.x - p3.x) + s1_x * (p1.y - p3.y)) / denominator;

    // If t and u are between 0 and 1, an intersection exists within both segments.
    if (tParam >= 0 && tParam <= 1 && uParam >= 0 && uParam <= 1) {
        const intersectX = p1.x + (tParam * s1_x);
        const intersectY = p1.y + (tParam * s1_y);
        return Vec2D.createFromCoords(intersectX, intersectY);
    }

    return null; // No intersection within the segments.
};


// --- Main Application Logic for Polygon Area Calculation ---

// Input reading utility.
const readAllInput = () => {
    try {
        return require('fs').readFileSync('/dev/stdin', 'utf8');
    } catch (e) {
        // Fallback for local testing if '/dev/stdin' is not available
        // For example, if running `node file.js < input.txt` on Windows or specific IDEs.
        // If 'input.txt' is expected for local debugging:
        // return require('fs').readFileSync('input.txt', 'utf8');
        throw new Error("Failed to read input from /dev/stdin. Ensure input is piped or available.");
    }
};

// Parses raw string input into an array of lines.
const tokenizeInputIntoLines = (rawString) => {
    const processedString = rawString.trim();
    if (!processedString) {
        throw new Error("Received empty input string.");
    }
    return processedString.split('\n');
};

// Extracts polygon vertices from the parsed input lines.
const extractPolygonVertices = (inputLines) => {
    const vertexCountStr = inputLines[0];
    const numberOfVertices = parseInt(vertexCountStr, 10);

    if (isNaN(numberOfVertices) || numberOfVertices < 3) {
        throw new Error(`Invalid number of vertices for a polygon: "${vertexCountStr}". Must be an integer >= 3.`);
    }
    if (inputLines.length < numberOfVertices + 1) {
        throw new Error(`Expected ${numberOfVertices} point definitions but only ${inputLines.length - 1} were provided.`);
    }

    const polygonVertexList = [];
    for (let i = 1; i <= numberOfVertices; ++i) {
        const coordinatePair = inputLines[i].split(" ").map(Number);
        if (coordinatePair.length !== 2 || isNaN(coordinatePair[0]) || isNaN(coordinatePair[1])) {
            throw new Error(`Malformed coordinate data on line ${i + 1}: "${inputLines[i]}". Expected two numbers.`);
        }
        polygonVertexList.push(Vec2D.createFromCoords(coordinatePair[0], coordinatePair[1]));
    }
    return polygonVertexList;
};

/**
 * Computes the area of a polygon given its ordered vertices using the Shoelace Formula.
 * @param {Vec2D[]} vertices - An array of Vec2D objects representing the polygon's vertices in order.
 * @returns {number} The absolute area of the polygon. Returns 0 for fewer than 3 vertices.
 */
const calculatePolygonSurfaceArea = (vertices) => {
    const numPoints = vertices.length;
    if (numPoints < 3) {
        return 0; // A polygon requires at least 3 vertices.
    }

    let sumOfCrossProducts = 0;

    // Sum (x_i * y_{i+1} - x_{i+1} * y_i) for i from 0 to n-1
    for (let i = 0; i < numPoints; ++i) {
        const currentVertex = vertices[i];
        const nextVertex = vertices[(i + 1) % numPoints]; // Wrap around to the first vertex for the last point.
        sumOfCrossProducts += calculateTwoDCrossProduct(currentVertex, nextVertex);
    }

    // The area is half the absolute value of this sum.
    return Math.abs(sumOfCrossProducts) / 2.0;
};

// Execute the main program logic.
try {
    const completeInputData = readAllInput();
    const parsedLines = tokenizeInputIntoLines(completeInputData);
    const polygonPoints = extractPolygonVertices(parsedLines);

    const computedArea = calculatePolygonSurfaceArea(polygonPoints);
    console.log(computedArea.toFixed(1)); // Output the area formatted to one decimal place.

} catch (executionError) {
    console.error("An error occurred during program execution:", executionError.message);
    // In a production environment, you might want to exit with a non-zero status code.
    // process.exit(1);
}