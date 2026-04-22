// This script processes input data to find a minimum cost based on specific conditions.
// It reads from standard input, transforms the data, and then performs a nested loop calculation.

var input = require( 'fs' ) . readFileSync( '/dev/stdin', 'utf8' ) ; // Read input from stdin, specified as utf8 encoding.

// Process the raw input string:
// 1. Trim leading/trailing whitespace.
// 2. Replace 'W' with '0', 'B' with '1', 'R' with '2'.
// 3. Split the resulting string by newline characters into an array of strings.
var arr = input . trim()
                . replace( /W/g, "0" )
                . replace( /B/g, "1" )
                . replace( /R/g, "2" )
                . split( "\n" ) ;


// The first line of input contains N and M.
var nm = arr . shift() // Remove the first element (which contains N and M) from arr and return it.
             . split( " " ) // Split the N M string by space.
             . map( Number ) ; // Convert the resulting string array elements to numbers.

var n = nm[0] ; // Extract the first number as N (number of rows).
var m = nm[1] ; // Extract the second number as M (number of columns).


// This 'wbr' array will store pre-calculated costs for each row.
// Each element `wbr[row_index]` will be an array `[cost_for_W, cost_for_B, cost_for_R]`
// for that specific row.
var wbr = arr.map( function(v) {

    // Initialize a color cost array for the current row.
    // Each element represents the count of W, B, R in the row, initially set to M.
    // The goal is to count how many characters *are not* the target color.
    var color = [ m, m, m ] ;

    // Iterate through each character (now a number 0, 1, or 2) in the row.
    for ( var i = 0 ; i < m ; i ++ ) {
        // Decrement the count for the specific color found.
        // v[i] will be 0, 1, or 2, directly indexing into the color array.
        // This effectively calculates `M - (count of specific color)` for each color.
        color[ v[i] ] -- ;
    }

    return color ; // Return the calculated color cost array for the row.
} ) ; // End of map function and assignment to wbr.


var min = 2500 ; // Initialize minimum cost with a sufficiently large value.
                 // Assuming max N, M are such that 2500 is a safe upper bound.

// Outer loop: iterates to determine the end boundary of the first segment (index 'i').
for ( var i = 0 ; i < n ; i ++ ) {

    // Inner loop: iterates to determine the end boundary of the second segment (index 'j').
    for ( var j = 0 ; j < n ; j ++ ) {

        // Initialize flags to track if each color segment (W, B, R) has been "used".
        // flag[0] for W segment, flag[1] for B segment, flag[2] for R segment.
        var flag = [ 0, 0, 0 ] ;

        var cost = 0 ; // Initialize cost for the current combination of i and j.

        var a = 0 ; // 'a' is the current row index counter, starting from the beginning (row 0).

        // First segment (W): from row 0 up to (but not including) row 'i'.
        while( a < i ) {
            flag[0] = 1 ; // Mark that the first color segment has been used.
            cost += wbr[a][0] ; // Add the cost for the 'W' color for this row.
            a ++ ; // Move to the next row.
        }

        // Second segment (B): from row 'i' up to (but not including) row 'j'.
        while( a < j ) {
            flag[1] = 1 ; // Mark that the second color segment has been used.
            cost += wbr[a][1] ; // Add the cost for the 'B' color for this row.
            a ++ ; // Move to the next row.
        }

        // Third segment (R): from row 'j' up to (but not including) row 'n'.
        while( a < n ) {
            flag[2] = 1 ; // Mark that the third color segment has been used.
            cost += wbr[a][2] ; // Add the cost for the 'R' color for this row.
            a ++ ; // Move to the next row.
        }

        // Check if all three segments (W, B, R) were validly formed.
        // This implies that i < j and j < n, ensuring each segment has at least one row.
        if ( flag[0] + flag[1] + flag[2] == 3 ) {
            // If all three segments are present, update the minimum cost if the current cost is lower.
            min = Math.min( cost, min ) ;
        }

    } // End of inner loop (for j).

} // End of outer loop (for i).


// Output the final minimum cost found to the console.
console.log( min ) ;