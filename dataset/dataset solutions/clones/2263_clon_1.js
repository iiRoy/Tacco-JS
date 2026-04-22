function   Main  ( input )
{

    // Main function processing the input data.
    // This function calculates the minimum enclosing circle radius.

    input = input . split ( "\n" ) ; // Split the input string by newline characters.

    // Retrieve the number of points from the first line of input.
    var N = parseInt ( input [ 0 ] ) ;

    input . shift ( ) ; /* Remove the first element (N) from the input array as it's already parsed. */

    // Trim the input array to only contain the point coordinates.
    input . splice ( N , input . length ) ;

    // Parse the remaining input lines into a 2D array of numbers (x, y coordinates).
    var x = input . map ( i => i . split ( " " ) . map ( i => parseInt ( i ) ) ) ;

    var ans = 0 ; // Initialize the answer variable, representing the radius.


    // Special case: If there are only two points.
    if ( x . length == 2 ) {
        // The minimum enclosing circle for two points has them as diameter.
        // Calculate the distance between the two points and divide by 2 for the radius.
        var ans = Math . sqrt ( Math . pow ( x [ 0 ] [ 0 ] - x [ 1 ] [ 0 ] , 2 ) + Math . pow ( x [ 0 ] [ 1 ] - x [ 1 ] [ 1 ] , 2 ) ) / 2 ;
    }
    else
    {
        // General case: Three or more points.
        // We iterate through all possible combinations of three points to find the minimum enclosing circle.
        // This is a common approach for the smallest enclosing circle problem.

        for ( var i = 0 ; i < N ; i ++ ) { // First point
            for ( var j = i + 1 ; j < N ; j ++ ) { // Second point, ensuring j > i
                for ( var k = j + 1 ; k < N ; k ++ ) { // Third point, ensuring k > j

                    // Create an array to store squared edge lengths and their corresponding indices.
                    var edge = new Array ( ) ;

                    // Calculate squared distances between pairs of points.
                    // (x_i - x_j)^2 + (y_i - y_j)^2
                    edge . push ( [ Math . pow ( x [ i ] [ 0 ] - x [ j ] [ 0 ] , 2 ) + Math . pow ( x [ i ] [ 1 ] - x [ j ] [ 1 ] , 2 ) , 0 ] ) ; // Edge (i, j)
                    edge . push ( [ Math . pow ( x [ i ] [ 0 ] - x [ k ] [ 0 ] , 2 ) + Math . pow ( x [ i ] [ 1 ] - x [ k ] [ 1 ] , 2 ) , 1 ] ) ; // Edge (i, k)
                    edge . push ( [ Math . pow ( x [ k ] [ 0 ] - x [ j ] [ 0 ] , 2 ) + Math . pow ( x [ k ] [ 1 ] - x [ j ] [ 1 ] , 2 ) , 2 ] ) ; // Edge (k, j)

                    // Sort edges by length in descending order.
                    edge . sort ( function ( a , b ) { return b [ 0 ] - a [ 0 ] } ) ;

                    // Check if the triangle formed by these three points is obtuse or right-angled.
                    // If the square of the longest side is greater than the sum of the squares of the other two sides,
                    // the circle is defined by the longest side as its diameter.
                    if ( edge [ 0 ] [ 0 ] > edge [ 1 ] [ 0 ] + edge [ 2 ] [ 0 ] ) {
                        // The circle's diameter is the longest edge.
                        // Determine which edge is the longest and calculate the center (cx, cy) and squared radius (r2).
                        if ( edge [ 0 ] [ 1 ] == 0 ) { // Longest edge is (i, j)
                            var cx = ( x [ i ] [ 0 ] + x [ j ] [ 0 ] ) / 2 ;
                            var cy = ( x [ i ] [ 1 ] + x [ j ] [ 1 ] ) / 2 ;
                            var r2 = Math . pow ( x [ i ] [ 0 ] - cx , 2 ) + Math . pow ( x [ i ] [ 1 ] - cy , 2 ) ;
                        }
                        else if ( edge [ 0 ] [ 1 ] == 1 ) { // Longest edge is (i, k)
                            var cx = ( x [ i ] [ 0 ] + x [ k ] [ 0 ] ) / 2 ;
                            var cy = ( x [ i ] [ 1 ] + x [ k ] [ 1 ] ) / 2 ;
                            var r2 = Math . pow ( x [ i ] [ 0 ] - cx , 2 ) + Math . pow ( x [ i ] [ 1 ] - cy , 2 ) ;
                        }
                        else { // Longest edge is (j, k)
                            var cx = ( x [ j ] [ 0 ] + x [ k ] [ 0 ] ) / 2 ;
                            var cy = ( x [ j ] [ 1 ] + x [ k ] [ 1 ] ) / 2 ;
                            var r2 = Math . pow ( x [ j ] [ 0 ] - cx , 2 ) + Math . pow ( x [ j ] [ 1 ] - cy , 2 ) ;
                        }
                    }
                    else
                    {
                        // The triangle is acute or right-angled.
                        // The circle is the circumcircle of the three points.
                        // Calculate the circumcenter (cx, cy) and squared circumradius (r2).

                        // This is a complex formula for the circumcenter.
                        // It involves solving for the intersection of perpendicular bisectors.
                        var cy = ( ( x [ k ] [ 0 ] - x [ i ] [ 0 ] ) * ( Math . pow ( x [ i ] [ 0 ] , 2 ) + Math . pow ( x [ i ] [ 1 ] , 2 ) - Math . pow ( x [ j ] [ 0 ] , 2 ) - Math . pow ( x [ j ] [ 1 ] , 2 ) ) - ( x [ j ] [ 0 ] - x [ i ] [ 0 ] ) * ( Math . pow ( x [ i ] [ 0 ] , 2 ) + Math . pow ( x [ i ] [ 1 ] , 2 ) - Math . pow ( x [ k ] [ 0 ] , 2 ) - Math . pow ( x [ k ] [ 1 ] , 2 ) ) ) / ( 2 * ( x [ k ] [ 0 ] - x [ i ] [ 0 ] ) * ( x [ i ] [ 1 ] - x [ j ] [ 1 ] ) - 2 * ( x [ j ] [ 0 ] - x [ i ] [ 0 ] ) * ( x [ i ] [ 1 ] - x [ k ] [ 1 ] ) ) ;

                        // Calculate cx based on cy.
                        if ( x [ i ] [ 0 ] != x [ j ] [ 0 ] ) {
                            var cx = ( 2 * ( x [ i ] [ 1 ] - x [ j ] [ 1 ] ) * cy - Math . pow ( x [ i ] [ 0 ] , 2 ) - Math . pow ( x [ i ] [ 1 ] , 2 ) + Math . pow ( x [ j ] [ 0 ] , 2 ) + Math . pow ( x [ j ] [ 1 ] , 2 ) ) / ( 2 * ( x [ j ] [ 0 ] - x [ i ] [ 0 ] ) ) ;
                        }
                        else
                        {
                            // Handle vertical line case (x[i][0] == x[j][0]) using x[k].
                            var cx = ( 2 * ( x [ i ] [ 1 ] - x [ k ] [ 1 ] ) * cy - Math . pow ( x [ i ] [ 0 ] , 2 ) - Math . pow ( x [ i ] [ 1 ] , 2 ) + Math . pow ( x [ k ] [ 0 ] , 2 ) + Math . pow ( x [ k ] [ 1 ] , 2 ) ) / ( 2 * ( x [ k ] [ 0 ] - x [ i ] [ 0 ] ) ) ;
                        }

                        // Calculate squared radius from one of the points to the circumcenter.
                        var r2 = Math . pow ( x [ i ] [ 0 ] - cx , 2 ) + Math . pow ( x [ i ] [ 1 ] - cy , 2 ) ;
                    }


                    var flag = 0 ; // Flag to check if all points are within the current circle.
                    for ( var l = 0 ; l < N ; l ++ ) {
                        // Check if any point 'l' is outside the candidate circle.
                        // A small epsilon (0.000001) is added for floating-point comparisons.
                        if ( Math . pow ( x [ l ] [ 0 ] - cx , 2 ) + Math . pow ( x [ l ] [ 1 ] - cy , 2 ) > r2 + 0.000001 ) {
                            flag = 1 ; // Set flag if a point is found outside.
                            break ; // No need to check further points for this circle.
                        }
                    }

                    if ( flag == 0 ) {
                        // If all points are inside or on the boundary, this is a potential candidate for the MEC.
                        // We take the square root to get the radius.
                        ans = Math . sqrt ( r2 ) ;
                        break ; // Exit the innermost loop if a valid MEC is found (for 3 points).
                    }
                }
                if ( ans != 0 ) {
                    break ; // Exit the middle loop if a valid MEC is found.
                }
            }
            if ( ans != 0 ) {
                break ; // Exit the outermost loop if a valid MEC is found.
            }
        }
    }

    // Output the final calculated answer (minimum enclosing circle radius).
    console . log ( '%s' , ans ) ;
    return ans ; // Return the result.
}


// Debug function for testing purposes.
function debug ( n )
{
    var input = document . getElementById ( "input" + n ) . value ; // Get input from a DOM element.
    var ans = Main ( input ) ; // Call the Main function.
    var result = "WA" ; // Initialize result as "Wrong Answer".

    // Compare the calculated answer with the expected output from a DOM element.
    if ( ans == document . getElementById ( "output" + n ) . value . split ( "\n" ) [ 0 ] )
    {
        result = "AC" ; // Set result to "Accepted" if they match.
    }
    document . getElementById ( "result" + n ) . innerHTML = result ; // Display the result.
}

// Entry point for execution in a typical competitive programming environment.
// Reads input from standard input and passes it to the Main function.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;