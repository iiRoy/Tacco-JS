// This file is configured for TypeScript type checking.
// @ts-check


/**
 *  This function calculates the harmonic mean-like value
 *  of two input numbers, 'a' and 'b'.
 *
 *  It sums them up and checks for parity.
 *
 *  @param {number} a  The first numerical input.
 *  @param {number} b  The second numerical input.
 */
function   harmony  (  a  ,  b  )
{
    // Calculate the sum of the two input parameters.
    var   s   =   (  a   +   b  )  ;


    // Check if the sum 's' is an even number.
    if    (  s   %   2   ===   0  )
    {
        // If 's' is even, calculate half of 's'.
        var   k   =   s   /   2  ;

        // Output the calculated value 'k' to the console.
        console  .  log  (  k  )  ;
    }
    else
    {
        // If 's' is odd, it's considered an "impossible" scenario for this logic.
        console  .  log  (  'IMPOSSIBLE'  )  ;
    }

}   // End of the harmony function definition.


// Retrieve the first command-line argument and convert it to a number.
var   x   =   Number  (  process  .  argv  [  2  ]  )  ;

// Retrieve the second command-line argument and convert it to a number.
var   y   =   Number  (  process  .  argv  [  3  ]  )  ;


// Call the harmony function with the parsed command-line arguments.
harmony  (  x  ,  y  )  ;

// Script execution concludes here.