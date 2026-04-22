/*
 * This script reads data from standard input, performs specific array manipulations,
 * and then outputs a particular element from the processed and sorted results.
 * It's designed to solve a problem involving combinations of numbers from an input list.
 */

// Import the 'fs' (file system) module to handle file operations.
// Read the entire content of '/dev/stdin' synchronously, assuming UTF-8 encoding.
var input = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ;


// Process the input string:
// First, remove any leading or trailing whitespace using .trim().
// Then, split the string into an array of substrings based on newline characters ("\n").
var Arr = ( input . trim() ) . split ( "\n" ) ;


// Extract the first element from the 'Arr' array.
// This element is expected to be a number, representing the count 'n'.
// The '-0' arithmetic operation is a common JavaScript trick to explicitly convert a string to a number.
var n = Arr . shift() - 0 ;


// Initialize an empty array named 'ans'. This array will store the results of our calculations.
var ans = [ ] ;


// Start of the outer loop. This loop iterates 'n' times, with the counter 'i' going from 0 to n-1.
for ( var i = 0 ; i < n ; i++ ) {

    // Start of the inner loop. This loop iterates from 'j' = 'i' + 1 up to n-1.
    // This structure ensures that each pair (Arr[i], Arr[j]) is considered exactly once,
    // and 'i' is always less than 'j'.
    for ( var j = i + 1 ; j < n ; j++ ) {

        // Concatenate the string representations of Arr[i] and Arr[j].
        // Then, convert the resulting concatenated string to a number using '-0'.
        // Push this number into the 'ans' array.
        ans . push ( ( Arr[i] + Arr[j] ) - 0 ) ;

        // Repeat the concatenation and conversion process, but with Arr[j] and Arr[i] reversed.
        // This generates the number formed by digits of Arr[j] followed by Arr[i].
        // Push this second number into the 'ans' array.
        ans . push ( ( Arr[j] + Arr[i] ) - 0 ) ;

    } // End of the inner loop for 'j'.

} // End of the outer loop for 'i'.


// Sort the 'ans' array numerically in ascending order.
// The custom comparison function `(a, b) => a - b` is essential for numerical sorting.
ans . sort ( function ( a , b ) { return a - b ; } ) ;


// Finally, print the element at index 2 of the sorted 'ans' array to the console.
// This corresponds to the third smallest number generated.
console . log ( ans[2] ) ;