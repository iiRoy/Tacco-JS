/*
 * This is a self-executing anonymous function (IIFE)
 * It encapsulates the main logic of the script.
 * The input parameter 'input' will receive data from standard input.
 */
( function ( input ) {

    // Split the input string by newline characters to get an array of lines.
    var p = input.split( '\n' ) ;


    // Extract the first line, which represents 'n' (likely the number of elements).
    var n = p.shift() ;


    // Extract the second line, split it by space, and convert each part to a Number.
    // This creates the array 'a' to be sorted.
    var a = p.shift().split( ' ' , n ).map( Number ) ;

    // Call the bubble sort function with the array 'a'.
    sortBubble( a ) ;

} ) ( require( 'fs' ) . readFileSync( '/dev/stdin' , 'utf8' ) ) ;
// The IIFE is immediately invoked with the content of /dev/stdin as a UTF-8 string.


/**
 * Implements the Bubble Sort algorithm to sort an array in ascending order.
 * It also counts the number of swaps performed during the sort.
 *
 * @param {Array<number>} a - The array of numbers to be sorted.
 */
function  sortBubble ( a ) {

    /*
     * Initialize a counter for the number of swaps.
     * This variable will track how many times elements are exchanged.
     */
    var count = 0 ;

    /*
     * Initialize a flag to control the outer loop.
     * The loop continues as long as a swap occurs in an iteration.
     */
    var flag = true ;

    // The main sorting loop. It continues until no swaps are made in a full pass.
    while ( flag ) {

        // Reset the flag at the beginning of each pass.
        // If no swaps occur in this pass, the loop will terminate.
        flag = false ;

        /*
         * Iterate through the array from right to left.
         * The largest unsorted element "bubbles up" to its correct position.
         */
        for ( var i = a.length - 1 ;  i >= 1 ;  i-- ) {

            // Compare adjacent elements.
            // If the current element is smaller than the previous one, they are out of order.
            if ( a[i] < a[i - 1] ) {

                // Perform a swap:
                // Store the current element's value temporarily.
                var tmp = a[i] ;

                // Move the previous (larger) element to the current position.
                a[i] = a[i - 1] ;

                // Place the temporary (smaller) element into the previous position.
                a[i - 1] = tmp ;

                // A swap occurred, so set the flag to true to continue the outer loop.
                flag = true ;

                // Increment the swap counter.
                count++ ;

            } // End of if condition for comparison and swap

        } // End of inner for loop

    } // End of outer while loop

    // Print the sorted array elements joined by spaces.
    console.log( a.join( ' ' ) ) ;

    // Print the total number of swaps performed.
    console.log( count ) ;

} // End of sortBubble function definition