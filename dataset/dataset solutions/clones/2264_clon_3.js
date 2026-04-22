"use strict";

// This module provides utilities to parse input data from a text stream.
const DataStreamParser = (function() {
    /**
     * Creates a new instance of the input parser.
     * @param {string} sourceContent - The raw string content to parse.
     * @returns {InputReader} An object capable of reading values from the content.
     */
    function createReader(sourceContent) {
        return new InputReader(sourceContent);
    }

    /**
     * Manages reading and parsing lines from the source content.
     */
    function InputReader(sourceContent) {
        // Process the raw text: trim leading/trailing whitespace, then split into individual lines.
        this._lineBuffer = sourceContent.trim().split("\n");
        // Pointer to the current line being processed.
        this._currentLineIdx = 0;
    }

    /**
     * Extracts the next token from the current line. If the current line is exhausted,
     * it automatically advances to the next line. Tokens are processed in reverse
     * order of how they appear on the line, effectively popping from the "start"
     * of the original line after a reverse operation.
     * @param {boolean} returnAsString - If true, returns the token as a string; otherwise, attempts to convert to a number.
     * @returns {string|number|undefined} The extracted token, or undefined if no more tokens are available.
     */
    InputReader.prototype.extractNextToken = function(returnAsString) {
        // Check for end of input.
        if (this._currentLineIdx >= this._lineBuffer.length) {
            return undefined;
        }

        let currentLineTokens = this._lineBuffer[this._currentLineIdx];

        // If the current line hasn't been split into tokens yet, do so.
        if (typeof currentLineTokens === "string") {
            // Split the line into tokens using one or more whitespace characters as delimiters.
            // Then reverse the array so that `pop()` effectively reads from the start of the original line.
            this._lineBuffer[this._currentLineIdx] = currentLineTokens.split(/\s+/).reverse();
            currentLineTokens = this._lineBuffer[this._currentLineIdx];
        }

        // Extract the next token (which is the last element of the reversed array).
        const extractedToken = currentLineTokens.pop();

        // If the current line (token array) is now empty, increment the line pointer.
        if (!currentLineTokens.length) {
            this._currentLineIdx++;
        }

        // Return the token, converting to a number if requested.
        return returnAsString ? extractedToken : Number(extractedToken);
    };

    /**
     * Reads the entire next line, splits it into tokens, and returns them as an array.
     * The line pointer is advanced after reading.
     * @param {boolean} asStrings - If true, returns tokens as strings; otherwise, converts each token to a number.
     * @returns {Array<string|number>} An array of tokens from the next line. Returns an empty array if no more lines.
     */
    InputReader.prototype.fetchLineAsNumbers = function(asStrings) {
        // Ensure we don't attempt to read past the end of the buffer.
        if (this._currentLineIdx >= this._lineBuffer.length) {
            return []; // Return an empty array indicating no more lines.
        }
        const lineContent = this._lineBuffer[this._currentLineIdx++];
        const tokens = lineContent.split(/\s+/);
        return asStrings ? tokens : tokens.map(val => Number(val));
    };

    /**
     * Reads a contiguous block of 'count' lines, processing each line into an array of numbers.
     * This method is suitable for reading matrices or multiple rows of structured data.
     * The line pointer is advanced by 'count'.
     * @param {number} count - The number of lines to read for the block.
     * @param {boolean} asStrings - If true, returns tokens as strings; otherwise, converts to numbers.
     * @returns {Array<Array<string|number>>} A 2D array where each inner array represents a parsed line.
     */
    InputReader.prototype.getBlockOfNumbers = function(count, asStrings) {
        const startIndex = this._currentLineIdx;
        const endIndex = startIndex + count;

        // Extract the raw lines for the block.
        const rawLines = this._lineBuffer.slice(startIndex, endIndex);
        // Advance the internal line pointer past the block.
        this._currentLineIdx = endIndex;

        // Process each raw line: split into tokens and convert to numbers if needed.
        const processedBlock = rawLines.map(line => {
            const tokens = line.split(/\s+/);
            return asStrings ? tokens : tokens.map(val => Number(val));
        });
        return processedBlock;
    };

    /**
     * Reads a block of 'count' lines and returns them as-is (raw strings).
     * The line pointer is advanced by 'count'.
     * @param {number} count - The number of lines to read.
     * @returns {Array<string>} An array of raw line strings.
     */
    InputReader.prototype.readRawLines = function(count) {
        const startIndex = this._currentLineIdx;
        const endIndex = startIndex + count;
        const lines = this._lineBuffer.slice(startIndex, endIndex);
        this._currentLineIdx = endIndex;
        return lines;
    };

    return createReader;
})();

