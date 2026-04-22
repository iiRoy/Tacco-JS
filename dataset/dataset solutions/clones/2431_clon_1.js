/* This is a Type I clone generated from the original JavaScript code.
 * All identifiers, operators, and expressions are kept exactly the same.
 * Only whitespace and comments have been altered significantly. */

// The 'input' parameter will receive the entire dataset as a single string.
function Main ( input )
{
    // First, split the input string into an array of lines.
    input = input . split ( '\n' ) ;

    // The first line of input contains the size (number of points).
    var size = input [ 0 ] ;

    // Declare all necessary variables here for processing points and distances.
    var i , j , pi , xi , yi , xj , yj , d ;

    // Initialize the accumulator for total distances to zero.
    var result = 0 ;

    // Outer loop: Iterate through each point from the first (index 1) to the 'size'-th.
    for ( i = 1 ; i <= size ; i ++ )
    {
        // Parse the coordinates of the current point (Pi).
        // Each line representing a point is split by a space.
        pi = input [ i ] . split ( ' ' ) ;

        // Extract x and y coordinates for point Pi from the parsed array.
        xi = pi [ 0 ] ;
        yi = pi [ 1 ] ;

        // Inner loop: Compare the current point Pi with all subsequent points Pj.
        // This avoids duplicate calculations (distance Pj-Pi is same as Pi-Pj)
        // and comparing a point to itself.
        for ( j = i + 1 ; j <= size ; j ++ )
        {
            // Parse the coordinates of the comparison point (Pj).
            pj = input [ j ] . split ( ' ' ) ;

            // Extract x and y coordinates for point Pj from its parsed array.
            xj = pj [ 0 ] ;
            yj = pj [ 1 ] ;

            // Calculate the Euclidean distance between point Pi(xi, yi) and Pj(xj, yj).
            // The formula used is: sqrt((x1-x2)^2 + (y1-y2)^2)
            d = Math . sqrt ( ( xi - xj ) * ( xi - xj ) + ( yi - yj ) * ( yi - yj ) ) ;

            // Add the calculated distance to the running total.
            result += d ;
        }
        // End of the inner loop (comparison with subsequent points for the current Pi).
    }
    // End of the outer loop (iteration through all points Pi).

    // Finally, print the result of the calculation to the console.
    // The problem requires (total_distances * 2) / size.
    console . log ( result * 2 / size ) ;
}

// End of the Main function definition.

/*
 * The following section handles standard input/output operations.
 * It reads the entire content from /dev/stdin (standard input)
 * using Node.js's 'fs' module and passes it as a UTF-8 string
 * to the Main function for processing.
 *
 * This part should typically not be modified when submitting to
 * competitive programming platforms, as it's part of their execution environment setup.
 */
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;