/*
 * This file contains JavaScript code for processing a string.
 * The original input handling via process.stdin is commented out,
 * and input is instead read directly from a file.
 */

// This block of code is typically used for reading input from standard input
// in environments like competitive programming, but is currently inactive.
// process.stdin.resume(); // Ensures the standard input stream stays open.
// process.stdin.setEncoding('utf8'); // Sets the encoding for the input data.
// process.stdin.on('data', function(chunk) { // Attaches a listener for 'data' events.

    // The main processing function is called here,
    // reading the input directly from /dev/stdin.
    main( require('fs').readFileSync( '/dev/stdin', 'utf8' ) );

// }); // End of the data event handler function.


/**
 *  The core function that processes the input string.
 *  It simulates a stack-like behavior to count remaining characters.
 *
 *  @param {string} chunk - The input string to be processed character by character.
 */
function     main (   chunk   )
{
    // Initialize an empty array; this array will function as our stack.
    var    ans    =    [ ]    ;

    // Split the input chunk into an array of individual characters.
    // This allows easy iteration over each character.
    var    line    =    chunk . split ( "" )    ;

    // Iterate through each character in the 'line' array.
    // The 'for...in' loop is used to get the index of each character.
    for ( var    i    in    line )
    {
        // Use a switch statement to handle different character types.
        switch ( line [ i ] )
        {
            // Case for character 'S':
            case    'S'    :
                // If 'S' is encountered, push it onto our 'ans' stack.
                ans . push ( 'S' )    ;
                break    ;

            // Case for character 'T':
            case    'T'    :
                // Check two conditions before performing an action:
                // 1. Is the 'ans' stack not empty?
                // 2. Is the last element pushed onto the stack an 'S'?
                if ( ans . length    >    0    &&    ans [ ans . length - 1 ]    ==    'S' )
                {
                    // If both conditions are true, it means an 'S' can be "canceled out" by a 'T'.
                    // So, we remove the last element ('S') from the stack.
                    ans . pop ( )    ;
                }
                else
                {
                    // If the conditions are not met (stack is empty, or top is not 'S'),
                    // then 'T' cannot cancel anything, so it is pushed onto the stack.
                    ans . push ( 'T' )    ;
                }
                break    ; // Ensure we break out of the switch after handling 'T'.
        } // End of switch (line[i])
    } // End of for (var i in line) loop

    // After processing all characters, the length of the 'ans' array
    // represents the number of characters that remain un-canceled.
    // This final count is then printed to the console.
    console . log ( ans . length )    ;
} // End of main function definition.