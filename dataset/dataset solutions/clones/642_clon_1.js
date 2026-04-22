/*
 * This JavaScript code reads input from stdin, processes it,
 * and calculates a minimum cost based on specific conditions.
 * It's designed to solve a problem related to coloring a grid.
 */

var input = require('fs').readFileSync( '/dev/stdin' , 'utf8' ); // Read raw input from standard input

// Process the input string: trim whitespace, replace characters, and split into lines.
var arr = input . trim() . replace( /W/g , "0" ) . replace( /B/g , "1" ) . replace( /R/g , "2" ) . split( "\n" );

// The first line contains N and M, split and convert to numbers.
var nm = arr . shift() . split( " " ) . map( Number );

var n = nm[0]; // N represents the number of rows.
var m = nm[1]; // M represents the number of columns.


// Map each row to an array representing the count of '0's, '1's, and '2's.
var wbr = arr . map( function (v) {

   // Initialize color counts for white, blue, red.
   var color = [ m , m , m ];

   // Iterate through the characters in the row (v) and decrement counts.
   for ( var i = 0 ; i < m ; i++ )
      color[v[i]]--; // Decrement the count for the color found at v[i].

   return color; // Return the processed color counts for the row.
} );


var min = 2500; // Initialize minimum cost with a sufficiently large value.


// Special case: If N is exactly 3, calculate the cost directly.
if ( n  ==  3 )
   min = wbr[0][0]  +  wbr[1][1]  +  wbr[2][2]; // Direct calculation for 3 rows.


// Loop to find minimum cost for other N values.
for ( var i = 1 ; i  <  n - 2 ; i++ ) {

   for ( var j = i  +  1 ; j  <  n - 1 ; j++ ) {

      var cost = 0; // Initialize cost for the current partition.

      var a = i; // Pointer for the first segment.
      var b = j; // Pointer for the second segment.

      // Calculate cost for the 'white' segment (rows from 0 to i-1).
      while ( a  >=  0 ) {
         cost += wbr[a][0]; // Add the count of non-white cells in row 'a'.
         a--; // Move to the previous row.
      }

      // Calculate cost for the 'blue' segment (rows from i to j-1).
      for ( var y = i ; y  <  j ; y++ )
         cost += wbr[y][1]; // Add the count of non-blue cells in row 'y'.

      // Calculate cost for the 'red' segment (rows from j to n-1).
      while ( b  !=  n - 1 ) {
         cost += wbr[b][2]; // Add the count of non-red cells in row 'b'.
         b++; // Move to the next row.
      }

   }

   // Update the overall minimum cost.
   min = Math . min( min , cost );
}


console . log( min ); // Output the final minimum cost to standard output.