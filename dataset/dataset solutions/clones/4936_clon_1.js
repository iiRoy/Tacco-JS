/*
 * This JavaScript code processes input to determine student pass/fail status
 * based on specific criteria. It's designed to read from standard input
 * and write to standard output.
 */

// Resumes the standard input stream, allowing data to be read.
process.stdin.resume();


// Sets the character encoding for the standard input stream to UTF-8.
process.stdin.setEncoding('utf8');


var lines = [ ] ; // An array to store all lines read from standard input.

/*
 * Initializes a readline interface to handle input line by line.
 * This makes it easier to process stream-based input.
 */
var reader = require('readline').createInterface( {
    input: process.stdin ,  // Specifies standard input as the source.
    output: process.stdout  // Specifies standard output as the destination for prompts (though not used here).
} ) ;


reader.on( 'line' , ( line ) => {
    // This event listener is triggered for each new line of input.

    lines.push( line ) ; // Appends the current line to the 'lines' array.

} ) ;


reader.on( 'close' , () => {
    // This event listener is triggered when the input stream ends.

    // The first line of input is expected to contain three space-separated numbers: n, a, and b.
    var nab = lines[ 0 ].split( ' ' ) ;

    // 'n' represents the total number of students.
    var n = Number( nab[ 0 ] ) ;
    // 'a' represents the maximum number of 'a' type students who can pass.
    var a = Number( nab[ 1 ] ) ;
    // 'b' represents the maximum number of 'b' type students who can pass.
    var b = Number( nab[ 2 ] ) ;

    var pass = 0 ; // Counter for the total number of students who have passed.
    var ab = 1 ;   // Counter for the number of 'b' type students encountered so far.


    // The second line of input contains a string representing student types.
    var info = lines[ 1 ].split( '' ) ;

    /*
     * Iterates through each student to determine if they pass or fail.
     * The loop runs 'n' times, once for each student.
     */
    for ( i = 0 ; i < n ; i++ ) {

        // A switch statement is used to handle different student types.
        switch ( info[ i ] ) {

            case 'a' :
                // Student type 'a':
                // They pass if the total 'pass' count is less than (a + b).
                if ( pass < a + b ) {
                    console.log( "Yes" ) ; // Output "Yes" if student passes.
                    pass++ ;                 // Increment the total passed count.
                    break ;
                } else {
                    console.log( "No" ) ;    // Output "No" if student does not pass.
                    break ; ;                // Note: double semicolon, as in original code.
                }


            case 'b' :
                // Student type 'b':
                // They pass if the total 'pass' count is less than (a + b)
                // AND the number of 'b' students encountered so far ('ab')
                // is less than or equal to 'b'.
                if ( pass < a + b && b >= ab ) {
                    console.log( "Yes" ) ; // Output "Yes" if student passes.
                    pass++ ;                 // Increment the total passed count.
                    ab++ ;                   // Increment the 'b' type student counter.
                    break ;
                } else {
                    console.log( "No" ) ;    // Output "No" if student does not pass.
                    break ;
                }


            case 'c' :
                // Student type 'c':
                // These students always fail, regardless of other conditions.
                console.log( "No" ) ;    // Output "No".
                break ;

        } // End of switch statement.

    } // End of for loop.

} ) ; // End of reader.on('close') event listener.

/*
 * End of the program logic.
 * The program waits for input, processes it, and then terminates.
 */