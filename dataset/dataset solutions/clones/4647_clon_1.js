/*
 * This file contains the main logic for processing input and generating output.
 * It demonstrates a Type I code clone, preserving functionality while altering
 * whitespace and comments.
 */
function   myout  (   text   )
{

    // This function is a simple wrapper for console.log.
    // It prints the given text to the standard output stream.
    console.log ( text ) ;

}

/*
 * The primary entry point for the program.
 * It takes raw input, processes it, and then prints the result.
 */
function   Main   (   input   )
{

    // Original comments that were part of the initial code base.
    // input = parseInt(input);
    // input = input.split(" ");


    // Essential step: Split the entire input string by newline characters.
    // This prepares the input for line-by-line processing.
    input  =  input.split ( "\n" ) ;


    // More original comments, kept for reference.
    // input = input.split(" ").map((a)=>Number(a));
    // input = input.split("\n").map((a)=>Number(a));


    // Initialize an empty string to accumulate the final output.
    var   output   =   ""   ;

    // Iterate through the characters of the first line of input.
    // We assume input[0] and input[1] have at least the length being iterated.
    for  (  var   i   =   0   ;   i   <   input [ 0 ] . length   ;   i ++   )
    {
        // Concatenate characters from the first and second lines of input.
        // This forms the interleaved output string.
        output  +=  input [ 0 ] . slice ( i , i + 1 )  +  input [ 1 ] . slice ( i , i + 1 ) ;
    }

    // Output the final generated string using our custom output function.
    myout ( output ) ;

}

// This section handles reading input from standard input,
// processing it, and then invoking the main application logic.

Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) . trim ( ) ) ;

// End of file.