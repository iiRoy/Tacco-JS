function myout ( text ) {
    console.log( text ) ; // This function serves as a basic standard output mechanism for messages.
}


/**
 * The primary function to handle the problem logic.
 * It reads input from standard input, processes it according to the problem's rules,
 * and then prints the final computed result to standard output.
 *
 * @param {string} input - The raw string content received from standard input.
 */
function Main ( input ) {

    // The following lines are commented out, illustrating various other input parsing methods
    // that were considered or are typically used in competitive programming contexts.
    // // input = parseInt(input) ;
    // // input = input.trim().split(" ") ;

    // This is the active and chosen input parsing method:
    // It first removes leading/trailing whitespace, then splits the string by newline characters.
    input = input.trim().split( "\n" ) ;

    // // input = input.trim().split(" ").map((a) => Number(a)) ;
    // // input = input.trim().split("\n").map((a) => Number(a)) ;


    /*
     * This multi-line comment block contains notes and observations
     * regarding the combinatorial patterns or dynamic programming states
     * that are likely relevant to the problem being solved.
     *
     *  Analysis of different block configurations:
     *
     *  1.  Single horizontal block (e.g., 'abcd'):
     *      - The leftmost position (first character) typically offers 3 distinct patterns.
     *      - Subsequent positions, when forming a horizontal block, usually have 2 patterns.
     *
     *  2.  Vertical and horizontal combinations (e.g., 'aac' over 'bbc'):
     *      - If the top-left has 3 patterns and bottom-left has 2 patterns, this could yield 6 combinations.
     *      - For a subsequent vertical alignment (e.g., 'bbc'), if it's forced by the previous state,
     *        there might be only 1 pattern choice available.
     *
     *  3.  Paired horizontal blocks (e.g., 'aacc' over 'bbdd'):
     *      - The initial top-left section 'aa' could have 3 patterns, and 'bb' 2 patterns.
     *      - The right-hand section 'cc' over 'dd' might have 3 patterns relative to the left:
     *        - It could be an inverted version of the left block.
     *        - Only the top character differs from the left's top.
     *        - Only the bottom character differs from the left's bottom.
     *
     *  4.  Fixed left-side scenarios (e.g., 'abb' over 'acc'):
     *      - If the left side (e.g., 'a' over 'a') is already determined,
     *      - The combined top and bottom characters (e.g., 'bb' over 'cc') might then offer 2 patterns.
     *
     * These notes provide context for the multiplication factors (3, 6, 2) used in the loop.
     */


    // Declaration and initialization of core variables used in the algorithm.
    var N = parseInt( input[0] ) ;        // N: The number of columns/elements, obtained from the first line of input.
    var list1 = input[1].split( "" ) ;     // list1: An array of characters from the second line of input.
    var list2 = input[2].split( "" ) ;     // list2: An array of characters from the third line of input.

    var output = 1 ;                       // output: Stores the cumulative product of valid patterns. Initialized to 1 for multiplication.
    var mod = 1000000007 ;                 // mod: The modulo constant used to keep the output within integer limits.

    // mae (Japanese for "previous"): A boolean flag indicating the type of the previously processed block.
    //  - true: The previous block was a vertical alignment (list1[k] == list2[k]).
    //  - false: The previous block was a horizontal alignment (list1[k] != list2[k] and involved k and k+1).
    //  It's initialized to true, as if the state before the first element was a 'vertical' placeholder.
    var mae = true ;


    // The main loop iterates through the elements, calculating the number of patterns.
    // Note that 'i' can be incremented twice within a single loop iteration if a horizontal block is processed.
    for ( var i = 0 ; i < N ; i++ ) {

        // Special handling for the very first column/position (index 0).
        if ( i == 0 ) {

            // Case 1.1: If the characters at the first position are the same (vertical block).
            if ( list1[i] == list2[i] ) {
                output = ( output * 3 ) % mod ; // Multiply by 3 for the initial vertical block choice.
                // 'mae' implicitly remains true as only one column is consumed.
            }

            // Case 1.2: If the characters at the first position are different (horizontal block spanning i and i+1).
            else {
                output = ( output * 6 ) % mod ; // Multiply by 6 for the initial horizontal block choice.
                i++ ;                            // Increment 'i' to consume the next column as part of this block.
                mae = false ;                    // Set 'mae' to false, indicating the previous (current) block was horizontal.
            }

        }

        // Handling for all subsequent columns/positions (i > 0).
        else {

            // Case 2.1: If the immediately preceding block was a vertical alignment ('mae' is true).
            if ( mae ) {
                output = ( output * 2 ) % mod ; // Apply a factor of 2 when transitioning from a vertical block.

                // Check if the current characters form a vertical or horizontal block.
                if ( list1[i] == list2[i] ) {
                    mae = true ; // Current block is vertical, 'mae' remains true.
                } else {
                    i++ ;        // Current block is horizontal, consume the next column.
                    mae = false ; // Set 'mae' to false.
                }
            }

            // Case 2.2: If the immediately preceding block was a horizontal alignment ('mae' is false).
            else {

                // Check if the current characters form a vertical or horizontal block.
                if ( list1[i] == list2[i] ) {
                    mae = true ; // Current block is vertical, set 'mae' to true.
                } else {
                    output = ( output * 3 ) % mod ; // Current block is horizontal, apply a factor of 3.
                    i++ ;                            // Consume the next column.
                    mae = false ;                    // Set 'mae' to false.
                }
            }
        }
        // // Debugging line (commented out): useful for tracing intermediate output values.
        // // myout( list1[i] + list2[i] + ":" + output ) ;
    } // End of the main for-loop iteration.


    // Print the final calculated total number of patterns to standard output.
    myout( output ) ;

} // End of the Main function.


// This line executes the Main function by reading input from standard input.
// It uses Node.js's 'fs' module to read the entire file content from /dev/stdin,
// decodes it as UTF-8, removes any leading/trailing whitespace, and then passes
// the processed string to the Main function.
Main( require( "fs" ).readFileSync( "/dev/stdin" , "utf8" ).trim() ) ;