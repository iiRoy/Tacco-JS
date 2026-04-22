// This module provides functionality for computing the convex hull of a set of 2D points.
// Based on principles for finding the convex hull boundary.
// Original source inspiration: https://qiita.com/gushwell/items/2dfde9e736884461b090

/**
 * Represents a 2D point with X and Y coordinates.
 */
class Vertex2D {
    constructor(xCoord, yCoord) {
        if (typeof xCoord !== 'number' || typeof yCoord !== 'number' || isNaN(xCoord) || isNaN(yCoord)) {
            throw new Error("Vertex2D coordinates must be valid numbers.");
        }
        this.x = xCoord;
        this.y = yCoord;
    }

    /**
     * Checks if this vertex is equal to another vertex based on X and Y coordinates.
     * @param {Vertex2D} otherVertex - The other vertex to compare.
     * @returns {boolean} True if coordinates match, false otherwise.
     */
    isEqual(otherVertex) {
        return this.x === otherVertex.x && this.y === otherVertex.y;
    }
}

/**
 * A class responsible for processing a collection of 2D points
 * to determine their convex hull boundary.
 */
class ConvexHullProcessor {

    // Initializes the processor with an empty list of coordinates.
    constructor() {
        this.inputCoordinates = [];
    }

    /**
     * Sets the input coordinates and triggers the convex hull computation.
     * Performs initial validation on the input array.
     * @param {Array<Vertex2D | {x: number, y: number}>} coordinateList - An array of Vertex2D objects or compatible plain objects.
     * @returns {Array<Vertex2D>} An ordered list of vertices forming the convex hull boundary.
     * @throws {Error} If input is invalid or insufficient.
     */
    processCoordinates(coordinateList) {
        if (!Array.isArray(coordinateList) || coordinateList.length < 1) {
            throw new Error("Input coordinate list must be an array with at least one point.");
        }
        
        // Ensure all elements are Vertex2D instances.
        this.inputCoordinates = coordinateList.map(pt => {
            if (!(pt instanceof Vertex2D)) {
                // Attempt to convert if it's a plain object with x,y
                if (typeof pt === 'object' && pt !== null && typeof pt.x === 'number' && typeof pt.y === 'number') {
                    return new Vertex2D(pt.x, pt.y);
                }
                throw new Error("All items in coordinateList must be Vertex2D objects or compatible plain objects.");
            }
            return pt;
        });

        // Handle trivial cases for convex hull.
        if (this.inputCoordinates.length <= 2) {
            return [...this.inputCoordinates]; // Return a shallow copy.
        }

        return this.computeConvexBoundary();
    }

    /**
     * Determines the vertices that form the convex boundary of the input points.
     * This method applies a variant of the Monotone Chain algorithm by finding
     * left/right extremes and then constructing upper and lower hulls.
     * @private
     * @returns {Array<Vertex2D>} An ordered array of Vertex2D objects representing the convex hull.
     */
    computeConvexBoundary() {
        if (this.inputCoordinates.length < 2) {
            // This should ideally be caught by processCoordinates, but good for internal robustness.
            return [];
        }

        // Find the points with minimum and maximum X coordinates.
        // If multiple points share the min/max X, `find` returns the first encountered.
        const minXCoordValue = Math.min(...this.inputCoordinates.map(ptObj => ptObj.x));
        const leftmostVertex = this.inputCoordinates.find(currPt => currPt.x === minXCoordValue);

        const maxXCoordValue = Math.max(...this.inputCoordinates.map(ptObj => ptObj.x));
        const rightmostVertex = this.inputCoordinates.find(currPt => currPt.x === maxXCoordValue);

        // Calculate the lower segment of the convex hull.
        // This involves finding points that maximize the slope from the current point.
        const lowerHullVertices = this._determineHalfHull(leftmostVertex, rightmostVertex, (current, candidates) => {
            let maxSlope = -Infinity;
            // Iterate through all candidate points to find the maximum slope relative to 'current'.
            for (const p of candidates) {
                const slope = ConvexHullProcessor._calculateSlope(current, p);
                if (slope > maxSlope) {
                    maxSlope = slope;
                }
            }
            return maxSlope;
        });

        // Calculate the upper segment of the convex hull.
        // This involves finding points that minimize the slope from the current point.
        const upperHullVertices = this._determineHalfHull(leftmostVertex, rightmostVertex, (current, candidates) => {
            let minSlope = Infinity;
            // Iterate through all candidate points to find the minimum slope relative to 'current'.
            for (const p of candidates) {
                const slope = ConvexHullProcessor._calculateSlope(current, p);
                if (slope < minSlope) {
                    minSlope = slope;
                }
            }
            return minSlope;
        });

        // Combine the lower and upper hulls.
        // The upper hull needs to be reversed to maintain a consistent traversal order (e.g., counter-clockwise).
        // `toReversed()` is used for a non-destructive reversal (ES2023).
        // `slice(1, -1)` removes the first (rightmost) and last (leftmost) elements from the reversed upper hull
        // to prevent duplicate vertices when concatenating, as these points are already in the lower hull.
        const combinedHull = lowerHullVertices.concat(upperHullVertices.toReversed().slice(1, -1));
        return combinedHull;
    }

