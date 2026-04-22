/*
 * This is a Type I clone of the original JavaScript program.
 * It processes input to calculate a specific sum based on distances.
 * All identifiers, operators, and logical structures are preserved exactly.
 * Only whitespace and comments have been altered significantly.
 */


function   Main   (   input   )
{
    // Initialize an array to hold the processed input lines.
    var   inp   =   input . split (  '\n'  ) ;


    // Parse the first line for the value of N, representing the number of points.
    var   N   =   parseInt (  inp [ 0 ] . trim ( )  ) ;

    // Parse the second line for the value of K, representing a target distance or boundary.
    var   K   =   parseInt (  inp [ 1 ] . trim ( )  ) ;


    // Parse the third line, splitting it by spaces and converting each part to an integer.
    var   x   =   inp [ 2 ] . trim ( ) . split (  ' '  ) . map (  n   =>   {
        // Convert each string element 'n' into an integer.
        return   parseInt (  n  )
    }  ) ;


    // Initialize the accumulator variable 'sum' to zero.
    var   sum   =   0 ;


    // Begin the main loop, iterating 'N' times, once for each point.
    for   (  var   i   =   0 ;   i   <   N ;   i ++  )
    {
        // Calculate 'distanceA': the direct distance from the origin (0) to the current point x[i].
        var   distanceA   =   x [ i ] ;

        // Calculate 'distanceB': the distance from the target 'K' to the current point x[i].
        var   distanceB   =   K   -   x [ i ] ;


        // Determine the minimum of the two distances (distanceA or distanceB).
        // This represents the shortest path to reach the point x[i] from either 0 or K.
        var   distance   =   distanceA   <   distanceB   ?   distanceA   :   distanceB ;


        // Multiply the minimum distance by 2, as the problem implies a round trip or equivalent.
        distance   *=   2 ;

        // Add this calculated round-trip distance to the total sum.
        sum   +=   distance ;
    }


    // Output the final computed sum to the console.
    console . log (  sum  ) ;

}


// Execute the Main function, reading input asynchronously from standard input.
Main (  require (  'fs'  ) . readFileSync (  '/dev/stdin'  ,   'utf8'  )  ) ;