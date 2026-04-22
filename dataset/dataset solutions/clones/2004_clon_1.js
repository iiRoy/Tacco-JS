/*
 * This JavaScript module processes a specific type of input data
 * to determine if a certain condition is met based on numerical values.
 * It strictly adheres to Type I cloning rules, meaning only whitespace
 * and comments are altered from the original source.
 */
"use strict" ; // Enforces stricter parsing and error handling in the code.

// Defines the main execution function that accepts a single argument.
const main = ( arg ) => {

    // Step 1: Prepare the input data.
    // The input string is trimmed of leading/trailing whitespace
    // and then split into an array of lines.
    const input = arg . trim ( ) . split ( "\n" ) ;

    // Step 2: Parse essential parameters from the first line of input.
    // N represents a quantity, extracted from the first part of the first line.
    const N = Number ( input [ 0 ] . split ( " " ) [ 0 ] ) ;

    // M represents another critical quantity, from the second part of the first line.
    const M = Number ( input [ 0 ] . split ( " " ) [ 1 ] ) ;

    // Step 3: Parse the array of numbers from the second line of input.
    // Each string element is converted into its numerical representation.
    const A = input [ 1 ] . split ( " " ) . map ( n => Number ( n ) ) ;

    // Step 4: Calculate the total sum of all elements in array A.
    // This uses the reduce method to accumulate the sum.
    const total = A . reduce ( ( acc , curr ) => acc + curr ) ;

    // Step 5: Determine the threshold value.
    // This threshold is derived from the total sum and the parameter M.
    const thresh = total / ( 4 * M ) ;

    // Step 6: Sort array A in descending order.
    // This prepares the array for easily checking the top M elements.
    A . sort ( ) . reverse ( ) ;

    // Step 7: Iterate through the first M elements of the sorted array.
    // Check if any of these top M elements falls below the calculated threshold.
    for ( let i = 0 ; i < M ; i ++ ) {

        // If an element is found to be less than the threshold...
        if ( A [ i ] < thresh ) {

            // ...print "No" and terminate the function immediately.
            console . log ( "No" ) ;
            return ; // Exit early as the condition is not met.
        }
    }

    // If the loop completes without an early return, it implies
    // that all of the top M elements satisfy the threshold condition.
    console . log ( "Yes" ) ; // Print "Yes" as the condition is met.

} ; // End of the main function definition.


// This line is responsible for initiating the program.
// It reads the entire content of standard input ('/dev/stdin') as a UTF-8 string
// and passes it to the 'main' function for processing.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;