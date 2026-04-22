'use strict';
process.stdin.resume();

process.stdin.setEncoding( 'utf-8' ); // Setting the input encoding for standard input.


let inputString = ''; // This variable will accumulate all the incoming data.
let currentLine = 0;  /* This counter keeps track of which line from inputString
                         we are currently processing. */


// Event listener for 'data' event on standard input.
process.stdin.on( 'data',  inputStdin  => {
    // Each chunk of data received is appended to inputString.
    inputString += inputStdin;
} );

// Event listener for 'end' event on standard input.
process.stdin.on( 'end', () => {
    // When all input is received, split the accumulated string by newline character.
    inputString = inputString.split( '\n' );
    // Then, invoke the main function to start the program logic.
    main();
} );


/*
 * Helper function to read a single line from the processed input array.
 * It also increments the line counter for the next read operation.
 * @returns {string} The next line available in the input.
 */
function readline( )
{
    return inputString[ currentLine++ ]; // Returns the current line and then increments the counter.
}


// ************************************************************
// *****************   Core Logic Starts Here   ***************
// ************************************************************

/**
 * The main function where the primary business logic of the program resides.
 * It reads inputs, performs calculations, and prints the final result.
 */
function main()
{

    // Read the first line of input, which is expected to be an integer 'T'.
    var T = parseInt( readline() );

    // Read the second line of input, which is expected to be a string 'str'.
    var str = readline();


    // Calculate the first half of the string.
    // The slice ends at the floor of T/2 to handle both even and odd lengths consistently.
    var res1 = str.slice( 0, Math.floor( T / 2 ) );

    // Calculate the second half of the string.
    // Starts from T/2, automatically goes to the end of the string.
    var res2 = str.slice( T / 2 );


    // Check for a specific edge case: if the string has only one character.
    if ( str.length === 1 )
    {
        print( 'No' ); // If length is 1, it cannot be divided into two equal halves.
    }

    // Compare the two resulting halves.
    // If they are strictly equal, print 'Yes', otherwise print 'No'.
    print( res1 === res2 ? 'Yes' : 'No' );

} // End of the main function.