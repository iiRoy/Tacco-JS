class ShapeProcessor {

    // Initializes a new instance of the ShapeProcessor.
    constructor() {
        this.coordinates = []; // Stores the collection of points for processing.
    }

    // Accepts an array of points and initiates the convex hull computation.
    processPoints(inputCoords) {
        this.coordinates = inputCoords; // Assign the provided points to the instance.
        return this.getHullVertices();  // Return the calculated convex hull vertices.
    }

    // Determines the set of points that form the convex hull of the stored coordinates.
    getHullVertices() {
        // Find the minimum X-coordinate among all available points.
        const minXCoord = Math.min(...this.coordinates.map(coord => coord.x));
        // Locate the point with the smallest X-coordinate (leftmost point).
        const leftmostPoint = this.coordinates.find(pt => pt.x === minXCoord);

        // Find the maximum X-coordinate among all available points.
        const maxXCoord = Math.max(...this.coordinates.map(coord => coord.x));
        // Locate the point with the largest X-coordinate (rightmost point).
        const rightmostPoint = this.coordinates.find(pt => pt.x === maxXCoord);

        // Compute the lower segment of the convex hull.
        // This involves finding points that maximize the slope from the current point.
        const lowerHull = this._getHullHalf(leftmostPoint, rightmostPoint, (current, sequence) => {
            return Math.max(...sequence.map(pt => ShapeProcessor._calculateSlope(current, pt)));
        });

        // Compute the upper segment of the convex hull.
        // This involves finding points that minimize the slope from the current point.
        const upperHull = this._getHullHalf(leftmostPoint, rightmostPoint, (current, sequence) => {
            return Math.min(...sequence.map(pt => ShapeProcessor._calculateSlope(current, pt)));
        });

        // Combine the lower and upper hulls. The upper hull is reversed to maintain proper order.
        // Using .slice() before .reverse() ensures the original array is not modified.
        return lowerHull.concat(upperHull.slice().reverse());
    }

    // Static helper method to compute the slope between two given points.
    static _calculateSlope(point1, point2) {
        // The slope is calculated as (change in Y) / (change in X).
        return (point2.y - point1.y) / (point2.x - point1.x);
    }

    // Helper method to construct one half (either upper or lower) of the convex hull.
    _getHullHalf(currentPoint, endPoint, slopeFunction) {
        let hullSegment = [currentPoint]; // Initialize the segment with the starting point.

        // Continue adding points until the current point reaches the designated end point.
        while (currentPoint.x !== endPoint.x || currentPoint.y !== endPoint.y) {
            // Filter the available points to only consider those to the right of the current point.
            const subsequentPoints = this.coordinates.filter(pt => pt.x > currentPoint.x);

            // Find the next point in the hull segment. This point is determined by the
            // maximum or minimum slope (as defined by `slopeFunction`) relative to the current point.
            const nextPointInHull = subsequentPoints.find(pt =>
                ShapeProcessor._calculateSlope(currentPoint, pt) === slopeFunction(currentPoint, subsequentPoints)
            );

            hullSegment.push(nextPointInHull); // Add the identified next point to the segment.
            currentPoint = nextPointInHull;    // Advance the current point to the newly found point.

            // A safety check to prevent infinite loops in case a next point cannot be found.
            if (currentPoint === undefined) {
                break;
            }
        }
        return hullSegment; // Return the completed hull segment.
    }
}

// The main function responsible for reading input, performing calculations, and outputting results.
function ProcessInputData(rawData) {
    // Split the raw input string into an array of lines based on newline characters.
    rawData = rawData.split("\n");

    // Parse the first line to determine the total number of points.
    const numPoints = Number(rawData[0]);
    const inputPoints = []; // An array to store the parsed point objects.

    // Iterate through the input lines, starting from the second line, to parse each point.
    for (let k = 1; k <= numPoints; k++) {
        const parsedLine = rawData[k].split(" "); // Split each line by space to get X and Y coordinates.
        // Create a point object with numeric X and Y values and add it to the array.
        inputPoints.push({ x: Number(parsedLine[0]), y: Number(parsedLine[1]) });
        // Original debug line, commented out as per Type II rules.
        // console.log(inputPoints[k - 1].x);
    }

    // Create an instance of the ShapeProcessor to perform geometric computations.
    const processorInstance = new ShapeProcessor();
    // Compute the convex hull points using the parsed input points.
    const convexHullPoints = processorInstance.processPoints(inputPoints);
    // Original debug line, commented out.
    // console.log(convexHullPoints);

    let greatestDistance = 0; // Variable to keep track of the maximum Manhattan distance found.

    // Iterate through all unique pairs of points on the convex hull.
    for (let idx1 = 0; idx1 < convexHullPoints.length; idx1++) {
        for (let idx2 = idx1 + 1; idx2 < convexHullPoints.length; idx2++) {
            // Calculate the Manhattan distance (L1 distance) between the two current points.
            const currentDistance =
                Math.abs(convexHullPoints[idx1].x - convexHullPoints[idx2].x) +
                Math.abs(convexHullPoints[idx1].y - convexHullPoints[idx2].y);
            // Update `greatestDistance` if the `currentDistance` is larger.
            greatestDistance = Math.max(greatestDistance, currentDistance);
        }
    }

    // Output the final calculated greatest Manhattan distance to the console.
    console.log(greatestDistance);
}

// Read the entire content of standard input as a UTF-8 string and pass it to the main processing function.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
