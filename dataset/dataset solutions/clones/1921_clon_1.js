"use strict" ; /* This directive enforces strict mode for the entire script. */


const   main = arg  =>   {

    // Process the input argument by trimming whitespace and splitting into lines.
    const   input   =   arg.trim( ) .split( "\n" ) ;


    const   [ N ,   M ,   Q ]   =   input[0] .split( " " ) .map( el => parseInt(el) ) ;
    let     list    =   [ ] ; // Initialize an empty list to store query details.

    /* Loop through the remaining input lines to populate the 'list' array. */
    for ( let   i   =   1 ;   i <= Q ;   i++ )   {
        list.push( input[i] .split( " " ) .map( el => parseInt(el) ) ) ;
    }


    let     ans     =   0 ; // Initialize the maximum score found so far.


    /*
     * Define a recursive depth-first search (DFS) function.
     * This function explores combinations to find the maximum possible score.
     */
    const   dfs     =   function ( parent ,   sub )   {

        // Base case: If the 'sub' array has N elements, a complete sequence is formed.
        if ( sub.length   ==   N )   {
            let     tmp     =   0 ; // Temporary variable to store the score for the current sequence.

            // Iterate through each query to calculate the score.
            for ( let   i   =   0 ;   i < Q ;   i++ )   {
                // Check if the condition for the current query is met.
                if ( sub[ list[i][1] - 1 ]   -   sub[ list[i][0] - 1 ]   ==   list[i][2] )   {
                    tmp     +=   list[i][3] ; // Add the points for this query if the condition is true.
                }
            }
            ans     =   Math.max( ans ,   tmp ) ; // Update the maximum answer.
            return ; // End recursion for this branch.
        }


        // Recursive step: Explore possibilities by adding elements to 'sub'.
        for ( let   i   =   parent ;   i <= M ;   i++ )   {
            sub.push( i ) ; // Add the current number 'i' to the sequence.
            dfs( i ,   sub ) ; // Recursively call DFS with 'i' as the new parent.
            sub.pop( ) ; // Backtrack: remove 'i' to explore other branches.
        }
    } ;


    dfs( 1 ,   [ ] ) ; // Start the DFS with initial parameters.
    console.log( ans ) ; // Output the final maximum answer.
} ;

// Read input from stdin and pass it to the main function.
main( require( 'fs' ) .readFileSync( '/dev/stdin' ,   'utf8' ) ) ;