/*
 * This JavaScript code processes input data from standard input.
 * It reads numbers, performs calculations based on modulo arithmetic,
 * and then outputs results to the console.
 * This is a Type I clone, preserving all logic and identifiers.
 */

// Import the 'fs' (file system) module to read input.
var input = require('fs') . readFileSync ( '/dev/stdin' , 'utf8' ) ;

// Process the input string: trim whitespace, split by newlines, and convert to numbers.
var arr = input . trim ( ) . split ( "\n" ) . map ( Number ) ;


// Main processing loop: continues indefinitely until a specific condition is met.
while ( true )
{
    // Extract the first number from the array 'arr'.
    // This number 'n' will be the modulus for calculations.
    var n = arr . shift ( ) ;

    // Check for the termination condition: if 'n' is 0, exit the loop.
    if ( n == 0 )
        break ; // Terminate the program loop.


    // Initialize a boolean array 'ary' of size 'n', all elements set to false.
    // This array will track numbers that are perfect squares modulo 'n'.
    var ary = [ ] ;
    for ( var i = 0 ; i < n ; i ++ )
    {
        ary [ i ] = false ; // Set initial value to false.
    }


    // Populate 'ary': mark indices that are squares modulo 'n' as true.
    // Loop starts from 1 as 0*0%n is always 0, which might not be relevant for the problem's intent.
    for ( var i = 1 ; i < n ; i ++ )
    {
        ary [ ( i * i ) % n ] = true ; // Calculate square modulo n and mark the index.
    }


    // Create an array 'm' containing all indices 'i' for which ary[i] is true.
    // These are the numbers that are perfect squares modulo 'n'.
    var m = [ ] ;
    ary . forEach ( function ( v , i )
    {
        // If the value 'v' (which is ary[i]) is true, push its index 'i' into 'm'.
        if ( v )
        {
            m . push ( i ) ;
        }
    } ) ;


    // Initialize an array 'ans' to store the final counts.
    var ans = [ ] ;

    // Calculate 'len', which is half of (n-1), used for indexing 'ans'.
    var len = ( n - 1 ) / 2 ;

    // Initialize 'ans' with zeros up to the 'len' index.
    for ( var i = 0 ; i <= len ; i ++ )
    {
        ans [ i ] = 0 ; // Default count is zero.
    }


    // Nested loops to calculate differences between elements in 'm'.
    // This is the core logic for counting pairs.
    for ( var i = 0 ; i < m . length ; i ++ )
    {
        for ( var j = i + 1 ; j < m . length ; j ++ )
        {
            // Calculate the absolute difference between two elements from 'm', modulo 'n'.
            var x = m [ i ] - m [ j ] ;

            // Ensure 'x' is non-negative by adding 'n' if it's negative.
            if ( x < 0 )
            {
                x += n ;
            }

            // Adjust 'x' if it's greater than 'len', effectively folding the range.
            if ( len < x )
            {
                x = n - x ;
            }

            // Increment the count for 'x' in the 'ans' array by 2.
            // This is likely because each pair contributes to two symmetric differences.
            ans [ x ] += 2 ;
        }
    }


    // Remove the first element of 'ans', as it's typically for difference 0, which is often not relevant.
    ans . shift ( ) ;

    // Output each remaining element of 'ans' to the console on a new line.
    ans . forEach ( function ( v )
    {
        console . log ( v ) ; // Print the calculated count.
    } ) ;

} // End of the main while loop.
// End of JavaScript program.