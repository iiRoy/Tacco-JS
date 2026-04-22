/*
 * This is a Type I clone of the original JavaScript code.
 * All identifiers, operators, and expressions are preserved exactly.
 * Only whitespace and comments have been altered significantly
 * to create a visually distinct but functionally identical version.
 */

// Define the main function that processes the input
function     Main
( input )

{
    // Destructure the input string into three integer variables: x, k, and d.
    // First, trim any leading/trailing whitespace.
    // Then, split the string by spaces.
    // Finally, map each part to an integer with base 10.
    const [ x , k , d ]    =    input.trim ( ) .split (" ") .map ( ( a ) => parseInt ( a , 10 ) ) ;


    // Calculate absolute value of x divided by d, storing it in 'a'.
    const a    =    Math.abs ( x / d ) ;

    // Calculate the remainder of x divided by d, storing it in 'b'.
    const b    =    x % d ;

    // Check the primary condition: if the absolute value of x is less than d.
    if (    Math.abs ( x )    <    d    )
    {
        // Inner condition: if k is an even number.
        if ( k % 2 === 0 )
        {
            // Output x if k is even.
            console.log ( x ) ;
        }
        else
        {
            // Output x + d if k is odd.
            console.log ( x + d ) ;
        }
    }
    // Else if the absolute distance 'a' is greater than the number of operations 'k'.
    else if (    a    >    k    )
    {
        // Inner condition: if x is positive.
        if ( x > 0 )
        {
            // Output the absolute value of (x - k * d).
            console.log (    Math.abs ( x - k * d )    ) ;
        }
        else
        {
            // Output the absolute value of (x + k * d) if x is negative or zero.
            console.log (    Math.abs ( x + k * d )    )
        }
    }
    // Otherwise (if Math.abs(x) >= d and a <= k).
    else
    {
        // Inner condition: if k is even AND the remainder 'b' is zero.
        if (    k % 2 === 0    &&    b === 0    )
        {
            // Output d.
            console.log ( d ) ;
        }
        else
        {
            // Output the remainder 'b'.
            console.log ( b ) ;
        }
    }
}


// Call the Main function with input read from standard input.
// This reads the entire file content as a UTF-8 string.
Main (    require ( "fs" ) .readFileSync ( "/dev/stdin" , "utf8" )    ) ;