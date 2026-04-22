/*
 * This JavaScript file contains the implementation of the main function
 * to solve a specific problem.
 * It reads input, processes it, and prints the result to the console.
 */
const main =  ( input )  =>  {

    // Step 1: Process the input string.
    // Remove leading/trailing whitespace and split into an array of characters.
    var  inputs  =  input . trim() . split( "" ) ;

    /*
     * Initialize two counters: 'ansa' and 'ansb'.
     * These counters will store the number of mismatches for two different patterns.
     * 'ansa' tracks mismatches for a 010101... pattern (where even indices are 0, odd are 1).
     * 'ansb' tracks mismatches for a 101010... pattern (where even indices are 1, odd are 0).
     */
    var  ansa  =  ansb  =  0 ;


    // Loop through each character in the processed input array.
    // The goal is to count how many changes are needed to make the string
    // either "010101..." or "101010...".
    for  ( var  i = 0 ;  i < inputs . length ;  i++ )  {
        // Convert the current character to a number.
        // The '- 0' operation implicitly converts the string digit to an integer.
        var  pt  =  inputs[ i ]  -  0 ;

        // Check if the current index 'i' is even.
        if  ( i % 2  ==  0 )  {
            // For an even index:
            // If we're trying to match "010101...", we expect a '0'.
            // If we're trying to match "101010...", we expect a '1'.
            if  ( pt == 1 )  { // Current char is '1', but expected '0' for the 010101... pattern.
                ansa++ ; // Increment mismatch for the 010101... pattern.
            }
            else  { // Current char is '0', but expected '1' for the 101010... pattern.
                ansb++ ; // Increment mismatch for the 101010... pattern.
            }
        }
        else  { // If the current index 'i' is odd.
            // For an odd index:
            // If we're trying to match "010101...", we expect a '1'.
            // If we're trying to match "101010...", we expect a '0'.
            if  ( pt == 0 )  { // Current char is '0', but expected '1' for the 010101... pattern.
                ansa++ ; // Increment mismatch for the 010101... pattern.
            }
            else  { // Current char is '1', but expected '0' for the 101010... pattern.
                ansb++ ; // Increment mismatch for the 101010... pattern.
            }
        }
    } // End of the main processing loop for characters.


    // Output the minimum of the two mismatch counts.
    // This value represents the fewest changes needed to transform the input
    // into a perfectly alternating binary string.
    console . log( Math . min( ansa , ansb ) ) ;

}


/*
 * This section handles reading the input from standard input
 * and then calling the 'main' function with that input.
 * It uses Node.js 'fs' module to synchronously read the entire file
 * located at '/dev/stdin' (standard input usually) with UTF-8 encoding.
 */
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' ,  'UTF-8' ) ) ;