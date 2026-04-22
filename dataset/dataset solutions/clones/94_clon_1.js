/*
 * This is a JavaScript program designed to solve a specific geometric problem.
 * It reads input from standard input, processes it, and prints results to standard output.
 *
 * The problem involves determining the relationship between two circles based on their
 * center coordinates (x, y) and radii (r).
 *
 * Input format:
 * The first line contains an integer N, indicating the number of test cases.
 * Each subsequent line contains six space-separated numbers: xa ya ra xb yb rb,
 * representing the x-coordinate, y-coordinate, and radius of the first circle (A),
 * and similarly for the second circle (B).
 *
 * Output:
 * - 0: The circles do not intersect (are separate).
 * - 1: The circles intersect at two points, or are tangent (externally or internally).
 * - 2: Circle B is completely inside Circle A (strictly contained, not just tangent internally).
 * - -2: Circle A is completely inside Circle B (strictly contained, not just tangent internally).
 *
 * The logic handles various cases of circle intersection and containment.
 *
 */

( function ( input ) { // Start of the immediately invoked function expression (IIFE)
                      // The 'input' parameter will receive the content of the standard input file.

    // First, process the raw input string.
    // 1. Remove any single trailing newline character, if present.
    // 2. Split the cleaned string into an array of lines based on the newline character.
    var p = input.replace( /\n$/, '' ).split( '\n' ) ;


    // The very first element of the 'p' array (the first line of input)
    // represents the total number of test cases.
    // We convert this string to a number and store it in 'n'.
    // The 'shift()' method also removes this element from the 'p' array.
    var n = Number( p.shift() ) ;


    // Begin iterating through each of the N test cases.
    // The loop variable 'i' goes from 0 up to (but not including) 'n'.
    for ( var i = 0 ; i < n ; i ++ ) {

        // For each test case, we take the next line from the 'p' array.
        // This line contains six space-separated numbers: xa ya ra xb yb rb.
        // 1. 'shift()' gets the next line string.
        // 2. 'split(' ')' divides the string into an array of number strings.
        // 3. 'map(Number)' converts each string in the array to an actual number.
        var args = p.shift().split( ' ' ).map( Number ) ;

        // Extract the parameters for the first circle (Circle A).
        // xa: x-coordinate of circle A's center.
        var xa = args.shift() ;
        // ya: y-coordinate of circle A's center.
        var ya = args.shift() ;
        // ra: radius of circle A.
        var ra = args.shift() ;

        // Extract the parameters for the second circle (Circle B).
        // xb: x-coordinate of circle B's center.
        var xb = args.shift() ;
        // yb: y-coordinate of circle B's center.
        var yb = args.shift() ;
        // rb: radius of circle B.
        var rb = args.shift() ;


        // Calculate the Euclidean distance 'd' between the centers of the two circles.
        // The formula is: sqrt((x2 - x1)^2 + (y2 - y1)^2).
        // Math.pow(base, exponent) calculates base raised to the power of exponent.
        // Math.sqrt() calculates the square root.
        var d = Math.sqrt( Math.pow( xb - xa , 2 ) + Math.pow( yb - ya , 2 ) ) ;


        // Now, evaluate the relationship between the two circles based on 'd' and their radii.

        // Condition check: Are the circles close enough to intersect or for one to contain the other?
        // This is true if the distance between centers 'd' is less than or equal to the sum of their radii (ra + rb).
        if ( d <= ra + rb ) {

            // Sub-condition 1: Is Circle A completely inside Circle B?
            // This happens if 'd' is less than the absolute difference |rb - ra|,
            // specifically (rb - ra) if rb > ra.
            // A is strictly contained within B if d < rb - ra.
            if ( d < rb - ra ) {
                console.log( -2 ) ; // Output -2 as per problem specification.
            }
            // Sub-condition 2: Is Circle B completely inside Circle A?
            // This happens if 'd' is less than the absolute difference |ra - rb|,
            // specifically (ra - rb) if ra > rb.
            // B is strictly contained within A if d < ra - rb.
            else if ( d < ra - rb ) {
                console.log( 2 ) ; // Output 2 as per problem specification.
            }
            // Sub-condition 3: The circles intersect at two points, or are tangent (internally or externally).
            // If they are not entirely separate (d <= ra + rb) AND neither is strictly contained within the other,
            // then they must be intersecting or touching.
            else {
                console.log( 1 ) ; // Output 1 for intersection/tangency.
            }

        }
        // Else condition: The circles are too far apart to intersect or touch.
        // This means the distance 'd' is strictly greater than the sum of their radii.
        else {
            console.log( 0 ) ; // Output 0 for no intersection.
        }

    } // End of the 'for' loop, all test cases processed.

// The IIFE is immediately invoked.
// It reads the entire content of '/dev/stdin' (standard input) as a UTF-8 string
// using Node.js's 'fs' module, and passes it as the 'input' argument.
} ) ( require( 'fs' ).readFileSync( '/dev/stdin' , 'utf8' ) ) ;

// End of the JavaScript program file.