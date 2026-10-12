class HullConstructor {

    constructor() {
        this.storedPoints = [];
    }

    // Determines the orientation of the ordered triplet (p, q, r).
    // Returns a positive value if p-q-r is a clockwise turn (right turn).
    // Returns a negative value if p-q-r is a counter-clockwise turn (left turn).
    // Returns zero if p-q-r are collinear.
    static getTurnDirection(p, q, r) {
        return (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
    }

    // Computes the convex hull for the given array of points.
    generateHull(pointsData) {
        this.storedPoints = pointsData;
        return this.constructConvexBoundary();
    }

    // Implements the Monotone Chain (Andrew's) algorithm to find the convex hull.
    constructConvexBoundary() {
        const totalPointCount = this.storedPoints.length;

        if (totalPointCount === 0) return [];
        if (totalPointCount === 1) return [this.storedPoints[0], this.storedPoints[0]];
        // For 2 points, the Monotone Chain logic below will naturally produce
        // [P1, P2, P2, P1] if P1 is lexicographically before P2, matching original.

        // Sort points lexicographically (by x-coordinate, then by y-coordinate for ties).
        const orderedPoints = [...this.storedPoints].sort((a, b) => {
            if (a.x !== b.x) return a.x - b.x;
            return a.y - b.y;
        });

        const lowerBoundary = [];
        // Build the lower hull.
        for (let i = 0; i < totalPointCount; i++) {
            // While there are at least two points in the lower hull and the last turn is a right turn (clockwise),
            // pop the last point to maintain a left turn (counter-clockwise) sequence.
            // Using `> 0` allows collinear points to be part of the hull, matching original behavior.
            while (lowerBoundary.length >= 2 && HullConstructor.getTurnDirection(lowerBoundary[lowerBoundary.length - 2], lowerBoundary[lowerBoundary.length - 1], orderedPoints[i]) > 0) {
                lowerBoundary.pop();
            }
            lowerBoundary.push(orderedPoints[i]);
        }

        const upperBoundary = [];
        // Build the upper hull by iterating points in reverse.
        for (let i = totalPointCount - 1; i >= 0; i--) {
            // Similar logic: pop if it's a right turn (clockwise) to maintain a left turn sequence
            // when traversing from right to left.
            while (upperBoundary.length >= 2 && HullConstructor.getTurnDirection(upperBoundary[upperBoundary.length - 2], upperBoundary[upperBoundary.length - 1], orderedPoints[i]) > 0) {
                upperBoundary.pop();
            }
            upperBoundary.push(orderedPoints[i]);
        }

        // Combine the lower and upper hulls.
        // The original algorithm duplicates the leftmost and rightmost points.
        // `lowerBoundary` is [P_left, ..., P_right].
        // `upperBoundary` is [P_right, ..., P_left].
        // Concatenating them directly results in [P_left, ..., P_right, P_right, ..., P_left],
        // which precisely matches the original's output structure.
        return lowerBoundary.concat(upperBoundary);
    }
}

// Main function to process input and calculate the result.
function processInputAndCalculate(rawData) {
    let dataLines = rawData.split("\n");

    let totalPointsInput = Number(dataLines[0]);
    let coordinateList = [];

    for (let j = 1; j <= totalPointsInput; j++) {
        let lineParts = dataLines[j].split(" ");
        coordinateList.push({ x: Number(lineParts[0]), y: Number(lineParts[1]) });
    }

    let hullProcessor = new HullConstructor();
    let hullPoints = hullProcessor.generateHull(coordinateList);

    let maximumDistance = 0;

    for (let pIdx1 = 0; pIdx1 < hullPoints.length; pIdx1++) {
        for (let pIdx2 = pIdx1 + 1; pIdx2 < hullPoints.length; pIdx2++) {
            let currentManhattanDistance =
                Math.abs(hullPoints[pIdx1].x - hullPoints[pIdx2].x) +
                Math.abs(hullPoints[pIdx1].y - hullPoints[pIdx2].y);
            maximumDistance = Math.max(maximumDistance, currentManhattanDistance);
        }
    }

    console.log(maximumDistance);
}

processInputAndCalculate(require("fs").readFileSync("/dev/stdin", "utf8"));