    /**
     * Computes the slope (gradient) between two given 2D points.
     * Handles vertical lines by returning Infinity/-Infinity.
     * For identical points, returns NaN.
     * @private
     * @static
     * @param {Vertex2D} pointOne - The first point.
     * @param {Vertex2D} pointTwo - The second point.
     * @returns {number} The slope between the two points.
     */
    static _calculateSlope(pointOne, pointTwo) {
        const deltaX = pointTwo.x - pointOne.x;
        const deltaY = pointTwo.y - pointOne.y;

        if (deltaX === 0) {
            if (deltaY === 0) {
                return NaN; // Identical points, slope is undefined
            }
            return deltaY > 0 ? Infinity : -Infinity; // Vertical line
        }
        return deltaY / deltaX;
    }

    /**
     * Iteratively determines one half of the convex hull (either the upper or lower segment)
     * between a starting and an ending point by selecting points with characteristic slopes.
     * @private
     * @param {Vertex2D} currentPoint - The starting point for this segment.
     * @param {Vertex2D} targetPoint - The ending point for this segment.
     * @param {Function} slopeEvaluatorFunction - A callback to determine the characteristic slope (max for lower, min for upper).
     * @returns {Array<Vertex2D>} An array of Vertex2D objects forming the half-hull segment.
     */
    _determineHalfHull(currentPoint, targetPoint, slopeEvaluatorFunction) {
        const partialHullSegment = [currentPoint];
        let traversalPoint = currentPoint;
        let iterationCount = 0;
        const maxIterations = this.inputCoordinates.length * 2; // Safety break for degenerate cases or errors

        while (!traversalPoint.isEqual(targetPoint)) {
            iterationCount++;
            if (iterationCount > maxIterations) {
                // This warning indicates a potential issue in the algorithm or degenerate input leading to an infinite loop.
                console.warn("Max iterations reached in _determineHalfHull. Possible infinite loop or degenerate data.");
                break; // Exit to prevent browser freeze.
            }

            // Filter points that are strictly to the "right" (greater X) of the current traversal point.
            // This narrows down the search space for the next hull vertex.
            let potentialNextPoints = this.inputCoordinates.filter(pt => pt.x > traversalPoint.x);

            // If the targetPoint's X coordinate is greater than or equal to the current traversalPoint's X,
            // and it hasn't been included in potentialNextPoints, add it as a candidate.
            // This ensures the rightmost point is always considered as a candidate to terminate the hull segment.
            if (targetPoint.x >= traversalPoint.x && !potentialNextPoints.some(p => p.isEqual(targetPoint))) {
                potentialNextPoints.push(targetPoint);
            }
            
            if (potentialNextPoints.length === 0) {
                // If no points to the right and target is not considered, it means traversalPoint
                // must be the rightmost point in the set, and targetPoint is not reachable or is identical.
                // If we haven't reached the target, it means the target must be the next point.
                if (!traversalPoint.isEqual(targetPoint)) {
                    partialHullSegment.push(targetPoint);
                    traversalPoint = targetPoint;
                }
                break; 
            }

            // Determine the characteristic slope (max for lower hull, min for upper hull) among potential next points.
            const characteristicSlope = slopeEvaluatorFunction(traversalPoint, potentialNextPoints);

            // Find the point that yields this characteristic slope.
            // If multiple points have the same characteristic slope, `find` returns the first match.
            // This behavior is consistent with the original algorithm's implicit handling of collinear points.
            const nextCandidateVertex = potentialNextPoints.find(pt =>
                ConvexHullProcessor._calculateSlope(traversalPoint, pt) === characteristicSlope
            );

            if (nextCandidateVertex === undefined) {
                // This scenario indicates a logical error or a highly degenerate input set
                // where no point matches the determined characteristic slope.
                console.warn("Could not find next hull vertex matching characteristic slope. Breaking loop.");
                break;
            }

            partialHullSegment.push(nextCandidateVertex);
            traversalPoint = nextCandidateVertex;
        }
        return partialHullSegment;
    }
}

