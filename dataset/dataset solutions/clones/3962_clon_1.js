/*
 * This script processes a list of strings, categorizing them as "blue" or "red"
 * and then calculating a net score for each unique string.
 * The final output is the maximum net score found, or 0 if all scores are negative.
 *
 * Input format:
 * N
 * blue_item_1
 * ...
 * blue_item_N
 * M
 * red_item_1
 * ...
 * red_item_M
 */

// The primary function responsible for handling the input and computing the result.
function main ( input ) {

    // Split the entire input string into an array of lines.
    const args = input . split ( '\n' ) ;

    // Parse the first line to get the count of "blue" items.
    const N = parseInt ( args [ 0 ] , 10 ) ;

    // Parse the line immediately following the "blue" items to get the count of "red" items.
    // The index for M is N + 1, because args[0] is N, and args[1] through args[N] are the blue items.
    const M = parseInt ( args [ N + 1 ] , 10 ) ;

    // Initialize an empty object to store the counts/scores for each unique item string.
    data = { } ;

    // Declare an array to hold all the "blue" item strings.
    let blues = [ ] ;

    // Declare an array to hold all the "red" item strings.
    let reds = [ ] ;

    // Declare a variable to store the ultimate answer (maximum net score).
    let ans ;


    // Populate the 'blues' array with strings from the input.
    // Blue items are located from index 1 up to N (inclusive).
    for ( let i = 1 ; i <= N ; i ++ ) {
        blues . push ( args [ i ] ) ;
    }


    // Populate the 'reds' array with strings from the input.
    // Red items are located from index N + 2 up to N + M + 1 (inclusive).
    for ( let i = ( N + 2 ) ; i <= ( N + M + 1 ) ; i ++ ) {
        reds . push ( args [ i ] ) ;
    }


    // Iterate through the 'blues' array to update counts in the 'data' object.
    // Each blue item increments its corresponding count by 1.
    for ( let i = 0 ; i < blues . length ; i ++ ) {
        // Get the current blue item string.
        key = blues [ i ] ;
        // If the key already exists, increment its value; otherwise, initialize it to 1.
        data [ key ] = data [ key ] ? data [ key ] + 1 : 1 ;
    }


    // Iterate through the 'reds' array to update counts in the 'data' object.
    // Each red item decrements its corresponding count by 1.
    for ( let i = 0 ; i < reds . length ; i ++ ) {
        // Get the current red item string.
        key = reds [ i ] ;
        // If the key already exists, decrement its value; otherwise, initialize it to -1.
        data [ key ] = data [ key ] ? data [ key ] - 1 : -1 ;
    }


    // Iterate through the 'data' object to find the maximum net score.
    for ( key in data ) {
        // If 'ans' is not yet defined, or if the current item's score is greater than 'ans'.
        if ( ! ans || data [ key ] > ans ) {
            // Update 'ans' to the current item's score.
            ans = data [ key ] ;
        }
    }


    // Determine the final output based on the calculated maximum net score.
    // If 'ans' is negative, the problem specifies output should be 0.
    if ( ans < 0 ) {
        console . log ( 0 ) ;
    }
    // Otherwise, output the calculated 'ans'.
    else {
        console . log ( ans ) ;
    }
}

// Invoke the main function, passing in data read from standard input.
// This typically involves reading the entire file content as a UTF-8 string.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;