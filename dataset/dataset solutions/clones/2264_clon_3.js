"use strict";

// Helper for parsing arrays of strings to numbers
const parseNumbers = (stringArray) => stringArray.map(val => +val);

// Input parsing utility, refactored into a class-based structure
const InputParser = (function () {
    class ParserInstance {
        constructor(sourceString) {
            this.sourceLines = sourceString.trim().split("\n");
            this.currentLineIndex = 0;
        }

        // Reads the next space-separated value from the current line.
        // If the line is exhausted, it moves to the next.
        readNextValue(returnAsString = false) {
            let currentLineData = this.sourceLines[this.currentLineIndex];
            let extractedValue;

            // If the current line hasn't been processed (split and reversed) yet, do it.
            if (typeof currentLineData === "string") {
                this.sourceLines[this.currentLineIndex] = currentLineData.split(" ").reverse();
            }
            
            extractedValue = this.sourceLines[this.currentLineIndex].pop();

            // If the current line is now empty, advance to the next line.
            if (!this.sourceLines[this.currentLineIndex].length) {
                this.currentLineIndex++;
            }
            return returnAsString ? extractedValue : +extractedValue;
        }

        // Reads all space-separated values from the current line.
        // Advances to the next line.
        readLineValues(returnAsString = false) {
            const lineContent = this.sourceLines[this.currentLineIndex++];
            const values = lineContent.split(" ");
            return returnAsString ? values : parseNumbers(values);
        }

        // Reads a block of 'numRows' lines, splitting each into values.
        // Advances the line index by 'numRows'.
        readMatrix(numRows, returnAsString = false) {
            const startIdx = this.currentLineIndex;
            const endIdx = startIdx + numRows;
            this.currentLineIndex = endIdx; // Advance index immediately

            const rawRows = this.sourceLines.slice(startIdx, endIdx);
            return returnAsString ? rawRows.map(row => row.split(" ")) : rawRows.map(row => parseNumbers(row.split(" ")));
        }

        // Reads a block of 'numLines' lines, treating each line as a single value.
        // Advances the line index by 'numLines'.
        readLinesAsNumbers(numLines, returnAsString = false) {
            const startIdx = this.currentLineIndex;
            const endIdx = startIdx + numLines;
            this.currentLineIndex = endIdx; // Advance index immediately

            const rawLines = this.sourceLines.slice(startIdx, endIdx);
            return returnAsString ? rawLines : parseNumbers(rawLines);
        }
    }

    // Factory function to create a ParserInstance
    return function createInputParser(sourceString) {
        return new ParserInstance(sourceString);
    };
})();

// Global variables to store the properties of the current candidate circle
let currentRadius;
let centerX;
let centerY;

// Input data storage
let points;        // Array of [x, y] coordinates
let numPoints;     // Total number of points

// Constants and global minimum radius
const EPSILON_FACTOR = 1 - 1e-9; // Used for floating-point comparisons
let minEnclosingRadius = 1e9;     // Stores the smallest radius found so far

// Helper function to calculate squared Euclidean distance between two points
const getSquaredDistance = (x1, y1, x2, y2) => {
    const deltaX = x1 - x2;
    const deltaY = y1 - y2;
    return deltaX * deltaX + deltaY * deltaY;
};

// Initialize input reader and execute the main calculation
const inputReader = InputParser(require("fs").readFileSync("/dev/stdin", "utf8"));
console.log(calculateMinCircle());

// Main function to determine the minimum enclosing circle radius
function calculateMinCircle() {
    numPoints = inputReader.readNextValue();
    points = inputReader.readMatrix(numPoints);

    // Special case for two points: the circle is centered on their midpoint with half their distance as radius
    if (numPoints === 2) {
        return solveTwoPoints(points);
    }

    // Iterate through all combinations of three points to find potential circumcircles
    for (let i = 0; i < numPoints; i++) {
        for (let j = i + 1; j < numPoints; j++) {
            for (let k = j + 1; k < numPoints; k++) {
                const p1 = points[i];
                const p2 = points[j];
                const p3 = points[k];
                
                // If a valid circumcircle is found for these three points,
                // and it encloses all other points, update the minimum radius.
                if (findCircumcircle(p1[0], p1[1], p2[0], p2[1], p3[0], p3[1])) {
                    minEnclosingRadius = currentRadius;
                }
            }
        }
    }
    return minEnclosingRadius;
}

