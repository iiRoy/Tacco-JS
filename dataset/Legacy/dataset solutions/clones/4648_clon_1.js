/* This is a Type I clone of the original JavaScript code. */

// The 'Main' function processes the input string.
// It takes one argument, which is expected to be a multi-line string.
function   Main (   input   )   {


    // The initial input string is split into an array of strings.
    // Each element in the array represents a line from the original input.
    input  =  input.split ( "\n" ) ;


    // Declare a variable 'o'. This variable will hold the first line of input.
    var   o   =   input [ 0 ] ;


    // Declare another variable 'e'. This variable will hold the second line of input.
    var   e   =   input [ 1 ] ;


    /*
     * Begin a loop to iterate through the characters of both strings, interleaving them.
     * The loop counter 'i' goes from 0 up to (but not including) the sum of their lengths.
     *
     * Note: The 'int' keyword for variable declaration is kept as per the original code,
     * maintaining strict Type I cloning rules, even if it's not standard JavaScript syntax.
     */
    for ( int   i   =   0 ;   i   <   o.length   +   e.length ;   i++ )   {


        // Check if the current loop index 'i' is an even number.
        // The modulo operator '%' is used for this check.
        if   (   i % 2 == 0   )   {


            // If 'i' is even, print the character from string 'o' at index 'i / 2'.
            // This ensures characters from 'o' are taken at even positions in the output.
            console . log (   o [ i / 2 ]   ) ;


        }   else   { // If 'i' is not even, it must be an odd number.


            // If 'i' is odd, print the character from string 'e' at index 'i / 2'.
            // This ensures characters from 'e' are taken at odd positions in the output.
            console . log (   e [ i / 2 ]   ) ;


        }


    } // End of the character interleaving loop.


} // End of the 'Main' function.


// This part of the script is responsible for executing the 'Main' function.
// It reads the entire content of standard input ('/dev/stdin') as a UTF-8 string.
// The Node.js 'fs' (file system) module is used for synchronous file reading.
Main (   require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" )   ) ;

// The script finishes here.