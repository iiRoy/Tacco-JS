/*
 * This is a Type I clone of some JavaScript code.
 * All identifiers, keywords, operators, and expressions are kept identical.
 * Only whitespace and comments have been altered significantly.
 */
'use strict' ; // Ensure strict mode is enabled for the entire script.


process.stdin.resume( ) ; /* Activate the standard input stream, keeping the process alive. */


process.stdin.setEncoding( 'utf8' ) ; // Set the character encoding for incoming data to UTF-8.


let line = '' ; // Declare and initialize an empty string variable to accumulate input data.

// Register an event listener for the 'data' event on the standard input stream.
process.stdin.on( 'data' ,    function ( chunk ) {
        line = line + chunk ; // Concatenate each received data chunk to the 'line' variable.
} ) ;


process.stdin.on( 'end' , function ( ) { // Register an event listener for the 'end' event on the standard input stream.

    // Split the accumulated 'line' string by one or more whitespace characters into an array of strings.
    const values = line.split( /\s+/ ) ;

    // Call function 'b' with a processed subset of 'values' and then print the returned result to the console.
    // The subset excludes the first and last elements, and each remaining element is parsed as an integer.
    console.log( b ( values.slice ( 1 , values.length - 1 ) .map ( x => parseInt ( x ) ) ) ) ;

    process.exit( 0 ) ; // Terminate the Node.js process successfully with an exit code of 0.
} ) ;


/*
 * This function, named 'b', takes an array of numbers and performs a specific
 * iterative reduction and summation operation.
 */
function b ( arr ) {

    let total = 0 ; // Initialize an accumulator variable to store the running total.

    // Loop continues as long as the input array 'arr' contains elements.
    while ( arr.length !== 0 ) {

        let next = [ ] ; // Declare and initialize an empty array to store elements for the next iteration.

        total += arr[0] ; // Add the first element of the current 'arr' to the 'total'.

        // Use the 'reduce' method on the current 'arr' to generate 'next' and further update 'total'.
        arr.reduce( ( pre , num ) => {
            next.push( Math.min ( pre , num ) ) ; // Add the smaller of the 'pre' (previous element) and 'num' (current element) to 'next'.
            total += num ; // Add the 'num' (current element) to the running 'total'.
            return num ; // Return 'num' to be used as 'pre' in the next iteration of 'reduce'.
        } ) ;

        arr = next ; // Replace the current 'arr' with the 'next' array for the subsequent iteration of the 'while' loop.
    }

    return total ; // Return the final calculated 'total' after all iterations are complete.
}