// Determines the circumcircle (or smallest enclosing circle for collinear points)
// for three given points (x1,y1), (x2,y2), (x3,y3).
// Sets global currentRadius, centerX, centerY.
// Returns true if this circle encloses all points, false otherwise.
function findCircumcircle(x1, y1, x2, y2, x3, y3) {
    const diffX12 = x1 - x2;
    const diffY12 = y1 - y2;
    const diffX23 = x2 - x3;
    const diffY23 = y2 - y3;

    // Calculate determinant for circumcenter formula
    const determinant = 2 * (diffX12 * diffY23 - diffY12 * diffX23);

    if (determinant === 0) { // Points are collinear
        const sqDist12 = getSquaredDistance(x1, y1, x2, y2);
        const sqDist23 = getSquaredDistance(x2, y2, x3, y3);
        const sqDist13 = getSquaredDistance(x1, y1, x3, y3);

        const maxSquaredDistance = Math.max(sqDist12, sqDist23, sqDist13);
        currentRadius = Math.sqrt(maxSquaredDistance) / 2;

        // Center is the midpoint of the longest segment
        if (sqDist12 === maxSquaredDistance) {
            centerX = (x1 + x2) / 2;
            centerY = (y1 + y2) / 2;
        } else if (sqDist23 === maxSquaredDistance) {
            centerX = (x2 + x3) / 2;
            centerY = (y2 + y3) / 2;
        } else { // sqDist13 === maxSquaredDistance
            centerX = (x1 + x3) / 2;
            centerY = (y1 + y3) / 2;
        }
        return checkAllPointsWithinCircle();
    }

    // Points are not collinear, calculate circumcenter using standard formula
    const sqDistOrigin1 = x1 * x1 + y1 * y1;
    const sqDistOrigin2 = x2 * x2 + y2 * y2;
    const sqDistOrigin3 = x3 * x3 + y3 * y3;

    const invDeterminant = 1 / determinant;
    centerX = invDeterminant * (diffY23 * (sqDistOrigin1 - sqDistOrigin2) - diffY12 * (sqDistOrigin2 - sqDistOrigin3));
    centerY = invDeterminant * (diffX12 * (sqDistOrigin2 - sqDistOrigin3) - diffX23 * (sqDistOrigin1 - sqDistOrigin2));

    // Radius is the distance from the center to any of the three points
    currentRadius = Math.hypot(x1 - centerX, y1 - centerY);
    return checkAllPointsWithinCircle();
}

// Checks if all 'numPoints' are contained within the globally defined circle (centerX, centerY, currentRadius).
// Returns true if all points are inside or on the boundary, false otherwise.
function checkAllPointsWithinCircle() {
    // Optimization: If the current circle is already larger than the best found,
    // it cannot be the minimum enclosing circle, so skip further checks.
    if (minEnclosingRadius < currentRadius) {
        return false;
    }

    // Pre-calculate squared radius and effective squared radius for efficiency
    // The epsilon factor accounts for floating-point inaccuracies.
    const currentRadiusSquared = currentRadius * currentRadius;
    const effectiveSquaredRadius = currentRadiusSquared * EPSILON_FACTOR * EPSILON_FACTOR;

    for (let i = 0; i < numPoints; i++) {
        const pointX = points[i][0];
        const pointY = points[i][1];
        
        const distSquaredFromCenter = getSquaredDistance(pointX, pointY, centerX, centerY);

        // If any point is outside the current circle (considering epsilon),
        // this circle is not a valid enclosing circle.
        if (effectiveSquaredRadius < distSquaredFromCenter) {
            return false;
        }
    }
    return true; // All points are within this circle
}

// Special handler for the case of exactly two points.
// The minimum enclosing circle is centered at their midpoint with half their distance as radius.
function solveTwoPoints(twoPoints) {
    const p1 = twoPoints[0];
    const p2 = twoPoints[1];
    return Math.hypot(p1[0] - p2[0], p1[1] - p2[1]) / 2;
}
