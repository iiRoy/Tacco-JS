/*
 * This file contains JavaScript code for processing input.
 * It uses strict mode to catch common coding errors.
 */
"use strict"
; /* Ensure strict parsing and execution */


// Resume the standard input stream.
process.stdin. resume ( ) ;

/*
 * Set the encoding for standard input.
 * We expect UTF-8 encoded text.
 */
process.stdin.setEncoding( 'utf8' ) ;


let   input   =   ''   ; // Initialize an empty string to accumulate input data.

/*
 * Event listener for 'data' events on standard input.
 * Appends each chunk of data received to the 'input' string.
 */
process.stdin.on ( 'data' , function ( chunk )
{
    input   +=   chunk ;
}
) ;

/*
 * Event listener for 'end' event on standard input.
 * This signifies that all input has been received.
 * It then processes the accumulated input by splitting it into lines
 * and passing it to the main function.
 */
process.stdin.on ( 'end' , function ( )
{
    main ( input . split ( /\r?\n/ ) ) ;
}
) ;


/**
 * The main function to process the parsed input lines.
 * It simulates a round-robin process with certain values.
 * @param {string[]} inputs - An array of strings, where each string is a line of input.
 */
function main ( inputs )
{
    /*
     * Parse the first line of input to get 'n' and 'q'.
     * 'n' is the number of items, 'q' is a quantum value.
     */
    let n = Number ( inputs [ 0 ] . split ( ' ' ) [ 0 ] ) ;
    let q = Number ( inputs [ 0 ] . split ( ' ' ) [ 1 ] ) ;

    // Declare variables for linked list traversal and temporary storage.
    let   pos ,   pre ,   tmp ,   i ;

    // Initialize the 'top' (head) of our circular linked list.
    let top = { } ;


    // Populate the first node ('top') from the second line of input.
    top . name = inputs [ 1 ] . split ( ' ' ) [ 0 ] ; // Assign name.
    top . val = Number ( inputs [ 1 ] . split ( ' ' ) [ 1 ] ) ; // Assign value.

    // 'pos' initially points to the head of the list.
    pos = top ;


    // Loop to create the rest of the nodes in the circular linked list.
    for ( i = 1 ; i < n ; i ++ )
    {
        // Create a new temporary node.
        tmp = { } ;

        // Populate the new node's name and value from subsequent input lines.
        tmp . name = inputs [ i + 1 ] . split ( ' ' ) [ 0 ] ;
        tmp . val = Number ( inputs [ i + 1 ] . split ( ' ' ) [ 1 ] ) ;

        // Link the current 'pos' node to the new 'tmp' node.
        pos . next = tmp ;

        // Move 'pos' to the newly added node.
        pos = tmp ;
    }

    // Complete the circular link: the last node points back to the 'top'.
    pos . next = top ;

    // 'pre' (previous) pointer is set to the last node.
    pre = pos ;

    // 'pos' is reset to the 'top' of the list for processing.
    pos = top ;

    // Clear 'top' and 'tmp' references to free memory (optional, but good practice).
    top = tmp = null ;


    let count = 0 ; // Initialize a counter for the total elapsed time.

    // Main processing loop: continues as long as there are items left (n > 0).
    while ( n > 0 )
    {
        // Reduce the current item's value by the quantum 'q'.
        pos . val -= q ;
        // Add the quantum to the total elapsed time.
        count += q ;

        // Check if the current item still has a positive value.
        if ( pos . val > 0 )
        {
            // If positive, move to the next item in the circular list.
            pos = pos . next ;
            pre = pre . next ; // Also advance 'pre' to maintain its position relative to 'pos'.
        }
        else
        {
            // If value is zero or negative, the item is finished.
            // Adjust the total count by adding the (negative) remaining value.
            // This corrects for over-subtracting 'q' if 'val' was less than 'q'.
            count += pos . val ;

            // Log the item's name and its completion time.
            console . log ( `${ pos . name } ${ count }` ) ;

            // Move 'pos' to the next item.
            pos = pos . next ;
            // Remove the finished item from the list by linking 'pre.next' directly to 'pos'.
            pre . next = pos ;

            // Decrement the count of remaining items.
            n -- ;
        }
    }
    // After the loop, set 'pos' and 'pre' to null to release references.
    pos = pre = null ;
}