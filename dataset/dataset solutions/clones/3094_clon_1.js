/*
 * This JavaScript function serves as a simple DNA base pair completer.
 * It takes a single character representing a DNA base as input
 * and outputs its complementary base.
 *
 * Complementary rules:
 *   'A' -> 'T'
 *   'T' -> 'A'
 *   'C' -> 'G'
 *   Any other input (e.g., 'G') -> 'C'
 */
function   main   (   input   )
{
        // Declare a constant 'S' to store the processed input.
        const   S   =   input   ;


    // Begin conditional logic to determine the complementary base.
    if  (   S   ===   'A'   )
    {
        // If the input is Adenine, output Thymine.
        console   .   log   (   'T'   )   ;
    }
    else
    if  (   S   ===   'T'   )
    {
        // If the input is Thymine, output Adenine.
        console   .   log   (   'A'   )   ;
    }
    else
    if  (   S   ===   'C'   )
    {
        // If the input is Cytosine, output Guanine.
        console   .   log   (   'G'   )   ;
    }
    else
    {
        // For any other input (implicitly Guanine or an invalid character),
        // output Cytosine as the default complement.
        console   .   log   (   'C'   )   ;
    }
} // End of the main function definition.



// This section handles reading input from the standard input stream.
// It uses Node.js 'fs' module to read the file at '/dev/stdin'
// and decodes it using 'utf8' encoding. The result is then passed
// to the 'main' function for processing.
main (   require   (   'fs'   )   .   readFileSync   (   '/dev/stdin'   ,   'utf8'   )   )   ;
/* End of script. */