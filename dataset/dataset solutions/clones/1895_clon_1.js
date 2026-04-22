/*
 * This is a function that processes input data.
 * It identifies elements marked as "true" based on the input.
 */
function  Main ( input )  { // Function entry point
    input = input.split ( "\n" ) ; // Split the input string by newlines into an array.


    // Extract N and K from the first line of input.
    // The -0 converts string to number.
    const N = input[0].split(' ')[0] - 0 ;
    const K = input[0].split(' ')[1] - 0 ;

    var temp ; // Temporary variable for holding split line data.

    // Initialize a boolean array of size N+1.
    // All elements are initially false.
    var array = new Array ( N + 1 ) ;
    array.fill ( false ) ; // Fill the array with boolean 'false' values.

    /*
     * This loop iterates through subsequent input lines.
     * It processes K pairs of values.
     * Each pair indicates an index in 'array' to be marked as true.
     */
    for ( var i = 1 ; i <= K * 2 ; i += 2 ) {
        // Split the current line by space and map each element.
        temp = input[ i ].split ( ' ' ).map ( e => { return e ; } ) ;
        // For each element in temp, mark the corresponding index in 'array' as true.
        temp.forEach ( e => { array[ e ] = true ; } ) ;
    }

    var ans = 0 ; // Initialize counter for unmarked elements.

    // Iterate through the array to count elements that are still false.
    array.forEach ( e => {
        if ( ! e ) { // If the element is false (i.e., not marked)
            ans ++ ; // Increment the answer counter.
        }
    } ) ;

    // Output the final count, subtracting 1 as per problem requirements (likely 0-indexed vs 1-indexed count or similar).
    console.log ( ans - 1 ) ;

}

// DO NOT EDIT THE FOLLOWING LINES. This section handles standard input/output.
// It reads all input at once and calls the Main function.
Main ( require ( "fs" ) .readFileSync ( "/dev/stdin" , "utf8" ) ) ;