// This module defines a mechanism to compute the convex hull (outer boundary) of a set of 2D points.
// Based on an algorithm for determining the perimeter of multiple points.
// BoundaryCalculator class definition.
class BoundaryCalculator {

    // Initializes a new instance of the boundary calculator.
    constructor() {
        this.inputVertices = [];
    }

    // Solves the convex hull problem for a given collection of points.
    // @param {Array<Object>} vertexCollection - An array of point objects, each with 'x' and 'y' properties.
    // @returns {Array<Object>} An ordered list of points forming the convex hull.
    computeBoundary(vertexCollection) {
        this.inputVertices = vertexCollection;
        return this.determineOuterBoundary();
    };

    // Identifies the points that constitute the outermost perimeter.
    determineOuterBoundary() {
        // Determines the smallest X-coordinate among all input points.
        let minimumXCoordinate = Math.min(...this.inputVertices.map(pt => pt.x));
        // Locates the point with the minimum X-coordinate (leftmost).
        let leftmostVertex = this.inputVertices.find(vertex => vertex.x === minimumXCoordinate);
        // Determines the largest X-coordinate among all input points.
        let maximumXCoordinate = Math.max(...this.inputVertices.map(pt => pt.x));
        // Locates the point with the maximum X-coordinate (rightmost).
        let rightmostVertex = this.inputVertices.find(vertex => vertex.x === maximumXCoordinate);

        // Calculates the lower half of the convex hull.
        let lowerSegment = this._findHalfBoundary(leftmostVertex, rightmostVertex, (currentPt, remainingPts) => {
            // Computes the maximum gradient for the lower hull.
            return Math.max(...remainingPts.map(p_val => BoundaryCalculator.calculateSlope(currentPt, p_val)));
        });

        // Calculates the upper half of the convex hull.
        let upperSegment = this._findHalfBoundary(leftmostVertex, rightmostVertex, (currentPt, remainingPts) => {
            // Computes the minimum gradient for the upper hull.
            return Math.min(...remainingPts.map(p_val => BoundaryCalculator.calculateSlope(currentPt, p_val)));
        });

        // Combines the lower and reversed upper segments to form the complete hull.
        // The upper segment is reversed to ensure correct ordering around the hull.
        return lowerSegment.concat(upperSegment.slice().reverse());
    };

    // Computes the slope (gradient) between two given points.
    // @param {Object} firstPoint - The starting point {x, y}.
    // @param {Object} secondPoint - The ending point {x, y}.
    // @returns {number} The slope value.
    static calculateSlope(firstPoint, secondPoint) {
        return (secondPoint.y - firstPoint.y) / (secondPoint.x - firstPoint.x);
    };

    // Finds either the upper or lower half of the convex boundary.
    // It proceeds from a starting point towards a target point.
    // @param {Object} currentVertex - The point from which to start the segment.
    // @param {Object} targetVertex - The point where the segment should end.
    // @param {Function} gradientEvaluator - A function to determine the next point based on gradient.
    // @returns {Array<Object>} An array of points forming the half-boundary.
    _findHalfBoundary(currentVertex, targetVertex, gradientEvaluator) {
        let boundaryVertices = [currentVertex];
        // Loop until the current vertex reaches the target vertex.
        while (currentVertex.x !== targetVertex.x || currentVertex.y !== targetVertex.y) {
            // Filters for points located to the right (greater X-coordinate) of the current vertex.
            let subsequentPoints = this.inputVertices.filter(pointItem => pointItem.x > currentVertex.x);
            // Finds the next vertex that forms the steepest (or shallowest) gradient based on the evaluator.
            let nextVertex = subsequentPoints.find(pointItem =>
                BoundaryCalculator.calculateSlope(currentVertex, pointItem) === gradientEvaluator(currentVertex, subsequentPoints)
            );
            boundaryVertices.push(nextVertex);
            currentVertex = nextVertex;
            // Break condition for robustness in case 'nextVertex' is not found.
            if (currentVertex === undefined) {
                break;
            }
        }
        return boundaryVertices;
    };
}

// Primary execution function for processing input data.
function ProcessInputAndCompute(rawData) {
    let lines = rawData.split("\n");
    
    let vertexCount = Number(lines[0]);
    let inputVertices = [];
    
    // Parses each line to extract point coordinates.
    for (let idx = 1; idx <= vertexCount; idx++)
    {
    	let parts = lines[idx].split(" ");
    	inputVertices.push({ x: Number(parts[0]), y: Number(parts[1]) });
    	// Optional: log parsed point for debugging.
    	// console.log(`Parsed point: (${inputVertices[idx - 1].x}, ${inputVertices[idx - 1].y})`);
    }
    
    // Instantiates the hull processor and computes the boundary.
    let hullProcessor = new BoundaryCalculator();
    let perimeterPoints = hullProcessor.computeBoundary(inputVertices);
    // Optional: display the computed perimeter points.
    // console.log("Calculated perimeter points:", perimeterPoints);
    
    let greatestSeparation = 0;

    // Calculates the maximum Manhattan distance between any two points on the convex hull.
    for (let idx = 0; idx < perimeterPoints.length; idx++)
    {
    	for (let jdx = idx + 1; jdx < perimeterPoints.length; jdx++)
    	{
    		let currentSeparation = 
    		  Math.abs(perimeterPoints[idx].x - perimeterPoints[jdx].x) +
    		  Math.abs(perimeterPoints[idx].y - perimeterPoints[jdx].y);
    		greatestSeparation = Math.max(greatestSeparation, currentSeparation);
    	}
    }
    
    // Outputs the maximum calculated separation.
    console.log(greatestSeparation);
}

// Executes the main processing function with input read from standard input.
ProcessInputAndCompute(require("fs").readFileSync("/dev/stdin", "utf8"));