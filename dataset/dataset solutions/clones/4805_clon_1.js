/*
 * This JavaScript file processes numerical data to perform specific calculations.
 * It reads input, parses it, and then applies a series of modifications,
 * outputting the results of each adjustment.
 */
'use strict' ; // Enforces strict parsing and error handling rules.

/**
 * The primary function responsible for executing the program's logic.
 * It takes a raw input string, processes it, and prints results to the console.
 *
 * @param {string} input The complete input string, typically from standard input.
 */
function Main (   input   )
{
    // Step 1: Parse the initial input string into an array of lines.
    // .trim() removes leading/trailing whitespace, .split('\n') divides by newline characters.
    const tmp = input . trim ( ) . split ( '\n' ) ;

    // Step 2: Extract the first number (N) from the first line.
    const N = Number ( tmp[0] ) ;

    // Step 3: Extract the array of initial times (T) from the second line.
    // It's split by spaces and each part is converted to a number.
    const T = tmp[1] . split ( ' ' ) . map ( v => Number ( v ) ) ;

    // Step 4: Extract the number of modifications (M) from the third line.
    const M = Number ( tmp[2] ) ;

    // Step 5: Extract the array of modification details (PX) from the remaining lines.
    // .splice(3) removes elements from index 3 onwards from 'tmp' and returns them.
    const PX = tmp . splice ( 3 ) ;

    /*
     * The following line was used for debugging during development.
     * It's commented out in the final version to prevent verbose output.
     */
    // console.log(N, T, M, PX);


    // Step 6: Calculate the initial total sum of all times in the 'T' array.
    let defaltTime = 0 ;
    // Iterate over each value 'v' in the 'T' array.
    for ( const v of T )
    {
        defaltTime += v ; // Add each value to the running total.
    }


    // Step 7: Process each modification specified in the 'PX' array.
    // For every modification, calculate the adjusted total time and print it.
    for ( const v of PX )
    {
        // Parse the current modification string.
        // Each 'v' is a string like "index new_value".
        const tmp = v . split ( ' ' ) . map ( v => Number ( v ) ) ;

        // Calculate the difference caused by this modification.
        // tmp[0] is the 1-based index, tmp[1] is the new time value.
        // T[tmp[0] - 1] gets the original time value at that index.
        const diff = T [ tmp[0] - 1 ] - tmp[1] ;

        // Calculate the adjusted total time.
        // Subtract the 'diff' from the 'defaltTime' to get the new total.
        const time = defaltTime - diff ;

        // Output the calculated adjusted time for the current modification.
        console . log ( time ) ;
    }

} // End of the Main function definition.


// Immediately invoke the Main function upon script execution.
// It reads the entire content of '/dev/stdin' as a UTF-8 string.
Main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;