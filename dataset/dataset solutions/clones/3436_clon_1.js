/*
 * This is a JavaScript program designed to solve a specific combinatorial problem.
 * It processes an input string, performs calculations, and then prints the result.
 */
function Main(input) { // Main entry point function
    // Split the input string by newline characters to get an array of lines.
    input = input . split ( "\n" ) ;

    // Parse the first element of the input array as an integer N.
    var N = parseInt( input[0] );

    // Initialize an array X of size 101 with all elements set to 0.
    // This array will store counts related to prime factors.
    X = new Array( 101 ) . fill( 0 );


    // Loop from 1 up to N (inclusive)
    for ( i = 1 ; i <= N ; i++ ) {
        var a = i; // Current number being factorized

        // Inner loop for prime factorization
        for ( j = 2 ; j <= a ; j ) { // j starts from 2 and goes up to a
            // Check if j is a factor of a
            if ( a % j == 0 ) {
                X[j] ++; // Increment count for prime factor j
                a = a / j; // Divide a by j
                if ( a == 1 ) { // If a becomes 1, factorization is complete
                    break;
                }
            } else {
                j ++; // Increment j if it's not a factor
            }
        }
    }

    // Initialize counters for specific conditions
    var four = 0; // Counts elements in X that are >= 4
    var three = 0; // Counts elements in X that are 2 or 3

    // Iterate through the X array to populate 'four' and 'three' counters
    for ( i = 2 ; i < 101 ; i++ ) {
        if ( X[i] == 2 || X[i] == 3 ) {
            three ++; // Increment 'three' if X[i] is 2 or 3
        }
        if ( X[i] >= 4 ) {
            four ++; // Increment 'four' if X[i] is 4 or more
        }
    }

    // Calculate the final answer based on 'three' and 'four'
    // This formula appears to be for combinations or permutations.
    var ans = three * four * ( four - 1 ) / 2 + four * ( four - 1 ) * ( four - 2 ) / 2 ;

    // Print the calculated answer to the console.
    console.log( '%s' , ans );
}



/**
 * This function is for debugging purposes, typically called when a "Run" button is pressed in a UI.
 * It retrieves input from a text area and passes it to the Main function.
 * @returns {void}
 */
function debug() {
    var input = document . getElementById( "input" ) . value ; // Get input from a DOM element
    Main( input ); // Call the main processing function
}


// This section handles execution when the script is run in a Node.js environment.
// It reads input from standard input and passes it to the Main function.
Main( require( "fs" ) . readFileSync( "/dev/stdin" , "utf8" ) ); // Execute the main function with input from stdin