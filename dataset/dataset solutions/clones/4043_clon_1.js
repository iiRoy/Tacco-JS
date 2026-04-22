/*
 * This JavaScript module defines a main function to process input
 * and determine a specific condition.
 *
 * The program reads data from standard input, performs calculations
 * based on array manipulations, and outputs a boolean result as a string.
 */
function Main ( s )
{
    // The input string 's' is first split into an array of lines.
    // Each element in this array corresponds to a line from the input.
    s = s . split ( "\n" ) ;

    // The first line of input is assigned to variable 'n'.
    // This often represents the size or count for subsequent data.
    var n = s [ 0 ] ;

    // The second line is split by spaces, and each part is converted to an integer.
    // This forms the array 'a'.
    var a = s [ 1 ] . split ( " " ) . map ( a => parseInt ( a ) ) ;

    // Similarly, the third line is processed to form array 'b'.
    var b = s [ 2 ] . split ( " " ) . map ( a => parseInt ( a ) ) ;


    // Calculate the sum of all elements in array 'a'.
    var sa = a . reduce ( ( a , b ) => a + b ) ;

    // Calculate the sum of all elements in array 'b'.
    var sb = b . reduce ( ( a , b ) => a + b ) ;

    // Initialize a counter variable 'ab' to zero.
    var ab = 0 ;

    // Loop through the arrays from index 0 up to (but not including) 'n'.
    for ( var i = 0 ; i < n ; i ++ )
    {
        // In each iteration, calculate a value based on elements of 'a' and 'b'.
        // This value is then added to 'ab'.
        // The calculation involves finding the maximum of (b[i] - a[i]) and 0,
        // dividing by 2, and then taking the ceiling of the result.
        ab += Math . ceil ( Math . max ( b [ i ] - a [ i ] , 0 ) / 2 ) ;
    }

    // Finally, print "Yes" if 'ab' is less than or equal to (sb - sa),
    // otherwise print "No". This is a conditional output.
    console . log ( ab <= sb - sa ? "Yes" : "No" ) ;
}

// This part of the code handles reading the input from the standard input stream.
// It uses Node.js's 'fs' module to read the file, decodes it as UTF-8,
// and then trims any leading or trailing whitespace before passing it
// as an argument to the 'Main' function.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) . trim ( ) ) ;