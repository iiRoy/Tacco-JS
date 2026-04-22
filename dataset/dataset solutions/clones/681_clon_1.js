// This JavaScript program processes numerical data from standard input.
// It reads multiple sets of numbers, performs a specific calculation
// on each set, and then outputs the result.

// --- Setup and Input Reading ---

// Load the 'fs' module to handle file system operations, specifically reading from stdin.
var input = require('fs') . readFileSync( '/dev/stdin', 'utf8' ) ;

// Process the raw input:
// 1. Trim any leading or trailing whitespace from the entire input string.
// 2. Split the trimmed input string into an array of strings, using newline characters as delimiters.
var Arr = ( input . trim() ) . split("\n") ;

// Initialize an index variable. This will be used to track the current line being processed in the 'Arr' array.
var I = 0 ;

// --- Main Processing Loop ---

// This loop continues indefinitely until an explicit 'break' statement is encountered.
while ( true ) {

   // Read the current line from 'Arr' using the index 'I'.
   // 1. Split the line string by spaces.
   // 2. Use the 'map(Number)' function to convert each resulting string segment into a numerical value.
   var nS = Arr[I] . split(" ") . map( Number ) ;

   // Increment the line index to point to the next line for the subsequent read operation.
   I ++ ;

   // Extract the two primary values for the current data set:
   // 'n' represents the count of numbers that will follow in this set.
   // 'S' represents a target sum value for a comparison.
   var n = nS[0] ;
   var S = nS[1] ;

   // Check for the termination condition: If both 'n' and 'S' are zero,
   // it signals the end of input, and the loop should terminate.
   if ( n == 0 && S == 0 ) break ;

   // Initialize an empty array to store the 'n' numbers for the current data set.
   var arr = [] ;

   // Loop 'n' times to read each of the 'n' numbers belonging to the current set.
   for ( var i = 0 ; i < n ; i ++ ) {
      // Read the next line from 'Arr' and convert it to a number.
      // The '-0' is a common JavaScript idiom for explicit string-to-number conversion.
      var r = Arr[I] - 0 ;

      // Advance the line index again.
      I ++ ;

      // Add the converted number 'r' to the 'arr' array.
      arr . push( r ) ;
   }

   // Sort the array of numbers in ascending order.
   // This is crucial for the optimization in the subsequent nested loop.
   arr . sort( function( a, b ) { return a - b ; } ) ;

   // Initialize a counter variable for the current data set. This will store the final result.
   var cnt = 0 ;

   // --- Core Logic: Counting Pairs ---

   // Outer loop iterates through each element in the sorted 'arr'.
   for ( var i = 0 ; i < n ; i ++ ) {
      // Inner loop iterates through elements *after* the current 'i' element.
      // This ensures that each pair (arr[i], arr[j]) is considered only once
      // and avoids self-pairing (arr[i], arr[i]).
      for ( var j = i + 1 ; j < n ; j ++ ) {
         // Check if the sum of the current pair (arr[i] + arr[j]) is greater than 'S'.
         if ( arr[i] + arr[j] > S ) {
            // Optimization: Since 'arr' is sorted, if arr[i] + arr[j] > S,
            // then for the same 'arr[i]', any subsequent element arr[k] (where k > j)
            // will also result in arr[i] + arr[k] > S (or be equal if elements are identical).
            // Therefore, we can count all remaining elements from 'j' to the end of the array
            // (which is 'n - j' elements) and add them to 'cnt'.
            cnt += n - j ;
            // After counting, we can break out of the inner loop because all subsequent pairs
            // with the current 'arr[i]' would also satisfy the condition.
            break ;
         }
      }
   }

   // --- Output ---

   // Print the calculated count for the current data set to the console.
   console . log( cnt ) ;

} // End of the while(true) loop.