// Global variables, extensively renamed and using `let`/`const` for modern JavaScript.
const fileSystem = require("fs");
// Initialize the data stream parser by reading content from standard input.
const dataStream = DataStreamParser(fileSystem.readFileSync("/dev/stdin", "utf8"));

let candidateRadius = 0;       // Stores the radius of the currently evaluated enclosing circle.
let currentCenterX = 0;        // Stores the X-coordinate of the current candidate circle's center.
let currentCenterY = 0;        // Stores the Y-coordinate of the current candidate circle's center.
let allPoints = [];            // An array to hold all input coordinates, each as [x, y].
let numPoints = 0;             // The total count of points provided in the input.

// A small constant used for floating-point comparisons to handle precision issues.
// It creates a tiny buffer, effectively making `r < rr * epsilonTolerance` mean
// "r is strictly smaller than rr, even considering minor floating point errors."
const epsilonTolerance = 1 - 1e-9;

// The smallest radius found so far, initialized to a very large value.
let minEnclosingRadius = 1e9;

// This function is present in the original code but unused.
// It's a dynamic array creation utility using `eval`, which is generally discouraged due to security risks.
// It's renamed for consistency but its core logic remains untouched for functional similarity.
// WARNING: Using eval() can be a security risk and is generally discouraged.
function createMultiDimArray(initialValue) {
    const dimensions = arguments;
    let dimCount = dimensions.length;
    let arrayConstructionString = `Array(dimensions[${--dimCount}]).fill(0).map(element => { return ${initialValue}; })`;
    while (--dimCount) {
        arrayConstructionString = `Array(dimensions[${dimCount}]).fill(0).map(element => ${arrayConstructionString})`;
    }
    return eval(arrayConstructionString);
}


// The main entry point for the geometric calculation.
console.log(processGeometricData());

/**
 * Orchestrates the overall process of finding the minimum enclosing circle for a set of points.
 * It reads input, handles edge cases, and iterates through point combinations.
 * @returns {number} The radius of the minimum enclosing circle, or NaN if an error occurs.
 */
function processGeometricData() {
    numPoints = dataStream.extractNextToken(); // Read the total number of points.

    // --- Input Validation and Edge Cases ---
    if (isNaN(numPoints) || numPoints < 0) {
        console.error("Error: Invalid number of points provided. Must be a non-negative integer.");
        return NaN; // Indicate an error.
    }
    if (numPoints === 0) {
        return 0; // No points, the radius of the enclosing circle is 0.
    }
    if (numPoints === 1) {
        // A single point means a circle of radius 0 centered at that point.
        dataStream.getBlockOfNumbers(1); // Consume the point data.
        return 0;
    }

    allPoints = dataStream.getBlockOfNumbers(numPoints); // Read all point coordinates into a 2D array.

    // Handle the specific case of two points. The minimum enclosing circle
    // has these two points as the endpoints of its diameter.
    if (numPoints === 2) {
        return calculateRadiusForTwoPoints(allPoints);
    }

    // --- Main Logic: Iterate through combinations of three points ---
    // For three or more points, the minimum enclosing circle is either
    // defined by two points (as a diameter) or by three points (as a circumcircle).
    // The algorithm checks all unique triplets of points.
    for (let i = 0; i < numPoints; i++) {
        for (let j = i + 1; j < numPoints; j++) {
            for (let k = j + 1; k < numPoints; k++) {
                const p1 = allPoints[i];
                const p2 = allPoints[j];
                const p3 = allPoints[k];

                // Attempt to compute a circle defined by these three points.
                // This function updates `candidateRadius`, `currentCenterX`, `currentCenterY` globally.
                if (computeCircumcircle(p1[0], p1[1], p2[0], p2[1], p3[0], p3[1])) {
                    // If a circle was successfully computed, verify if it encloses ALL points
                    // and if it yields a smaller radius than the current minimum.
                    // This function updates `minEnclosingRadius` if a better circle is found.
                    checkAndRefineResult();
                }
            }
        }
    }

    // After checking all triplets, `minEnclosingRadius` holds the result.
    return minEnclosingRadius;
}

