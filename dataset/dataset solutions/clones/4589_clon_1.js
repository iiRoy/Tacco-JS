/*
 * This JavaScript code reads input from stdin, processes it, and then
 * prints a result to stdout. It's designed to solve a specific
 * numerical problem involving three integers.
 */

// Ensure the standard input stream remains open and active.
process.stdin.resume( );

// Set the encoding for standard input to 'utf8' to handle text data correctly.
process.stdin.setEncoding( 'utf8' );

// Initialize an empty array to store all incoming lines from standard input.
var   lines   =   [ ]

/*
 * Create an interface for reading lines from standard input.
 * The 'readline' module provides a convenient way to read input line by line.
 */
var   reader   =   require( 'readline' ).createInterface( {
    input   :   process.stdin,    // Specify standard input as the source for reading.
    output   :   process.stdout    // Specify standard output for potential output, though not directly used by this interface for printing.
} ) ;

// Attach an event listener for the 'line' event.
// This callback function is executed every time a new line of input is received.
reader.on( 'line',   ( line )   =>   {
    // Add the received line to the 'lines' array.
    lines.push( line ) ;
} ) ;

// Attach an event listener for the 'close' event.
// This callback function is executed once the input stream has ended and closed.
reader.on( 'close',   ( )   =>   {

    // The first line of input is expected to contain three space-separated numbers.
    // Split this line into an array of strings.
    var   abc   =   lines[ 0 ].split( ' ' ) ;

    // Convert the first string to a number and assign it to variable 'a'.
    var   a   =   Number( abc[ 0 ] ) ;
    // Convert the second string to a number and assign it to variable 'b'.
    var   b   =   Number( abc[ 1 ] ) ;
    // Convert the third string to a number and assign it to variable 'c'.
    var   c   =   Number( abc[ 2 ] ) ;

    // Initialize a counter variable 'i' to zero. This will count iterations.
    var   i   =   0 ;

    // Check for a specific edge case: if all three numbers are equal.
    if   ( a   ==   b   &&   b   ==   c )   {
        // If they are all equal, print "-1" as per problem specification.
        console.log( "-1" ) ;
    }

    // Begin an infinite loop. The loop will be explicitly exited using a 'break' statement.
    while   ( true )   {

        // Check if any of the numbers are odd.
        // The modulo operator '%' is used to determine if a number is odd (remainder 1 when divided by 2).
        if   ( a % 2   ==   1   ||   b % 2   ==   1   ||   c % 2   ==   1 )   {
            // If at least one number is odd, the loop terminates.
            break ;
        }

        // Calculate the new value for 'a' based on 'b' and 'c'.
        // This is part of the transformation rule for the numbers.
        var   tmpa   =   b / 2   +   c / 2 ;

        // Calculate the new value for 'b' based on 'a' and 'c'.
        var   tmpb   =   a / 2   +   c / 2 ;

        // Calculate the new value for 'c' based on 'b' and 'a'.
        var   tmpc   =   b / 2   +   a / 2 ;

        // Update 'a' with its newly calculated temporary value.
        a   =   tmpa ;
        // Update 'b' with its newly calculated temporary value.
        b   =   tmpb ;
        // Update 'c' with its newly calculated temporary value.
        c   =   tmpc ;

        // Increment the iteration counter 'i'.
        i++ ;

    }

    // After the loop terminates, print the final value of the counter 'i'.
    console.log( i ) ;

} ) ;