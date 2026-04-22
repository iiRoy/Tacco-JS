/*
 * This JavaScript file contains a function designed to compare
 * two input strings after some initial processing.
 *
 * This is a Type I clone of an original source code, meaning
 * all identifiers, expressions, and operators are preserved exactly.
 * Only whitespace (indentation, spacing, blank lines) and comments
 * have been modified extensively to create a visually distinct version.
 */



// --- Function Definition Start ---

function  Main ( input )

{
    // Declare a temporary variable to hold the split input.
    // The input string is split into an array of strings using the newline character as a delimiter.
    tmp  =  input.split ( "\n" ) ;


    // Assign the first element of the 'tmp' array to the variable 's'.
    // This typically represents the first line of the input.
    s  =  tmp[ 0 ] ;


    // Assign the second element of the 'tmp' array to the variable 't'.
    // This typically represents the second line of the input.
    t  =  tmp[ 1 ] ;



    // Calculate the length of the string 's' and store it in 'num'.
    // This length will be used for substring extraction.
    num  =  s.length ;


    // Extract a substring from 't' starting from index 0,
    // with a length equal to the value stored in 'num'.
    // This extracted substring is stored in the 'check' variable.
    check  =  t.substr ( 0 , num ) ;


    // Perform a comparison between string 's' and the 'check' substring.
    // This checks if 's' is identical to the initial part of 't' that has the same length as 's'.
    if  ( s  ==  check )
    {
        // If the strings are exactly equal, print "Yes" to the console.
        console.log ( "Yes" ) ;
    }

    else
    {
        // If the strings are not equal, print "No" to the console.
        console.log ( "No" ) ;
    }

} // --- End of Main Function Definition ---



// --- Program Execution Start ---

// This line reads the input from the standard input stream.
// It uses Node.js's 'fs' module to synchronously read the file
// located at '/dev/stdin' and decodes it as a 'utf8' string.
// The read content is then passed as an argument to the 'Main' function.
Main ( require ( "fs" ) .readFileSync ( "/dev/stdin" ,  "utf8" ) ) ;


// --- Program Execution End ---