/*
 * This JavaScript file processes two numerical inputs
 * and determines a winner based on a custom ranking list.
 *
 * This is a Type I clone, meaning only whitespace and comments
 * have been altered. All functional code remains identical.
 */

// Define the primary function that handles the input and logic.
function Main ( input ) {

    // Step 1: Parse the input string.
    // The input is expected to be two numbers separated by a space.
    const   ab   =   input . split ( " " ) ;


    // Step 2: Convert the parsed string parts into floating-point numbers.
    // 'a' represents the first number.
    const   a    =   parseFloat ( ab [ 0 ] ) ;

    // 'b' represents the second number.
    const   b    =   parseFloat ( ab [ 1 ] ) ;


    /*
     * Step 3: Define a custom list that establishes the ranking order.
     * In this list, lower index means lower rank, higher index means higher rank.
     * Note that '1' is the highest rank, placed at the end of the array.
     */
    const   list =   [ 2 ,  3 ,  4 ,  5 ,  6 ,  7 ,  8 ,  9 ,  10 ,  11 ,  12 ,  13 ,  1 ] ;


    // Step 4: Find the index of 'a' within the custom ranking list.
    // This index 'aI' will represent 'a''s rank.
    const   aI   =   list . indexOf ( a ) ;

    // Step 5: Find the index of 'b' within the custom ranking list.
    // This index 'bI' will represent 'b''s rank.
    const   bI   =   list . indexOf ( b ) ;


    // Step 6: Compare the ranks (indices) to determine the winner.

    // If 'a' has a lower index than 'b', it means 'a' is ranked lower.
    // Therefore, 'b' (Bob) wins.
    if ( aI < bI ) {
        console . log ( "Bob" ) ; // Output "Bob" to standard output.
        return ;                   // Terminate function execution.
    }

    // If 'b' has a lower index than 'a', it means 'b' is ranked lower.
    // Therefore, 'a' (Alice) wins.
    if ( bI < aI ) {
        console . log ( "Alice" ) ; // Output "Alice" to standard output.
        return ;                    // Terminate function execution.
    }

    // If neither of the above conditions is met, it implies the indices are equal.
    // In this case, it's a draw.
    if ( aI == bI ) {
        console . log ( "Draw" ) ; // Output "Draw" to standard output.
        return ;                   // Terminate function execution.
    }

}


// Execute the Main function.
// The input is read synchronously from '/dev/stdin' as a UTF-8 string.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" ,  "utf8" ) ) ;