/**
 * Calculates the circumcircle (or the smallest enclosing circle for collinear points)
 * for three given points. It updates the global variables `candidateRadius`,
 * `currentCenterX`, and `currentCenterY` with the properties of the computed circle.
 * @param {number} p1x - X-coordinate of the first point.
 * @param {number} p1y - Y-coordinate of the first point.
 * @param {number} p2x - X-coordinate of the second point.
 * @param {number} p2y - Y-coordinate of the second point.
 * @param {number} p3x - X-coordinate of the third point.
 * @param {number} p3y - Y-coordinate of the third point.
 * @returns {boolean} True if a valid circle was successfully computed, false otherwise.
 */
function computeCircumcircle(p1x, p1y, p2x, p2y, p3x, p3y) {
    // Vectors representing the sides of the triangle formed by the points.
    const deltaX12 = p1x - p2x; // (x1 - x2)
    const deltaY12 = p1y - p2y; // (y1 - y2)
    const deltaX23 = p2x - p3x; // (x2 - x3)
    const deltaY23 = p2y - p3y; // (y2 - y3)

    // The determinant term in the denominator of the circumcenter formula: 2 * (AD - BC).
    // If this term is zero (or very close to zero), the points are collinear or identical.
    const determinantTerm = 2 * (deltaX12 * deltaY23 - deltaY12 * deltaX23);

    // --- Handle Collinear or Degenerate Points ---
    // Use a small epsilon for floating-point comparison to zero.
    if (Math.abs(determinantTerm) < 1e-9) {
        // Points are collinear or nearly collinear. The minimum enclosing circle
        // is defined by the two points among the three that are farthest apart.
        const deltaX13 = p3x - p1x;
        const deltaY13 = p3y - p1y;

        // Calculate squared distances between all pairs of points.
        const distSq12 = deltaX12 * deltaX12 + deltaY12 * deltaY12;
        const distSq23 = deltaX23 * deltaX23 + deltaY23 * deltaY23;
        const distSq13 = deltaX13 * deltaX13 + deltaY13 * deltaY13;

        // Find the maximum squared distance to determine the diameter.
        const maxDistSq = Math.max(distSq12, distSq23, distSq13);
        candidateRadius = Math.sqrt(maxDistSq) / 2;

        // Determine which pair forms the diameter and calculate the midpoint as the center.
        if (distSq12 === maxDistSq) {
            currentCenterX = (p1x + p2x) / 2;
            currentCenterY = (p1y + p2y) / 2;
        } else if (distSq23 === maxDistSq) {
            currentCenterX = (p3x + p2x) / 2;
            currentCenterY = (p3y + p2y) / 2;
        } else { // distSq13 === maxDistSq
            currentCenterX = (p1x + p3x) / 2;
            currentCenterY = (p1y + p3y) / 2;
        }
        return true; // Circle successfully computed for collinear points.
    }

    // --- Handle Non-Collinear Points (General Case) ---
    // Calculate the squared magnitudes (distance from origin) for each point.
    const magSqP1 = p1x * p1x + p1y * p1y;
    const magSqP2 = p2x * p2x + p2y * p2y;
    const magSqP3 = p3x * p3x + p3y * p3y;

    // Pre-calculate the inverse of the determinant for efficiency.
    const inverseDeterminant = 1 / determinantTerm;

    // Apply the circumcenter formulas.
    // Cx = ( (y2-y3)(P1^2 - P2^2) - (y1-y2)(P2^2 - P3^2) ) / (2 * ( (x1-x2)(y2-y3) - (y1-y2)(x2-x3) ))
    // Cy = ( (x1-x2)(P2^2 - P3^2) - (x2-x3)(P1^2 - P2^2) ) / (2 * ( (x1-x2)(y2-y3) - (y1-y2)(x2-x3) ))
    currentCenterX = inverseDeterminant * (deltaY23 * (magSqP1 - magSqP2) - deltaY12 * (magSqP2 - magSqP3));
    currentCenterY = inverseDeterminant * (deltaX12 * (magSqP2 - magSqP3) - deltaX23 * (magSqP1 - magSqP2));

    // Calculate the radius as the distance from the computed center to any of the three points.
    const diffXFromP1 = p1x - currentCenterX;
    const diffYFromP1 = p1y - currentCenterY;
    candidateRadius = Math.hypot(diffXFromP1, diffYFromP1); // More robust than Math.sqrt(dx*dx + dy*dy)

    return true; // Circle successfully computed for non-collinear points.
}

