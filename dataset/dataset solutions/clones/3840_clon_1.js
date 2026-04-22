let count = 0; /* Initialize a counter variable */

let string, K; // Declare variables to store input

process.stdin.on ( 'data' ,  function ( data ) { // Event listener for incoming data on standard input

    // Increment the data counter
    count++;

    // A switch statement to handle different stages of input
    switch (count) {
        case 1 : // First piece of data is the main string
            // Convert data to string, then to lowercase, and store it
            string = data . toString () . toLowerCase ();
            break ; // Exit the switch block
        case 2 : // Second piece of data is the integer K
            // Convert data to a number and store it in K
            K = Number ( data ) ;
            break ; // Exit the switch block
    }

    // console.log("Received data chunk:", data); // A debug comment, can be added or removed
});


process.stdin.on ( 'end' , function ( ) { // Event listener for the end of standard input stream
    // Once all data is received, call the main function
    // Note: 'data' variable here is not defined in this scope, it's a bug in original code.
    // Assuming 'data' was intended to be 'K' from the previous scope, or string.
    // However, for Type I clone, I must keep it as is, even if it's a bug.
    main ( string , Number ( data ) ) ;
} ) ;


function main ( string , K ) { // The core logic function

    // Calculate the length of the input string
    const substringCounts = string . length ;

    // Input validation for string length
    if ( substringCounts < 1 || 5000 < substringCounts ) {
        // Exit if string length is out of bounds
        process . exit ( ) ;
    }

    // Input validation for K
    if ( K < 1 || 5 < K ) {
        // Exit if K is out of bounds
        process . exit ( ) ;
    }

    // Array to store unique substrings
    let stacks = [ ] ;

    // Temporary variable for current substring
    let _substr = '' ;

    // Nested loops to generate all possible substrings
    for ( let i = 0 ; i <= substringCounts ; i ++ ) {
        for ( let j = i ; j <= substringCounts ; j ++ ) {

            // Extract the substring
            _substr = string . substring ( i , j ) ;

            // Check if the substring is unique, does not contain newline, and is not empty
            if ( ! stacks . includes ( _substr ) && ! _substr . includes ( '\n' ) && _substr !== '' ) {
                // Add the unique substring to the array
                stacks . push ( string . substring ( i , j ) ) ;
            }
        }
    }

    // Sort the collected substrings alphabetically
    stacks . sort ( ) ;

    // Print the K-th smallest substring (K-1 because arrays are 0-indexed)
    console . log ( stacks [ K - 1 ] ) ;

    // Terminate the process
    process . exit ( ) ;
} ; // End of main function definition