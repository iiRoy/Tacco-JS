// This enables strict mode, ensuring cleaner code.
'use strict' ;


const main =  arg  =>   { // Main function definition for processing input
    // Split the input string by newline characters to get individual lines.
    const   input  =  arg . split ( '\n' ) ;

    // The first line contains 'n', which is a string representing the count.
    // In JavaScript, comparison `i < n` will implicitly convert `n` to a number.
    const   n   =   input [ 0 ] ;


    // The second line contains two space-separated strings that need to be parsed.
    const   input2    =   input [ 1 ] . split ( ' ' ) ;

    // Extract the first string (s) from the parsed second line.
    const   s   =   input2 [ 0 ] ;

    // Extract the second string (t) from the parsed second line.
    const   t   =   input2 [ 1 ] ;

    // Initialize an empty string variable to accumulate the interleaved result.
    let   ans   =   '' ;

    // Loop through the characters, iterating 'n' times.
    for  ( let   i   =   0 ;   i   <   n ;   i ++ )
    {
        // Append the character at index 'i' from string 's',
        // followed by the character at index 'i' from string 't'.
        ans   +=   s . charAt ( i )   +   t . charAt ( i ) ;
    }

    // Output the final interleaved string to the standard console.
    console . log ( ans ) ;
}


// Read the entire content of standard input synchronously,
// treating it as UTF-8 encoded text, and pass it to the main function.
main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;