/*
 * This section handles standard input setup.
 * It ensures the process can receive and decode incoming data.
 */
process.stdin.resume(); // Reactivate the standard input stream.

process.stdin.setEncoding('ascii'); /* Set the encoding for input data to ASCII. */

var input_stdin = "";             // Initialize a string to accumulate all input data.
var input_stdin_array = "";       // This will later hold the input data split by newlines.
var input_currentline = 0;        /* Keep track of the current line being read from input_stdin_array. */

// Register an event listener for incoming 'data' on stdin.
process.stdin.on('data', function (data) {
    // Append the received data chunk to the input_stdin string.
    input_stdin += data;
});

// Handle the SIGINT signal (e.g., Ctrl+C) gracefully.
process.on( 'SIGINT', function ( ) {
    // When SIGINT is received, process all accumulated input.
    input_stdin_array = input_stdin.split ( "\n" );
    main ( ); // Call the main logic function.
    process.exit ( ); // Terminate the process cleanly.
} );

// Register an event listener for the 'end' of the input stream.
process.stdin.on( 'end', function ( ) {
    /* Once all input has been received, split it into an array of lines. */
    input_stdin_array = input_stdin.split ( "\n" );
    // Execute the core logic of the program.
    main ( );
} );

/**
 * Reads a line from the processed input array.
 * @returns {string} The next line of input.
 */
function readLine ( ) {
    // Retrieve the line at the current index and then increment the index for the next call.
    return input_stdin_array [ input_currentline++ ];
}

// --------------------- Input handling ends here --------------------------

/*
 * This is the primary function where the actual problem logic resides.
 * It processes the input and calculates the required output.
 */
function main ( ) {

    // Read the first line, which contains the integer N.
    var N = parseInt ( readLine ( ) );

    // Initialize two arrays: A for storing parsed numbers, and C for counts.
    var A = [ ], C = [ ];

    // Read the second line, which contains space-separated numbers, and split it.
    var s = readLine ( ).split ( " " );

    // Loop N times to populate arrays A and C.
    for ( var i = 0; i < N; i++ ) {
        // Parse each string in 's' to an integer and push to array A.
        A.push ( parseInt ( s [ i ] ) );
        // Initialize corresponding element in C to 2.
        C.push ( 2 );
    }

    // Adjust the count for the first element in C.
    C [ 0 ] = 1;

    // Second loop to update counts in array C based on values in A.
    for ( var i = 0; i < N; i++ )
        C [ A [ i ] ]--; // Decrement the count at index A[i].

    /*
     * This block performs an initial check for validity.
     * It determines the starting point for iteration based on N's parity.
     */
    var ini; // Variable to store the initial index for the check loop.

    if ( N % 2 == 1 ) { // If N is odd...
        ini = 0;        // Start checking from index 0.
    } else {            // If N is even...
        ini = 1;        // Start checking from index 1.
    }

    // Iterate through C, checking elements at specific indices.
    for ( var i = ini; i < N; i += 2 ) {
        if ( C [ i ] != 0 ) { // If a count is not zero, it's an invalid configuration.
            console.log ( "0" ); // Output "0" as the result.
            return;              // Exit the function early.
        }
    }

    /*
     * If all checks pass, proceed to calculate the final answer.
     * This involves powers of 2.
     */
    var ans = 1; // Initialize the answer variable.

    // Loop to calculate 2^(N/2) or similar based on problem logic.
    for ( var i = 1; i < N; i += 2 ) {
        ans *= 2; // Multiply 'ans' by 2 in each iteration.
    }

    // Convert the final answer to a string and print it to the console.
    console.log ( ans.toString ( ) );
}