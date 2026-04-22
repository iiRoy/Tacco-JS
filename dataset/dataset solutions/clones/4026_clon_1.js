/*
 * This script reads input from stdin, processes it,
 * and prints a calculated result to stdout.
 * It's designed to solve a specific algorithmic problem.
 */
const   fs   =   require ( 'fs' ) ; /* Import the Node.js file system module */

/**
 * The main function that orchestrates the problem-solving logic.
 * @param {string} input - The raw input string read from stdin.
 */
function  main ( input )
{
    // Split the input string into an array of lines
    var   arr   =   input . split ( '\n' ) ;

    /*
     * The first line of input typically contains the number of elements (N),
     * although it's not explicitly used in the final calculation here,
     * it's parsed for completeness or potential future use.
     */
    var   N   =   parseInt ( arr [ 0 ] ,   10 ) ;

    // The second line contains space-separated numbers
    var   a   =   arr [ 1 ] . split ( ' ' ) ;

    // Convert string array 'a' to an array of integers
    a   =   a . map ( n   =>   parseInt ( n ,   10 ) ) ;

    // Sort the array 'a' in descending order
    a . sort ( ) . reverse ( ) ;


    /*
     * Initialize two accumulators for sums.
     * sa will store sum for player A (even indices after sorting).
     * sb will store sum for player B (odd indices after sorting).
     */
    var   sa   =   0 ;
    var   sb   =   0 ;

    // Iterate through the sorted array to distribute values
    a . forEach ( ( v ,   i )   =>   {
        // If index 'i' is odd (1, 3, 5...), add value 'v' to sb
        // Otherwise (if 'i' is even: 0, 2, 4...), add 'v' to sa
        ( i   &   1 )   ?   sb   +=   v   :   sa   +=   v ;
    } ) ;


    // Calculate the final answer: difference between player A's sum and player B's sum
    var   ans   =   sa   -   sb ;

    // Output the result to the console
    console . log ( ans ) ;
}


// Read the entire input from standard input synchronously as a UTF-8 string.
var   input   =   fs . readFileSync ( '/dev/stdin' ,   'utf8' ) ;

// Call the main function with the read input.
main ( input ) ;