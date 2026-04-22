/*
 * This file contains a JavaScript program designed to process numerical input
 * and perform calculations based on a specific mathematical flow.
 *
 * The main function orchestrates the reading of input lines,
 * parsing them, and then invoking a helper function for the core logic.
 */
function   main( input )
{
    // Split the entire input string into an array of individual lines.
    // Each line is expected to contain space-separated numbers.
    const   lines   =   input.split( '\n' ) ;


    // Iterate over each line obtained from the input.
    lines.forEach(  line  =>   {

        // Skip processing if the line is empty.
        // This handles potential blank lines at the end of input or in between.
        if  (  line.length   ===   0  )
        {
            return ; // Move to the next line immediately.
        }

        /*
         *  Parse the current line.
         *  It's expected to contain four space-separated integer values.
         */
        const   vs   =   line.split( ' ' ) ;


        // Call the 'flow' function with the parsed integers and print its result.
        // parseInt is used with radix 10 for explicit decimal conversion.
        console.log( flow (
            parseInt( vs[0] ,   10 ) , // First integer value from the line.
            parseInt( vs[1] ,   10 ) , // Second integer value.
            parseInt( vs[2] ,   10 ) , // Third integer value.
            parseInt( vs[3] ,   10 )   // Fourth integer value.
        ) ) ;

    } ) ;

}


/*
 * The 'flow' function implements the core mathematical logic.
 * It calculates a specific value based on four input parameters: a, b, c, and d.
 * This function likely determines a count within a range, excluding multiples of c and d,
 * but including multiples of their product (c*d) to correct for double exclusion.
 */
function   flow ( a ,   b ,   c ,   d )
{
    // The calculation involves the principle of inclusion-exclusion.
    // (b - a + 1) gives the total numbers in the range [a, b] inclusive.
    // 'count' function determines multiples of a given divisor within the range.
    return   (   b   -   a   +   1   )   -   count ( a ,   b ,   c )   -   count ( a ,   b ,   d )   +   count ( a ,   b ,   c * d ) ;
}


/*
 * The 'count' function calculates how many multiples of 'devide' exist
 * within the inclusive range [min, max].
 *
 * It uses integer division (Math.floor) to find the number of multiples
 * up to 'max' and up to 'min - 1', then subtracts them to get the count
 * within the specified range.
 */
function   count ( min ,   max ,   devide )
{
    // Calculate total multiples of 'devide' up to 'max'.
    const   total   =   Math.floor(   max   /   devide   ) ;

    // Calculate total multiples of 'devide' up to 'min - 1'.
    // This gives us the number of multiples *before* the start of our range.
    const   diff   =   Math.floor(   (   min   -   1   )   /   devide   ) ;

    // The difference between 'total' and 'diff' gives the number of multiples
    // within the range [min, max].
    return   total   -   diff ;
}


// This is the entry point of the script when executed.
// It reads the entire content of standard input as a UTF-8 string
// and passes it to the 'main' function for processing.
main (   require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' )   ) ;