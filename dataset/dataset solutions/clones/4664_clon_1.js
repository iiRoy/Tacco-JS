/*
 * Problem: ABC157 B - Checkpoints
 * This script processes student locations and checkpoint locations
 * to determine the closest checkpoint for each student.
 */

'use strict' ;


// The main function to process input and perform calculations.
function Main ( input ) {

    // Split the input string into lines and trim leading/trailing whitespace.
    const tmp = input . trim ( ) . split ( '\n' ) ;

    // Parse N (number of students) and M (number of checkpoints) from the first line.
    const NM = tmp [ 0 ] . split ( ' ' ) ;
    const N  = Number ( NM [ 0 ] ) ; // Number of students
    const M  = Number ( NM [ 1 ] ) ; // Number of checkpoints

    /*
     * Extract student coordinates.
     * Each student's coordinates are a pair of numbers.
     */
    let students =
        tmp
            . slice ( 1 , N + 1 ) // Get lines corresponding to students
            . map ( ( v ) => v . split ( ' ' ) . map ( ( v ) => Number ( v ) ) ) ;

    /*
     * Extract checkpoint coordinates.
     * Each checkpoint's coordinates are also a pair of numbers.
     */
    const checkpoints =
        tmp
            . slice ( N + 1 ) // Get lines corresponding to checkpoints
            . map ( ( v ) => v . split ( ' ' ) . map ( ( v ) => Number ( v ) ) ) ;

    // console.log ( N , M , students , checkpoints ) ; // Debugging line, commented out.

    // Iterate through each student to find their nearest checkpoint.
    for ( const student of students ) {

        let point = -1 ; // Stores the index (1-based) of the nearest checkpoint
        let near  = Number . MAX_VALUE ; // Stores the minimum distance found so far

        // Loop through all available checkpoints.
        for ( let i = 0 ; i < M ; i ++ ) {

            // Calculate Manhattan distance between the current student and checkpoint[i].
            const d = distance ( student , checkpoints [ i ] ) ;

            // If this checkpoint is closer than the previously closest one...
            if ( d < near ) {
                near  = d ;          // Update the minimum distance.
                point = i + 1 ;      // Update the 1-based index of the nearest checkpoint.
            }
        }

        // Output the 1-based index of the nearest checkpoint for the current student.
        console . log ( point ) ;
    }

    // Explicit return, though not strictly necessary for script termination.
    return ;
}


// Helper function to calculate the Manhattan distance between two points.
// Points a and b are arrays like [x, y].
function distance ( a , b ) {
    return Math . abs ( a [ 0 ] - b [ 0 ] ) + Math . abs ( a [ 1 ] - b [ 1 ] ) ;
}


// Read input from stdin and pass it to the Main function.
Main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;