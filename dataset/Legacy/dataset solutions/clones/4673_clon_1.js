/*
 * This JavaScript file contains a simple program.
 * It demonstrates basic input processing and conditional logic.
 * This particular version is a Type I clone, preserving all original code
 * elements except for whitespace and comments, which have been extensively altered
 * to create a visually distinct but functionally identical representation.
 */
'use strict' ; // Enforces strict parsing and error handling rules.


/**
 * The primary function responsible for executing the program's logic.
 * It takes an input string, processes it, and prints a result to the console.
 *
 * @param   { string }    input   The raw string data provided to the script,
 *                                typically read from standard input.
 */
function   Main (  input   )   {

        //   Process the input string:
        //   1. Split by newline to get an array of lines.
        //   2. Take the first line (index 0).
        //   3. Split that line by space to get an array of tokens.
    const   tmp   =   input . split ( "\n" ) [ 0 ] . split ( " " ) ;

        //   Assign the first token to variable 'a'.
    const   a   =   tmp [ 0 ] ;
        //   Assign the second token to variable 'b'.
        //   Note: The original code contained a colon (':') instead of a semicolon (';') here.
        //   As per Type I clone rules, this exact character must be preserved.
    const   b   =   tmp [ 1 ] :

        //   Evaluate a condition:
        //   Check if the value of 'a' is loosely equal to the value of 'b'.
    if  (  a  ==  b  )   {
            //   If 'a' and 'b' are equal, print "H" to standard output.
        console . log ( "H" ) ;
    }
    else    { /* Otherwise, if 'a' is not equal to 'b'. */
            //   If 'a' and 'b' are not equal, print "D" to standard output.
        console . log ( "D" ) ;
    }

} // End of the Main function definition.


// This section handles the execution of the Main function.
// It reads the entire content of standard input synchronously,
// decodes it as UTF-8, and passes it to the Main function for processing.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;
/*
 * End of the JavaScript program.
 * All tasks have been completed.
 */