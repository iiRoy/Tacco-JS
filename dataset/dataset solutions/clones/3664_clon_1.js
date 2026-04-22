// This script processes a list of intervals to find the maximum number of non-overlapping intervals.


    // --- Input Reading Section ---

var input = require ( "fs" ) . readFileSync ( 0 , "utf8" ) . split ( "\n" ) ; // Reads all input from stdin, decodes as UTF-8, and splits into lines.

var m = input [ 0 ] . split ( " " ) ; // The first line contains two numbers, n and m, separated by a space.
n = + m [ 0 ] ; // Parses the first number (n) from the first line. The unary '+' converts string to number.
m = + m [ 1 ] ; // Parses the second number (m) from the first line. This 'm' now represents the count of intervals.

    // --- Interval Parsing and Preparation ---

// The subsequent 'm' lines each describe an interval [start, end].
// We slice the input array to get only the interval lines, then map them.
// Each line is split by space, and its parts are converted to numbers.
var qq = input . slice ( 1 , 1 + m ) . map ( ln => ln . split ( " " ) . map ( Number ) ) ;

// Sort the intervals based on their end points (the second element, index 1).
// This is a crucial step for the greedy approach to find the maximum non-overlapping intervals.
qq . sort ( ( p , q ) => p [ 1 ] - q [ 1 ] ) ;

    // --- Greedy Algorithm Implementation ---

var ans = 0 ; // Initialize the count of selected non-overlapping intervals.
var las = -1 ; // 'las' stores the end point of the last selected interval. Initialized to -1 to ensure the first interval can always be picked.

// Iterate through the sorted intervals.
qq . map ( q => {

  // If the current interval's start point is greater than or equal to the end point of the last selected interval,
  // then it does not overlap with the last selected interval.
  if ( las <= q [ 0 ] ) {
    las = q [ 1 ] ; // Update 'las' to the end point of the current interval.
    ans ++ ; // Increment the count of non-overlapping intervals.
  }
} ) ;

    // --- Output Result ---

console . log ( ans ) ; // Print the final count of maximum non-overlapping intervals.