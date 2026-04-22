/*
 * This JavaScript code reads numerical input from standard input,
 * processes it through a series of mathematical operations,
 * and then prints calculated results to the console.
 * It handles multiple test cases until a specific termination condition is met.
 */

// Import the 'fs' module for file system operations, specifically for reading standard input.
var input = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ;

// Process the raw input string:
// 1. Trim any leading/trailing whitespace.
// 2. Split the string into an array of substrings based on newline characters.
// 3. Map each substring to its numerical equivalent.
var arr = input . trim ( ) . split ( "\n" ) . map ( Number ) ;


// Start the main processing loop. This loop continues indefinitely
// until an explicit 'break' statement is encountered.
while ( true )
{
    // Extract the first element from the 'arr' array.
    // This element 'n' usually represents the size or a key parameter for the current test case.
    var n = arr . shift ( ) ;

    // Check for the termination condition: if 'n' is 0, exit the loop.
    if ( n == 0 )
    {
        break ;
    }

    // Handle a special case: if 'n' is 1, print an empty line and skip to the next iteration.
    if ( n == 1 )
    {
        console . log ( "" ) ;
        continue ;
    }


    // Initialize an array 'ary' of size 'n' with boolean 'false' values.
    var ary = [ ] ;
    for ( var i = 0 ; i < n ; i ++ )
    {
        ary [ i ] = false ;
    }

    // Populate 'ary' based on a mathematical condition:
    // Mark the index (i*i) % n as 'true' for 'i' from 1 up to 'n-1'.
    for ( var i = 1 ; i < n ; i ++ )
    {
        ary [ ( i * i ) % n ] = true ;
    }


    // Create a new array 'm' to store the indices where 'ary' has 'true' values.
    var m = [ ] ;
    ary . forEach ( function ( v , i )
    {
        if ( v )
        {
            m . push ( i ) ;
        }
    } ) ;


    // Initialize an array 'ans' to accumulate counts.
    var ans = [ ] ;

    // Calculate 'len', which is (n-1) divided by 2 (integer division implicitly).
    var len = ( n - 1 ) / 2 ;

    // Initialize 'ans' with zeros up to the 'len' index.
    for ( var i = 0 ; i <= len ; i ++ )
    {
        ans [ i ] = 0 ;
    }


    // Perform nested loops to calculate differences between elements in 'm'.
    // This calculates pairwise differences and adjusts them based on 'n' and 'len'.
    for ( var i = 0 ; i < m . length ; i ++ )
    {
        for ( var j = i + 1 ; j < m . length ; j ++ )
        {
            // Calculate the first difference (m[i] - m[j]).
            var x = m [ i ] - m [ j ] ;

            // Ensure 'x' is positive by adding 'n' if it's negative.
            if ( x < 0 )
            {
                x += n ;
            }

            // Adjust 'x' if it exceeds 'len' by subtracting 'n'.
            if ( len < x )
            {
                x -= n ;
            }

            // Increment the count for this 'x' in the 'ans' array.
            ans [ x ] ++ ;


            // Calculate the second difference (m[j] - m[i]), which is symmetric.
            var x = m [ j ] - m [ i ] ;

            // Ensure 'x' is positive.
            if ( x < 0 )
            {
                x += n ;
            }

            // Adjust 'x' if it exceeds 'len'.
            if ( len < x )
            {
                x -= n ;
            }

            // Increment the count for this 'x' in the 'ans' array.
            ans [ x ] ++ ;
        }
    }


    // Remove the first element from the 'ans' array.
    ans . shift ( ) ;

    // Iterate through the remaining elements of 'ans' and print each element multiplied by 2.
    ans . forEach ( function ( v )
    {
        console . log ( v * 2 ) ;
    } ) ;
}
// End of the main while loop.