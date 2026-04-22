/*
 * This JavaScript file processes input data to rank entries based on a specific formula.
 * It reads input from standard input, parses the lines, performs calculations,
 * and then sorts the results before printing them.
 *
 * This script is designed to handle multiple blocks of data, with each block
 * preceded by a number indicating how many entries are in that block.
 * A block count of zero (0) signals the end of input.
 *
 * Author: Code Clone Generator
 * Date: 2023-10-27
 * Version: 1.0 (Type I Clone)
 */


// Import the Node.js 'fs' (file system) module to read input.
var input = require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' ) ;


// Process the raw input: remove any trailing newline character and then
// split the string into an array of lines.
var Arr = ( input . replace ( / \n $ / , "" ) ) . split ( "\n" ) ;



// Start the main processing loop. This loop continues indefinitely
// until an explicit 'break' statement is encountered.
while ( true ) {

    // Extract the first line from the 'Arr' array, convert it to a number.
    // The '- 0' is a common idiom to ensure numeric conversion.
    var n = Arr . shift ( ) - 0 ;

    // Check if the extracted number 'n' is zero.
    // If 'n' is 0, it signifies the end of the input blocks, so we exit the loop.
    if ( n == 0 ) break ;


    // Initialize an empty array to store the processed results for the current block.
    var ans = [ ] ;


    // Loop 'n' times to process each individual entry within the current block.
    for ( var I = 0 ; I < n ; I ++ ) {

        // Get the next line from 'Arr' and split it by spaces into an array.
        var arr = ( Arr . shift ( ) ) . split ( " " ) ;

        // The first element of the 'arr' is the name (label).
        var name = arr . shift ( ) ;

        // Convert the remaining elements in 'arr' from strings to numbers.
        arr = arr . map ( Number ) ;

        // Prepend the 'name' back to the beginning of the 'arr' array.
        arr . unshift ( name ) ;


        // Define an immediately invoked function expression (IIFE).
        // This function takes specific parameters (L, P, A, B, C, D, E, F, S, M).
        // It calculates 'time' and 'money' based on these parameters and pushes
        // the result along with the label and original index into the 'ans' array.
        ( function ( L ,   P ,   A ,   B ,   C ,   D ,   E ,   F ,   S ,   M ) {
            // Calculate the 'time' component using a specific formula.
            var time = A + B + C + ( ( D + E ) * M ) ;

            // Calculate the 'money' component using another specific formula.
            var money = ( F * S * M ) - P ;

            // Push an array containing the label, the calculated ratio (money/time),
            // and the original index 'I' into the 'ans' array.
            ans . push ( [ L , money / time , I ] ) ;

        } ) . apply ( null , arr ) ; // Execute the function, passing elements of 'arr' as arguments.

    } // End of the 'for' loop for processing individual entries.


    // Sort the 'ans' array based on specific criteria.
    // The sorting function compares two elements, 'a' and 'b'.
    ans . sort ( function ( a , b ) {
        // If the calculated ratios (a[1] and b[1]) are equal,
        // then sort by the original index (a[2] and b[2]) in ascending order.
        if ( a [ 1 ] == b [ 1 ] ) return a [ 2 ] - b [ 2 ] ;
        // Otherwise, sort by the calculated ratio (b[1] and a[1]) in descending order.
        else return b [ 1 ] - a [ 1 ] ;
    } ) ;


    // Iterate over the sorted 'ans' array and print the label (first element) of each entry.
    ans . forEach ( function ( v ) { console . log ( v [ 0 ] ) ; } ) ;


    // After printing all entries for the current block, print a hash symbol
    // to act as a separator between output blocks.
    console . log ( "#" ) ;

} // End of the 'while(true)' main processing loop.