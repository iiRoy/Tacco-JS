/*
 * This is the primary function definition.
 * It processes a numerical input to calculate and display a specific value.
 * The function name and parameters are kept exactly as in the original.
 */
function   main   (   input   )
{
    // Declare a local variable 'value'.
    // It stores the integer representation of the trimmed input string.
    // The radix '10' is explicitly provided for parseInt.
    var   value   =   parseInt   (   input   .   trim   (   )   ,   10   )   ;


    // Log the calculated result to the console.
    // The calculation involves subtracting 2 from 'value', multiplying by 180,
    // and then taking the floor of the entire result.
    // This formula is often used for the sum of interior angles of a polygon (n-2)*180.
    console   .   log   (   Math   .   floor   (   (   (   value   -   2   )   *   180   )   )   )   ;
}


// --- Program execution starts here ---

/*
 * The main function is invoked with input read from standard input.
 * Node.js 'fs' module is used to synchronously read the file "/dev/stdin"
 * and the content is interpreted as 'utf8' encoded text.
 */
main   (   require   (   "fs"   )   .   readFileSync   (   "/dev/stdin"   ,   "utf8"   )   )   ;