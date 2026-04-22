/* This is a Type I clone of the original JavaScript code.
 * All identifiers, variable names, function names, operators, and expressions
 * remain completely unchanged from the original source.
 * Only whitespace (indentation, spacing, blank lines) and comments have been
 * altered to provide a visually distinct, yet functionally identical, code fragment.
 */

// Importing the 'fs' (file system) module to read input.
var input = require('fs') . readFileSync(
    '/dev/stdin' , // Path to the standard input file.
    'utf8'        // Encoding for reading the file.
) ;


// Process the input string: trim whitespace and split into an array of lines.
var arr = input . trim() . split( "\n" ) ;


// Extract the first line, split by space, and convert elements to numbers.
var nrl = arr . shift() . split( " " ) . map( Number ) ;


// Assign the first element of nrl to variable 'n'.
var n = nrl[0] ;


// Assign the third element of nrl to variable 'L'.
var L = nrl[2] ;


// Initialize an empty array 't'.
var t = [] ;


// Initialize an array 'max' with two zeros.
var max = [0, 0] ;


// Initialize 'time' variable to 0.
var time = 0 ;


// Loop 'n' times to initialize elements in array 't'.
for ( var i = 0 ; i < n ; i ++ ) {
    // Each element of 't' is an array [0, 0, i].
    t[i] = [ 0, 0, i ] ;
}


// Add a specific array joined by space to the 'arr' array.
arr . push ( [ 1 , L , 0 ] . join ( " " ) ) ;


// Main loop to process each entry in the 'arr' array.
for ( var i = 0 ; i < arr . length ; i ++ ) {

    // Split the current array element by space and convert to numbers.
    var v = arr[i] . split ( " " ) . map ( Number ) ;

    // Calculate 'd' (index) by subtracting 1 from the first element of 'v'.
    var d = v[0] - 1 ;

    // Assign the second element of 'v' to 'T' (current time).
    var T = v[1] ;

    // Assign the third element of 'v' to 'x' (value change).
    var x = v[2] ;

    /*
     * Update the second component of the element in 't'
     * at the index specified by max[0].
     * This represents a duration update.
     */
    t[ max[0] ][ 1 ] += T - time ;

    // Update 'time' to the current event's time 'T'.
    time = T ;

    // Update the first component of the element in 't' at index 'd'.
    // This represents adding 'x' to a value.
    t[ d ][ 0 ] += x ;

    // Conditional block based on the value of 'x'.
    if ( x > 0 ) {
        // If 'x' is positive (value increased).

        if ( t[d][0] > max[1] ) {
            // If the new value at 'd' is greater than the current max value.
            max = [ d , t[d][0] ] ; // Update 'max' with new index 'd' and its value.
        }
        else if ( t[d][0] == max[1] && d <= max[0] ) {
            // If new value is equal to max value, and 'd' is smaller or equal to current max index.
            max = [ d , t[d][0] ] ; // Update 'max' (prioritize smaller index in case of ties).
        }
    }
    else if ( x < 0 && max[0] == d ) {
        // If 'x' is negative (value decreased) AND the decreased item was the max.

        var MAX = 0 ; // Initialize local variable MAX for finding new maximum value.
        var m = 0 ;   // Initialize local variable m for finding new maximum index.

        // Loop through all elements in 't' to find the new maximum.
        for ( var j = 0 ; j < t . length ; j ++ ) {

            if ( MAX < t[j][0] ) {
                // If current element's value is greater than MAX found so far.
                m = j ;             // Update 'm' to current index 'j'.
                MAX = t[j][0] ;     // Update 'MAX' to current element's value.
            }
        }
        // After iterating, 'm' holds the index of the new maximum, and 'MAX' holds its value.
        max = [ m , t[m][0] ] ; // Update the global 'max' array.
    }
}


// Sort the array 't' based on custom comparison logic.
t . sort ( function ( a , b ) {
    /*
     * Comparison function for sorting.
     * If the second elements (a[1] and b[1]) are equal,
     * sort by the third elements (a[2] and b[2]) in ascending order.
     * Otherwise, sort by the second elements (b[1] and a[1]) in descending order.
     */
    if ( a[1] == b[1] ) {
        return a[2] - b[2] ;
    }
    else {
        return b[1] - a[1] ;
    }
} ) ;


// Output the third element of the first item in the sorted 't' array, plus 1.
console . log ( t[0][2] + 1 ) ;

/* End of Type I clone. */