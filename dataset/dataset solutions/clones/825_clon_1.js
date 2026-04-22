/*
 * This script processes input data to calculate and display results.
 * It reads from standard input, processes multiple test cases,
 * and outputs formatted data.
 */

// Import the 'fs' (file system) module to handle file operations.
// We are reading input synchronously from '/dev/stdin' using UTF-8 encoding.
var input = require('fs') . readFileSync ( '/dev/stdin' ,   'utf8' ) ;

// --- Data Preparation ---

// Remove any trailing newline character from the input string.
// Then, split the input string into an array of lines based on the newline character.
var Arr = ( input . replace ( / \n $ / , "" ) ) . split ( "\n" ) ;


// --- Main Processing Loop ---

// This loop continues indefinitely until a specific break condition is met.
while ( true ) {

    // Extract the first element from the 'Arr' array.
    // Convert it to a number by subtracting zero. This 'n' represents the number of items for the current test case.
    var n = Arr . shift ( ) - 0 ;

    // Check if 'n' is zero. If it is, this signifies the end of the input data.
    if ( n == 0 )
        break ; // Exit the while loop.

    // Initialize an empty array to store the results for the current test case.
    var ans = [ ] ;

    // --- Inner Loop: Process 'n' items ---
    // Iterate 'n' times, once for each item in the current test case.
    for ( var I = 0 ; I < n ; I ++ ) {

        // Get the next line from the input array 'Arr'.
        // Split this line by spaces to get an array of strings.
        var arr = ( Arr . shift ( ) ) . split ( " " ) ;

        // The first element of 'arr' is the name (label). Extract it.
        var name = arr . shift ( ) ;

        // Convert the remaining elements in 'arr' to numbers using the map function.
        arr = arr . map ( Number ) ;

        // Add the 'name' back to the beginning of the 'arr' array.
        arr . unshift ( name ) ;

        // --- Immediately Invoked Function Expression (IIFE) for calculations ---
        // This function takes several parameters (L, P, A, B, C, D, E, F, S, M)
        // and performs calculations based on them.
        // The 'apply' method is used to pass the 'arr' elements as individual arguments.
        ( function ( L , P , A , B , C , D , E , F , S , M ) {

            // Calculate 'time' based on the provided parameters.
            // This represents a specific time calculation formula.
            var time = A + B + C + ( ( D + E ) * M ) ;

            // Calculate 'money' based on the provided parameters.
            // This represents a specific money calculation formula.
            var money = ( F * S * M ) - P ;

            // Push the calculated results into the 'ans' array.
            // Each entry is an array containing the label (L), money-to-time ratio, and original index (I).
            ans . push ( [ L , money / time , I ] ) ;

        } ) . apply ( null , arr ) ; // Call the function with elements of 'arr' as arguments.
    } // End of for loop for processing 'n' items.


    // --- Sorting the Results ---

    // Sort the 'ans' array based on specific criteria.
    // The sort function compares two elements, 'a' and 'b'.
    ans . sort ( function ( a , b ) {
        // Primary sort key: money-to-time ratio (a[1]). Sort in descending order.
        // Secondary sort key: label (a[0]). Sort in ascending order if ratios are equal.
        if ( a [ 1 ] == b [ 1 ] )
            return a [ 0 ] > b [ 0 ] ; // If ratios are equal, sort by label (ascending).
        else
            return b [ 1 ] - a [ 1 ] ; // Otherwise, sort by ratio (descending).
    } ) ;


    // --- Outputting the Results ---

    // Iterate through the sorted 'ans' array.
    // For each element 'v', print its label (v[0]) to the console.
    ans . forEach ( function ( v ) {
        console . log ( v [ 0 ] ) ;
    } ) ;

    // After printing all labels for the current test case, print a separator.
    console . log ( "#" ) ;

} // End of while loop for test cases.