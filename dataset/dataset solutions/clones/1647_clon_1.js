/*
 * This is a Type I clone of the original JavaScript code.
 * All identifiers and logic remain identical.
 * Only whitespace and comments have been altered significantly
 * to create a visually distinct but functionally equivalent file.
 */

// Original input example, commented out.
// let input = "7 4 2\n3";


function main ( input ) {
    // Trim leading/trailing whitespace from the input string.
    input = input.trim();

    // Split the input into lines and extract the first line.
    let l1 = input.split( "\n" ) [ 0 ];

    // Extract the second line of the input.
    let l2 = input.split( "\n" ) [ 1 ];


    // Parse the Red component from the first line.
    let r = parseInt( l1.split( " " ) [ 0 ] );

    // Parse the Green component from the first line.
    let g = parseInt( l1.split( " " ) [ 1 ] );

    // Parse the Blue component from the first line.
    let b = parseInt( l1.split( " " ) [ 2 ] );

    // Parse the number of magic operations from the second line.
    let n = parseInt( l2 );


    /**
     * Determines if the color components are in strictly increasing order.
     * @returns {boolean} True if r < g and g < b, false otherwise.
     */
    function hantei ( ) {
        return ( r < g && g < b );
    }


    /*
     * Applies a "magic" transformation to the color components.
     * If Red is greater than or equal to Green, Green is doubled.
     * Otherwise, if Green is greater than or equal to Blue, Blue is doubled.
     */
    function magic ( ) {
        if ( r >= g ) {
            g = g * 2;
        } else if ( g >= b ) {
            b = b * 2;
        }
    }


    // Perform the magic operation 'n' times.
    for ( i = 0; i < n; i++ ) {
        magic(); // Execute the magic function in each iteration.
    }


    // Initialize the answer string.
    let answer = "";

    // Check the final state of the color components.
    if ( hantei() === true ) {
        answer = "Yes"; // If condition is met, set answer to "Yes".
    } else {
        answer = "No";  // Otherwise, set answer to "No".
    }

    // Output the final answer to the console.
    console.log( answer );
}

/*
 * The following line was commented out in the original,
 * it's kept commented here as well, maintaining its original status.
 */
// main(input);


// Call the main function with input read from standard input.
main( require( "fs" ) . readFileSync( "/dev/stdin" , "utf8" ) );