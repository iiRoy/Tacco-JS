/*
 * This file contains a JavaScript implementation for finding the convex hull
 * (outer perimeter) of a set of 2D points.
 *
 * The algorithm is based on the approach described in the following article:
 * https://qiita.com/gushwell/items/2dfde9e736884461b090
 *
 * This is a Type I clone, meaning only whitespace and comments have been altered.
 * All functional code, identifiers, and expressions remain identical.
 */

// Define the Solver class, responsible for the convex hull computation.
class Solver {

    // Constructor for the Solver class.
    // Initializes an empty array to store points.
    constructor() {
        this.points = []; /* An array to hold the input points. */
    }

    // Solves the convex hull problem for a given set of points.
    // @param {Array<Object>} pts - An array of point objects, each with 'x' and 'y' properties.
    // @returns {Array<Object>} An array of points forming the convex hull.
    solve(pts) {
        this.points = pts; // Store the input points.

        // Delegate to the helper method to get the frame points.
        return this.getFramePoints();
    };

    // Computes the points that form the outer frame (convex hull) of the set.
    getFramePoints() {
        // Find the minimum x-coordinate among all points.
        let minx = Math.min(...this.points.map(o => o.x));

        // Locate the leftmost point(s). If multiple, 'find' returns the first one.
        let left = this.points.find(p => p.x === minx);

        // Find the maximum x-coordinate among all points.
        let maxx = Math.max(...this.points.map(o => o.x));

        // Locate the rightmost point(s).
        let right = this.points.find(p => p.x === maxx);

        // Calculate the lower half of the convex hull.
        // It uses a custom comparator to find points with maximum gradient (for the lower hull).
        let q1 = this._getFramePointsHalf(left, right, (now, seq) => {
            // Find the maximum gradient from 'now' to any point in 'seq'.
            return Math.max(...seq.map(p => Solver._gradient(now, p)));
        });

        // Calculate the upper half of the convex hull.
        // It uses a custom comparator to find points with minimum gradient (for the upper hull).
        let q2 = this._getFramePointsHalf(left, right, (now, seq) => {
            // Find the minimum gradient from 'now' to any point in 'seq'.
            return Math.min(...seq.map(p => Solver._gradient(now, p)));
        });

        // Combine the lower and upper halves.
        // The upper half is reversed to maintain clockwise/counter-clockwise order.
        return q1.concat(q2.slice().reverse()); // Using slice() to avoid modifying q2 directly.
    };

    // Calculates the gradient (slope) between two points.
    // This is a static helper method.
    // @param {Object} p1 - The first point {x, y}.
    // @param {Object} p2 - The second point {x, y}.
    // @returns {number} The gradient between p1 and p2.
    static _gradient(p1, p2) {
        // Handle vertical lines to avoid division by zero or return Infinity.
        // The original code relies on JS's Math.min/max handling of Infinity.
        return (p2.y - p1.y) / (p2.x - p1.x);
    };

    // Helper method to compute either the upper or lower half of the convex hull.
    // It iteratively finds the next point on the hull based on a gradient criterion.
    // @param {Object} now - The current point being processed.
    // @param {Object} right - The rightmost point, serving as a termination condition.
    // @param {Function} maxGradient - A callback function to determine the "best" gradient.
    // @returns {Array<Object>} An array of points forming one half of the hull.
    _getFramePointsHalf(now, right, maxGradient) {
        // Initialize the result with the starting point.
        let result = [now];

        // Loop until the current point reaches the rightmost point.
        while (now.x != right.x || now.y != right.y) {
            // Filter points that are to the right of the current point.
            let seq = this.points.filter(p => p.x > now.x);

            // Find the next point on the hull.
            // This point has the maximum (or minimum, depending on `maxGradient`)
            // gradient from the current point among all points in `seq`.
            let next = seq.find(p => Solver._gradient(now, p) == maxGradient(now, seq));

            result.push(next); // Add the found point to the result.
            now = next;       // Move to the next point.

            // Safety break: if 'next' is undefined, something went wrong or no more points.
            if (now === undefined)
                break;
        }
        return result; // Return the accumulated points for this half.
    };
};

/*
 * The main function to process input, compute, and output results.
 * This function simulates the environment for competitive programming.
 */
function Main(input) {
    // Split the input string into an array of lines.
    input = input.split("\n");

    // The first line contains the number of points, N.
    var N = Number(input[0]);

    // Initialize an array to store the parsed point objects.
    var points = [];

    // Loop through the input lines to parse point coordinates.
    for (var i = 1; i <= N; i++) {
        // Split each line by space to get x and y coordinates.
        var splited = input[i].split(" ");

        // Convert coordinates to numbers and push to the points array.
        points.push({ x: Number(splited[0]), y: Number(splited[1]) });
        // console.log("Parsed point:", points[i - 1].x, points[i - 1].y); // Debug comment.
    }

    // Create an instance of the Solver.
    let solver = new Solver();

    // Compute the outer points (convex hull).
    let outer_points = solver.solve(points);
    // console.log("Outer points:", outer_points); // Debug comment.

    // Initialize maximum distance to zero.
    var maxDistance = 0;

    // Calculate the Manhattan distance (L1 distance) between all pairs of outer points.
    // Find the maximum among these distances.
    for (var i = 0; i < outer_points.length; i++) {
        for (var j = i + 1; j < outer_points.length; j++) {
            // Calculate Manhattan distance between outer_points[i] and outer_points[j].
            var distance =
                Math.abs(outer_points[i].x - outer_points[j].x) +
                Math.abs(outer_points[i].y - outer_points[j].y);

            // Update maxDistance if the current distance is greater.
            maxDistance = Math.max(maxDistance, distance);
        }
    }

    // Output the final maximum Manhattan distance.
    console.log(maxDistance);
}

// Read input from stdin and pass it to the Main function.
// This line is typical for competitive programming environments.
Main(require("fs").readFileSync("/dev/stdin", "utf8"));