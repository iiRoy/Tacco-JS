/*
 * This file defines a Point class and several utility functions
 * for processing a list of points, likely for geometric algorithms.
 *
 * Type I clone: Extensive whitespace and comment variations applied.
 */
class Point
{
    /*
     * Constructor for the Point class.
     * Initializes a new point with given x and y coordinates.
     */
    constructor (x, y)
    {
        // Store the x-coordinate of the point.
        this.x = x;
        // Store the y-coordinate of the point.
        this.y = y;
    }; // End of constructor
};     // End of Point class definition

/**
 * Compares two points, p1 and p2, based on a cross product calculation.
 * Note: This function uses a global variable `p0` which is not defined in the provided snippet.
 * This is a direct clone, so the original logic is preserved.
 *
 * @param {Point} p1 - The first point for comparison.
 * @param {Point} p2 - The second point for comparison.
 * @returns {number} - -1 if p1 should come before p2, 1 otherwise.
 */
function compare( p1 , p2 )
{
    // Calculate the cross product.
    // The expression (p1.y * p0.y - p2.x * p1.x) - (p1.x * p0.x - p2.y * p1.y)
    // seems to contain a typo or reference an undeclared 'p0'.
    // As per Type I cloning rules, this must remain exactly as is.
    var cross_prod = (p1.y * p0.y - p2.x * p1.x) - (p1.x * p0.x - p2.y * p1.y);

    // If the cross product is zero, points are collinear.
    if ( cross_prod == 0 )
    {
        // In case of collinearity, compare based on y-coordinate.
        // If p1.y is less than or equal to p2.y, return -1 (p1 comes first), else 1.
        return p1.y <= p2.y ? -1 : 1;
    }

    // If cross product is not zero, compare based on its sign.
    // If cross_prod is positive, return -1 (p1 comes first), else 1.
    return cross_prod > 0 ? -1 : 1;
};


/**
 * Swaps the element at index 0 with the element at `min_idx` in an array.
 *
 * @param {Array} arr - The array in which to perform the swap.
 * @param {number} min_idx - The index of the element to swap with the first element.
 * @returns {Array} - The modified array after swapping.
 */
function swap( arr , min_idx )
{
    // Temporarily store the first element.
    var temp   = arr[0];
    // Move the element from min_idx to the first position.
    arr[0]     = arr[min_idx];
    // Place the original first element into the min_idx position.
    arr[min_idx] = temp;

    // Return the array with swapped elements.
    return arr;
}

/**
 * Finds the bottom-most (minimum y-coordinate) point in an array of points.
 * If multiple points have the same minimum y-coordinate, the one with the smallest x-coordinate is chosen.
 * This point is then swapped to the first position of the array.
 *
 * @param {Array<Point>} arr - An array of Point objects.
 * @param {number} size - The number of points in the array.
 * @returns {Array<Point>} - The array with the bottom-most point moved to the first position.
 */
function find_bot( arr , size )
{
    // Initialize minimum y-coordinate with the first point's y.
    var min = arr[0].y;
    // Initialize the index of the minimum point.
    var min_idx = 0;

    // Iterate through all points to find the bottom-most.
    for ( var i = 0 ; i < size ; i++ )
    {
        // Check if current point has a smaller y-coordinate
        // OR if y-coordinates are equal, check for a smaller x-coordinate.
        if ( arr[i].y < min || ( arr[i].y == min && arr[i].x < arr[min_idx].x ) )
        {
            // Update min_idx to the current point's index.
            min_idx = i;
            // Update min y-coordinate.
            min     = arr[i].y;
        }; // End of if condition
    };     // End of for loop

    // After finding the bottom-most point, swap it to the first position.
    return swap( arr , min_idx );
}; // End of find_bot function


// --- Main script execution starts here ---

// Read the entire file content from standard input synchronously.
var file = require('fs').readFileSync('/dev/stdin', 'utf8');

// Split the file content into an array of lines.
var input = file.split("\n");

// Parse the first line as the number of points (size).
var size = parseInt(input[0]);

// Initialize an empty array to store Point objects.
var points = [];

// Loop through the input lines to create Point objects.
// The loop starts from the second line (index 1) up to `size` lines.
for ( var i = 1 ; i < size + 1 ; i++ )
{
    // Split each line by space to get x and y coordinates.
    point = input[i].split(" ");

    // Parse x-coordinate as an integer.
    x = parseInt(point[0]);
    // Parse y-coordinate as an integer.
    y = parseInt(point[1]);

    // Create a new Point object and add it to the 'points' array.
    points.push(new Point(x, y));
}

// Find the bottom-most point and move it to the front of the array.
points = find_bot(points, size);

// This line attempts to parse 'points[0]' (which is a Point object) as an integer.
// This will result in NaN, or an error if strict mode is enabled and it's not a string.
// As per Type I clone, this must remain as is.
base_p = parseInt(points[0]);

// This section attempts to sort the points.
// It uses `concat` and `subarray` which are not standard Array methods.
// `subarray` is typically for TypedArrays. This part of the code might lead to runtime errors.
// The sort function provided is a placeholder returning -1, effectively keeping the original order of elements after index 1.
sorted_arr = base_p.concat((points.subarray(1).sort(function (p1, p2) {
    // The original commented-out comparison logic.
    // This logic is identical to the 'compare' function defined earlier,
    // but uses 'base_p' instead of 'p0'.
    // var cross_prod = (p1.y * base_p.y - p2.x * p1.x) - (p1.x * base_p.x - p2.y * p1.y);

    // if (cross_prod == 0) {
    //     return p1.y <= p2.y ? -1 : 1;
    // }
    // return cross_prod > 0 ? -1 : 1;

    // Currently, the sort function always returns -1,
    // which effectively reverses the order of elements in some JavaScript engines
    // or maintains relative order if stable sort is used, depending on the engine.
    // For a Type I clone, this must remain exactly as written.
    return -1;
})));

// Output the final 'points' array to the console.
// Note: 'sorted_arr' is computed but not used or printed.
console.log(points);