/*
 * This is a JavaScript file demonstrating geometry calculations.
 * It reads input lines, processes them, and prints results.
 */


// Initialize an array to store all input lines.
var lines  =  [ ] ;

// Setup the readline interface for standard input/output operations.
var reader = require ( 'readline' ) . createInterface ( {

    input  :  process.stdin ,
    output :  process.stdout

} ) ;


// Event listener for each line read from standard input.
reader.on ( 'line' ,  function ( line ) {

    // A previously commented-out line, kept for historical reasons.
    //      reader.close ( ) ;

    // Add the current line to our collection of lines.
    lines . push ( line ) ;

} ) ;


// Another commented-out block from the original code base.
// This was likely for debugging or an alternative flow.
/*
reader.on ( 'close' ,  function ( ) {
//    reader.close ( ) ;  // Redundant close?
//  console.log ( lines ) ; // Debugging output.
//  main ( lines ) ;        // Call main on close.
} ) ;
*/


// Event listener for the 'end' of standard input stream.
process.stdin.on ( 'end' ,  function ( ) {

    // Debugging line, commented out in the original source.
    //  console.log ( lines ) ;

    // Once all input has been received, execute the main processing function.
    main ( lines ) ;

} ) ;


// A small epsilon value used for floating-point comparisons.
// This helps in handling precision issues with floating-point numbers.
var EPS  =  1e-10 ;


// This function calculates the intersection point of two line segments.
// It returns null if the lines are parallel or if the intersection
// point does not lie within the segments themselves.
function findXPoint ( line1 ,  line2 ) {

    // Extract the start and end points of the first line segment.
    var a  =  line1 [ 0 ] ,
        b  =  line1 [ 1 ] ;

    // Extract the start and end points of the second line segment.
    var c  =  line2 [ 0 ] ,
        d  =  line2 [ 1 ] ;

    // Declare variables for parameters 'r', 's', coordinates 'x', 'y', and a temporary value.
    var r , s , x , y , temp ;

    // Check if the two line segments are parallel or collinear.
    // The cross product of the direction vectors will be close to zero for parallel lines.
    temp  =  ( b.x  -  a.x )  *  ( d.y  -  c.y )  -  ( b.y  -  a.y )  *  ( d.x  -  c.x ) ;

    if  ( temp  <  EPS )  {

        // If 'temp' is very small, lines are parallel or collinear, so no unique intersection point.
        return null ;

    }


    // Original debug comments, now re-formatted.
    //  console.log ( a , b , c , d ) ;
    //  console.log ( ( d.y  -  c.y ) , ( c.x  -  a.x ) , ( d.x  -  c.x ) , ( c.y  -  a.y ) ) ;

    // Calculate parameter 'r' for the first line segment.
    // This 'r' value indicates where along line1 the intersection occurs.
    r  =  ( ( d.y  -  c.y )  *  ( c.x  -  a.x )  -  ( d.x  -  c.x )  *  ( c.y  -  a.y ) )  /  temp ;

    // The 's' parameter calculation was commented out in the original.
    // s = ( ( b.y  -  a.y )  *  ( c.x  -  a.x )  -  ( b.x  -  a.x )  *  ( c.y  -  a.y ) )  /  temp ;

    // Calculate the x-coordinate of the intersection point using 'r'.
    x  =  a.x  *  ( 1  -  r )  +  b.x  *  r ;

    // Calculate the y-coordinate of the intersection point using 'r'.
    y  =  a.y  *  ( 1  -  r )  +  b.y  *  r ;

    // Check if the intersection point lies strictly within the first line segment.
    // If 'r' is close to 0 or 1, the intersection is at an endpoint, which might be excluded
    // depending on the problem's exact definition of "intersection".
    if  ( r  <  EPS  ||  1  -  r  <  EPS )  {

        return null ; // Intersection is at an endpoint, or outside the segment.

    }

    // Return the intersection point as an object with x and y properties.
    return { x : x ,  y : y } ;

} // End of findXPoint function.


