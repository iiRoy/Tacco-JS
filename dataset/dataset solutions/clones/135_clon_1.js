/*
 * This JavaScript file contains a self-executing anonymous function
 * designed to process input from standard input, typically for
 * competitive programming challenges.
 *
 * The main logic is encapsulated within an Immediately Invoked Function Expression (IIFE).
 */
( function ( input )
{
    // The 'input' parameter receives the raw string from standard input.

    // First, remove any trailing newline character, then split the input
    // string into an array of lines based on the newline character.
    // This array 'p' will hold all lines of the input.
    var p = input . replace ( /\n$/, '' ) . split ( '\n' ) ;

    // The first line of input usually contains the number of test cases or iterations.
    // We parse this line (which is the first element of 'p') into a number 'n'.
    // The 'shift()' method removes the first element from 'p' and returns it.
    var n = Number ( p . shift ( ) ) ;

    // This loop iterates 'n' times, processing each test case.
    for ( var i = 0 ; i < n ; i ++ )
    {
        // For each iteration, get the next line from 'p'.
        // Split this line by spaces to get individual string numbers.
        // Then, map each string to its numerical representation.
        // The resulting array of numbers is stored in 'a'.
        var a = p . shift ( ) . split ( ' ' ) . map ( Number ) ;

        // Call the 'order' function with the array 'a' and print its return value
        // to the console. The 'order' function determines if the array 'a'
        // satisfies a specific ordering condition.
        console . log ( order ( a ) ) ;

    } // End of the main processing loop.

} ) ( require ( 'fs' ) . readFileSync ( '/dev/stdin', 'utf8' ) ) ;
// The IIFE is immediately invoked with the content of '/dev/stdin'
// read synchronously as a UTF-8 string. This is common for reading
// input in environments like Node.js.


// ====================================================================
// Function Definition: order(a)
// This function checks if an array 'a' adheres to a specific sorting pattern.
// It effectively checks for two properties:
// 1. Elements after the first 'pivot' element must be smaller than or equal to it.
// 2. The remaining elements (those smaller than or equal to the pivot) must be
//    in non-decreasing order.
// ====================================================================
function order ( a )
{
    // 'r' will store elements that are smaller than or equal to the first element 'c'.
    var r = [ ] ;

    // 'x' is a temporary variable used to hold shifted elements.
    var x ;

    // 'c' is the first element of the input array 'a'. It acts as a pivot.
    // It's removed from 'a' using 'shift()'.
    var c = a . shift ( ) ;


    /*
     * First pass: Populate 'r' with elements from 'a' that are
     * less than or equal to 'c'.
     */
    while ( x = a . shift ( ) )
    {
        // If the current element 'x' is greater than the pivot 'c',
        // it violates the first condition. We skip it, effectively discarding it.
        // The problem implies that such elements are not considered for the second phase.
        if ( x > c )
        {
            continue ; // Move to the next element in 'a'.
        }

        // If 'x' is less than or equal to 'c', add it to the 'r' array.
        r . push ( x ) ;
    }


    // Initialize 'm' to negative infinity. This variable will track
    // the maximum element encountered so far in the 'r' array during the second pass.
    var m = - Infinity ;

    /*
     * Second pass: Check if the elements collected in 'r' (those <= c)
     * are in non-decreasing order.
     */
    while ( x = r . shift ( ) )
    {
        // If the current element 'x' from 'r' is greater than the
        // maximum 'm' seen so far, update 'm' to 'x'.
        if ( x > m )
        {
            m = x ;
            continue ; // Continue to the next element in 'r'.
        }
        // If 'x' is not greater than 'm' (i.e., x <= m), it means
        // the elements in 'r' are not in non-decreasing order.
        // In this case, the condition is not met, and we return 'NO'.
        return 'NO' ;
    }

    // If the loop completes without returning 'NO', it means all elements
    // in 'r' were in non-decreasing order.
    // Therefore, the array 'a' (after processing) satisfies the conditions.
    return 'YES' ;

} // End of the 'order' function.