/**
 * Verifies if the globally stored `candidateRadius`, `currentCenterX`, and `currentCenterY`
 * define an enclosing circle that covers all `allPoints`. If it does, and this circle
 * is smaller than `minEnclosingRadius`, then `minEnclosingRadius` is updated.
 * This function modifies `minEnclosingRadius` as a side effect.
 * @returns {boolean} True if the current candidate circle is a valid enclosing circle
 *                    and potentially updated the minimum, false otherwise.
 */
function checkAndRefineResult() {
    // Early exit: If the current candidate radius is already greater than or equal to
    // the best radius found so far, there's no need to check all points.
    if (candidateRadius >= minEnclosingRadius) {
        return false;
    }

    // Iterate through all input points to ensure they are all contained within
    // the candidate circle, considering the `epsilonTolerance` for precision.
    for (let i = 0; i < numPoints; i++) {
        const pointX = allPoints[i][0];
        const pointY = allPoints[i][1];

        const pointDistX = pointX - currentCenterX;
        const pointDistY = pointY - currentCenterY;

        // Calculate the distance from the candidate center to the current point.
        const distanceToPoint = Math.hypot(pointDistX, pointDistY);

        // If the candidate radius is smaller than the distance to the point
        // (adjusted by tolerance), then this point is outside the circle.
        if (candidateRadius < distanceToPoint * epsilonTolerance) {
            return false; // This candidate circle does not enclose all points.
        }
    }

    // If the loop completes, all points are enclosed by this candidate circle.
    // Since we already checked `candidateRadius >= minEnclosingRadius` at the start,
    // this means the current candidate is strictly smaller. Update the minimum.
    minEnclosingRadius = candidateRadius;
    return true;
}

/**
 * Calculates the radius of the minimum enclosing circle for exactly two points.
 * This circle has the two points as the endpoints of its diameter.
 * @param {Array<Array<number>>} twoPointsArray - An array containing two [x, y] coordinate pairs.
 * @returns {number} The radius of the enclosing circle, or NaN if input is invalid.
 */
function calculateRadiusForTwoPoints(twoPointsArray) {
    // Input validation: ensure exactly two points are provided.
    if (!Array.isArray(twoPointsArray) || twoPointsArray.length !== 2 ||
        !Array.isArray(twoPointsArray[0]) || twoPointsArray[0].length !== 2 ||
        !Array.isArray(twoPointsArray[1]) || twoPointsArray[1].length !== 2) {
        console.error("Error: calculateRadiusForTwoPoints expects an array containing exactly two [x, y] point arrays.");
        return NaN;
    }

    const pointA = twoPointsArray[0];
    const pointB = twoPointsArray[1];

    const deltaX = pointA[0] - pointB[0];
    const deltaY = pointA[1] - pointB[1];

    // The distance between the two points represents the diameter of the circle.
    const diameter = Math.hypot(deltaX, deltaY); // Calculates sqrt(deltaX^2 + deltaY^2)
    return diameter / 2; // The radius is half the diameter.
}