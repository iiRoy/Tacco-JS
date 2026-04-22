/*
 * This is a configuration object for input and newline characters.
 * The commented line is for Windows, the active one for Linux.
 */
// config = {input: 'tmp', newline: '\r\n'}; // For Windows OS, if needed for testing locally
config = { input: '/dev/stdin', newline: '\n' }; // For Linux/Unix based systems, as specified


// Read the input 'n' from the configured source.
// 'n' represents the number of iterations for the Koch curve generation.
n = Number( require('fs').readFileSync( config.input , 'ascii' ).trim() );


// Define a constant for the scaling factor, used in Koch curve calculations.
// This value is Math.sqrt(3)/6, derived from equilateral triangle geometry.
const SCALE = Math.sqrt(3) / 6 ;


/**
 * Calculates the four points that form a segment of the Koch curve.
 * Given two points p1 and p2, it returns p1, s, u, t.
 * These four points replace the original segment (p1, p2) in the next iteration.
 *
 * @param {Array<number>} p1 - The starting point of the segment [x, y].
 * @param {Array<number>} p2 - The ending point of the segment [x, y].
 * @returns {Array<Array<number>>} An array containing the four new points: p1, s, u, t.
 */
function get_koch( p1, p2 )
{
    // Calculate point 's', which is one-third of the way from p1 to p2.
    // Formula: (2*p1 + p2) / 3
    var s = [ ( 2 * p1[0] + p2[0] ) / 3 , ( 2 * p1[1] + p2[1] ) / 3 ];


    // Calculate point 't', which is two-thirds of the way from p1 to p2.
    // Formula: (p1 + 2*p2) / 3
    var t = [ ( p1[0] + 2 * p2[0] ) / 3 , ( p1[1] + 2 * p2[1] ) / 3 ];


    // Calculate the x-coordinate of the peak point 'u' of the equilateral triangle.
    // This involves a rotation and scaling based on the original segment.
    var ux = ( p1[0] + p2[0] ) / 2 + SCALE * ( p1[1] - p2[1] );
    // Calculate the y-coordinate of the peak point 'u'.
    var uy = ( p1[1] + p2[1] ) / 2 + SCALE * ( p2[0] - p1[0] );


    // Return the four points defining the new segment: p1, s, u, t.
    // Note that 'p2' itself is not returned here; it will be added separately or
    // serve as 'p1' for the next segment if it's an intermediate point.
    return [ p1 , s , [ ux , uy ] , t ];
}


// Initialize the starting line segment for the Koch curve.
// This typically goes from (0,0) to (100,0) for the base of the fractal.
line = [ [ 0 , 0 ] , [ 100 , 0 ] ];


// Perform 'n' iterations to generate the Koch curve.
// Each iteration subdivides every segment into four smaller segments.
for ( i = 0 ; i < n ; i++ )
{
    // Initialize an empty array to store the next set of line segments.
    // This will hold the points of the curve after the current iteration.
    next = [];

    // Iterate through the current line segments, considering pairs of adjacent points.
    // The loop runs for `line.length - 1` times, as there are `L-1` segments for `L` points.
    for ( j = 0 ; j < line.length - 1 ; j++ )
    {
        // Get the four new points for the current segment [line[j], line[j+1]]
        // using the get_koch function, and concatenate them to the 'next' array.
        next = next.concat( get_koch( line[j] , line[j+1] ) );
    }

    // Append the very last point of the original 'line' to 'next'.
    // This ensures the final endpoint of the overall curve is included,
    // as get_koch only returns the first four points of a five-point subdivision.
    next.push( line[ line.length - 1 ] );

    // Update the 'line' array with the newly generated segments for the next iteration.
    // 'line' now holds the more refined set of points.
    line = next;
}


// After all iterations, print each point of the final Koch curve.
// Each point's coordinates (x and y) are joined by a space, as per output format.
for ( i in line )
{
    console.log( line[i].join(' ') );
}