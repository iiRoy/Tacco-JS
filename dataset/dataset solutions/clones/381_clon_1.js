/*
 * This JavaScript file processes input data to generate a sequence of numbers.
 * It's designed to read from standard input and produce space-separated output.
 */

// Import the 'fs' (file system) module to read from the file system.
// Specifically, read the entire content of '/dev/stdin' as UTF-8 encoded text.
var input = require('fs') . readFileSync ( '/dev/stdin' , 'utf8' ) ;

// Process the raw input string:
// 1. Remove any trailing newline characters using a regular expression.
// 2. Split the cleaned string into an array of lines based on newline characters.
var Arr = (input . replace ( /\n$/ , "" )) . split ("\n") ;

// The first element of the array 'Arr' represents the number of test cases.
// 'shift()' removes the first element and returns it.
// Subtracting 0 converts the string to a number explicitly.
var n = Arr . shift () - 0 ; // Number of iterations for the main loop.

// Loop 'n' times, once for each test case or sequence generation.
for ( var i = 0 ; i < n ; i ++ ) {

    // For each iteration:
    // 1. Take the current line from 'Arr'.
    // 2. Split it by spaces to get individual number strings.
    // 3. Use 'map(Number)' to convert each string in the resulting array to a number.
    var arr = Arr [ i ] . split ( " " ) . map ( Number ) ;

    // The first number in the processed array is the starting value 's'.
    var s = arr [ 0 ] ;

    // The second number is the goal value 'g'.
    var g = arr [ 1 ] ;

    // Initialize an array 'ans' to store the sequence, starting with 's'.
    var ans = [ s ] ;

    // 'plus' is a variable used for incrementing/decrementing logic, initialized to 1.
    var plus = 1 ;

    // --- Conditional logic to generate the sequence based on 's' and 'g' ---

    // Case 1: Starting value 's' is less than the goal 'g'.
    if ( s < g ) {
        do {
            s ++ ;         // Increment 's'.
            ans . push ( s ) ; // Add the new 's' to the sequence.
        } while ( s != g ) ; // Continue until 's' equals 'g'.
    }
    // Case 2: Starting value 's' is greater than 'g', and 's' is 5 or less.
    else if ( s > g && s <= 5 ) {
        do {
            s -- ;         // Decrement 's'.
            ans . push ( s ) ; // Add the new 's' to the sequence.
        } while ( s != g ) ; // Continue until 's' equals 'g'.
    }
    // Case 3: Starting value 's' is greater than 'g', and both 's' and 'g' are 6 or more.
    else if ( s > g && s >= 6 && g >= 6 ) {
        do {
            s ++ ;         // Increment 's'.
            if ( s == 10 ) { // Special condition: if 's' reaches 10...
                s = 5 ;    // ...reset 's' to 5.
            }
            ans . push ( s ) ; // Add the new 's' to the sequence.
        } while ( s != g ) ; // Continue until 's' equals 'g'.
    }
    // Case 4: Starting value 's' is greater than 'g', 's' is 6 or more, and 'g' is 5 or less.
    else if ( s > g && s >= 6 && g <= 5 ) {
        do {
            s += plus ;    // Increment 's' by the value of 'plus'.
            if ( s == 10 ) { // Special condition: if 's' reaches 10...
                s = 5 ;    // ...reset 's' to 5.
                plus = -1 ; // ...and change 'plus' to -1, causing subsequent decrements.
            }
            ans . push ( s ) ; // Add the new 's' to the sequence.
        } while ( s != g ) ; // Continue until 's' equals 'g'.
    }

    // After generating the sequence, join the numbers in the 'ans' array with spaces
    // and print the result to the console.
    console . log ( ans . join ( " " ) ) ;

} // End of the main for loop.