/**
 * Calculates the Manhattan (L1) distance between two 2D points.
 * @param {Vertex2D} pA - The first point.
 * @param {Vertex2D} pB - The second point.
 * @returns {number} The Manhattan distance.
 */
function calculateManhattanDistance(pA, pB) {
    return Math.abs(pA.x - pB.x) + Math.abs(pA.y - pB.y);
}


/**
 * Main entry point for processing input and calculating the maximum Manhattan distance
 * between any two vertices on the convex hull.
 * This function reads point data from a string, computes the convex hull,
 * and then finds the greatest Manhattan distance between any pair of hull vertices.
 * @param {string} rawInputString - The raw input string containing point data,
 *                                  with the first line being the count of points,
 *                                  followed by lines of "x y" coordinates.
 */
function executeProcessing(rawInputString) {
    const inputLines = rawInputString.trim().split("\n"); // Trim to avoid issues with trailing newline.

    const numVertices = Number(inputLines[0]);
    if (isNaN(numVertices) || numVertices < 0) {
        console.error("Error: Invalid number of vertices provided. Must be a non-negative integer.");
        return;
    }

    const parsedVertices = [];
    // Start parsing from index 1 as index 0 contains the count.
    for (let i = 1; i <= numVertices; i++) {
        if (!inputLines[i]) {
            console.error(`Error: Missing data for vertex ${i}. Expected ${numVertices} lines.`);
            return;
        }
        const coordComponents = inputLines[i].split(" ").map(Number);
        if (coordComponents.length !== 2 || isNaN(coordComponents[0]) || isNaN(coordComponents[1])) {
            console.error(`Error: Invalid coordinates for vertex ${i}: "${inputLines[i]}". Expected two numbers.`);
            return;
        }
        parsedVertices.push(new Vertex2D(coordComponents[0], coordComponents[1]));
    }

    // Initialize the convex hull processor and compute the boundary points.
    const hullProcessor = new ConvexHullProcessor();
    let convexBoundaryVertices;
    try {
        convexBoundaryVertices = hullProcessor.processCoordinates(parsedVertices);
    } catch (error) {
        console.error("Error during convex hull processing:", error.message);
        return;
    }
    
    // If the convex hull has fewer than two points, the maximum distance is 0.
    if (convexBoundaryVertices.length < 2) {
        console.log(0);
        return;
    }

    let greatestManhattanDistance = 0;

    // Iterate through all unique pairs of points on the convex boundary
    // to find the maximum Manhattan distance.
    for (let idxA = 0; idxA < convexBoundaryVertices.length; idxA++) {
        for (let idxB = idxA + 1; idxB < convexBoundaryVertices.length; idxB++) {
            const currentPairDistance = calculateManhattanDistance(
                convexBoundaryVertices[idxA],
                convexBoundaryVertices[idxB]
            );
            greatestManhattanDistance = Math.max(greatestManhattanDistance, currentPairDistance);
        }
    }
    
    console.log(greatestManhattanDistance);
}

// Execute the main function with input read from stdin.
// This block is typically used in competitive programming environments.
executeProcessing(require("fs").readFileSync("/dev/stdin", "utf8"));