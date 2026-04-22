/*
 * This is a Type I clone of an original JavaScript function.
 * All identifiers, variable names, function names, operators, and expressions
 * are preserved exactly as they were in the original code.
 * Only whitespace (indentation, line breaks, spacing) and comments have been altered
 * to create a visually distinct, yet functionally identical, version.
 */
function Main( s )
{
    // The input string 's' is parsed into an array of numbers.
    s = s . split ( " " ) . map ( a => + a ) ;

    // Initialize the answer variable with the product of the first and fourth elements.
    var ans = s [ 0 ] * s [ 3 ] ;

    // Add the product of the second and fifth elements to the answer.
    ans += s [ 1 ] * s [ 4 ] ;


    // Check a specific condition involving the first, second, and third elements.
    if ( s [ 0 ] + s [ 1 ] > s [ 2 ] * 2 )
    {
        // Calculate the minimum of the fourth and fifth elements.
        var m = Math . min ( s [ 3 ] , s [ 4 ] ) ;

        // Adjust the answer based on a complex expression and 'm'.
        ans -= ( s [ 0 ] + s [ 1 ] - s [ 2 ] * 2 ) * m ;

        // Decrement the fourth element by 'm'.
        s [ 3 ] -= m ;

        // Decrement the fifth element by 'm'.
        s [ 4 ] -= m ;
    }


    // Another conditional adjustment for the answer.
    // This checks if the fourth element is positive and the first element is large enough.
    if ( s [ 3 ] > 0 && s [ 0 ] > s [ 2 ] * 2 )
        ans -= ( s [ 0 ] - s [ 2 ] * 2 ) * s [ 3 ] ;


    // A third conditional adjustment.
    // Checks if the fifth element is positive and the second element meets a certain threshold.
    if ( s [ 4 ] > 0 && s [ 1 ] > s [ 2 ] * 2 )
        ans -= ( s [ 1 ] - s [ 2 ] * 2 ) * s [ 4 ] ;

    // Output the final calculated answer to the console.
    console . log ( ans ) ;
}

// Invoke the Main function with input read from standard input.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;