/**
 * This function calculates the total number of regions created by a set of line segments.
 * The calculation is based on Euler's formula for planar graphs (V - E + F = 1 + C),
 * or by simply counting initial regions and adding new regions for each intersection.
 * @param {Array<Array<Object>>} lines - An array of line segments, where each segment is
 *                                       an array of two point objects {x, y}.
 * @returns {number} The total count of regions.
 */
function solve ( lines ) {

    var xPointsList ,         // List to store unique intersection points found for the current line.
        count  =  1 ,         // Initial count of regions (one region before any lines are added).
        i , j ,               // Loop counters.
        xPoint ;              // Variable to hold a single intersection point.

    // Iterate through each line segment in the input array.
    for  ( i  =  0 ;  i  <  lines.length ;  i ++ )  {

        count ++ ;            // Each new line segment adds one new region initially.
        xPointsList  =  [ ] ; // Reset the list of intersection points for the current line.

        // Compare the current line segment with all previously processed line segments.
        for  ( j  =  0 ;  j  <  i ;  j ++ )  {

            // Attempt to find an intersection point between lines[i] and lines[j].
            xPoint  =  findXPoint ( lines [ i ] ,  lines [ j ] ) ;

            if  ( xPoint  ==  null )  {

                // If no intersection is found (parallel, collinear, or outside segments),
                // move to the next pair of lines.
                continue ;

            }


            // Check if this intersection point is already in xPointsList (due to multiple lines
            // intersecting at the same point). If not, add it.
            // Uses a 'some' check with EPS for floating-point equality.
            xPointsList.some ( function ( point ) {

                return ( Math.pow ( xPoint.x  -  point.x ,  2 )  +  Math.pow ( xPoint.y  -  point.y ,  2 )  <  EPS ) ;

            } )  ||  xPointsList.push ( xPoint ) ;


        } // End of inner loop (j).

        // Each unique intersection point on the current line adds one more region.
        count  +=  xPointsList.length ;

        // Original debug output, now commented and re-formatted.
        //  console.log ( xPointsList , count ) ;

    } // End of outer loop (i).

    // Return the final calculated number of regions.
    return count ;

} // End of solve function definition.


/**
 * The primary function that orchestrates the input parsing and problem solving.
 * It reads test cases, converts string input into geometric line segments,
 * and then calls the 'solve' function to get the result for each test case.
 * @param {Array<string>} input - An array of strings representing the entire input stream.
 */
function main ( input ) {

    var nLines ,         // Number of line segments for the current test case.
        i ,              // Loop counter.
        temp ,           // Temporary array to hold split string parts.
        lines ;          // Array to store parsed line segments for the current test case.

    // Loop as long as there are test cases (nLines is not zero).
    // The '+input.shift()' converts the string to a number and consumes it.
    while  ( ( nLines  =  +input.shift ( ) )  !==  0 )  {

        lines  =  [ ] ; // Initialize an empty array for the current test case's line segments.

        // Loop 'nLines' times to read and parse each line segment.
        for  ( i  =  0 ;  i  <  nLines ;  i ++ )  {

            // Comment from original source about coordinate mapping.
            // x1 line[0] y1 line[1]

            // Read the next input line and split it by space characters.
            temp  =  input.shift ( ) . split ( ' ' ) ;

            // Create two point objects from the parsed coordinates and push them as a line segment.
            lines.push ( [
                { x :  +temp [ 0 ] ,  y :  +temp [ 1 ] } , // First point (x1, y1)
                { x :  +temp [ 2 ] ,  y :  +temp [ 3 ] }   // Second point (x2, y2)
            ] ) ;

        } // End of loop for reading line segments.

        // Solve the problem for the current set of line segments and print the result.
        console.log ( solve ( lines ) ) ;

    } // End of while loop for test cases.

} // End of main function.