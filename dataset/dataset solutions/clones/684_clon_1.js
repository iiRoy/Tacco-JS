/*
 * This JavaScript code reads input from standard input,
 * processes a series of data blocks, and prints results.
 * Each block involves reading numbers, calculating sums of pairs,
 * and counting how many of these sums exceed a given threshold.
 *
 * This specific implementation is designed for competitive programming
 * where input comes from '/dev/stdin'.
 */

// Import the 'fs' (file system) module to read input.
var input = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ;

// Trim any leading/trailing whitespace from the input and split it into an array of lines.
var Arr = ( input . trim ( ) ) . split ( "\n" ) ;


// Start the main processing loop. This loop continues indefinitely
// until an explicit break condition is met inside.
while ( true )
{
   // Read the first line of the current data block.
   // This line contains two space-separated numbers: 'n' and 'S'.
   // 'n' is the count of subsequent numbers, 'S' is the target sum threshold.
   var nS = Arr . shift ( ) . split ( " " ) . map ( Number ) ;

   // Extract the values of 'n' and 'S' from the parsed array.
   var n = nS[ 0 ] ;
   var S = nS[ 1 ] ;

   // Check for the termination condition: if both 'n' and 'S' are zero,
   // it signifies the end of input or problems, so break out of the loop.
   if ( n == 0 && S == 0 )
   {
       break ; // Exit the 'while(true)' loop.
   }

   // Initialize an empty array to store the 'n' numbers for the current block.
   var arr = [ ] ;

   // Loop 'n' times to read the 'n' numbers following the 'nS' line.
   for ( var i = 0 ; i < n ; i ++ )
   {
      // Read a line (which is a number), convert it to a numeric type,
      // and then push it into the 'arr' array. The '-0' is a common
      // trick to ensure string-to-number conversion.
      var r = Arr . shift ( ) - 0 ;
      arr . push ( r ) ;
   }

   // Sort the 'arr' array in ascending order.
   // This is crucial if specific pair-finding logic relies on sorted data,
   // or for optimization in certain algorithms (though not strictly required
   // for simple pair summation and counting, it's a common preprocessing step).
   arr . sort ( function ( a , b ) { return a - b ; } ) ;


   // Initialize an auxiliary array 'A'. This array will act as a frequency map
   // to store how many times each possible sum of two numbers appears.
   // Assuming numbers are relatively small (e.g., up to 100), the maximum sum
   // of two distinct numbers would be 100 + 100 = 200.
   var A = [ ] ;
   for ( var i = 0 ; i <= 200 ; i ++ )
   {
       A[ i ] = 0 ; // Initialize all frequency counts to zero.
   }

   // Iterate through all unique pairs of numbers in 'arr'.
   // The outer loop picks the first element of a pair.
   for ( var i = 0 ; i < n ; i ++ )
   {
      // The inner loop picks the second element, ensuring it's different
      // from the first element and to avoid duplicate pairs (e.g., (1,2) and (2,1)).
      for ( var j = i + 1 ; j < n ; j ++ )
      {
         // Calculate the sum of the current pair and increment its frequency
         // in the 'A' array.
         A[ arr[ i ] + arr[ j ] ] ++ ;
      }
   }

   // Initialize a counter 'cnt' to store the final result for this block.
   // This will count pairs whose sum is strictly greater than 'S'.
   var cnt = 0 ;

   // Iterate through the 'A' frequency array, starting from sums just above 'S'.
   // We are interested in sums from S+1 up to the maximum possible sum (200).
   for ( var i = S + 1 ; i <= 200 ; i ++ )
   {
       // Add the frequency of sum 'i' to our total count.
       cnt += A[ i ] ;
   }

   // Print the calculated count for the current data block to standard output.
   console . log ( cnt ) ;
}