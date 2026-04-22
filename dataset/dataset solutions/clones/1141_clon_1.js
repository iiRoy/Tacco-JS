/*
 * This JavaScript module defines a function to compute the Length of the Longest Increasing Subsequence (LIS)
 * from an input array `T`, which is read from standard input.
 *
 * The LIS function employs a dynamic programming approach to determine the length of the longest subsequence
 * where each element is strictly greater than the preceding element.
 */
function LIS ( )
{
   // Declare and initialize a variable 'n'.
   // It is derived from the first element of the global array 'T', incremented by one.
   var n = T [ 0 ] + 1 ;

   // Initialize two empty arrays, 'L' and 'P'.
   // 'L' will store the length of the LIS ending at each index.
   var L = [ ] ;
   // 'P' will store the predecessor index for reconstructing the LIS path.
   var P = [ ] ;

   /*
    * A loop to pre-fill both 'L' and 'P' arrays with initial zero values.
    * The size of these arrays is determined by the previously calculated 'n'.
    */
   for ( var i = 0 ; i < n ; i ++ )
   {
      L . push ( 0 ) ; // Append a zero to the 'L' array.
      P . push ( 0 ) ; /* Append a zero to the 'P' array. */
   }

   // Set the value of the first element in array 'T' to zero.
   T [ 0 ] = 0 ;
   // Set the predecessor of the first element in 'P' to -1, indicating no predecessor.
   P [ 0 ] = -1 ;

   // This is the main loop that iterates through the array 'T' to compute LIS lengths.
   // It starts from the second element (index 1) up to the end of the array.
   for ( var i = 1 ; i < T . length ; i ++ )
   {
      // Initialize 'k' to 0. 'k' will hold the index of the best predecessor found for T[i].
      var k = 0 ;

      // Inner loop to scan elements preceding T[i] (from index 0 up to i-1).
      for ( var j = 0 ; j <= i - 1 ; j ++ )
      {
         /*
          * Check two conditions:
          * 1. If T[j] is strictly less than T[i] (meaning T[j] can be a predecessor for T[i]).
          * 2. If the LIS length ending at T[j] (L[j]) is greater than the current best LIS length found so far (L[k]).
          */
         if ( T [ j ] < T [ i ] && L [ j ] > L [ k ] )
         {
            k = j ; // If both conditions are met, update 'k' to 'j' as a better predecessor is found.
         }
      }

      // The LIS length ending at T[i] is 1 plus the LIS length ending at its best predecessor T[k].
      L [ i ] = L [ k ] + 1 ;
      // Store the index of the best predecessor 'k' in P[i].
      P [ i ] = k ;
   }

   // Calculate the maximum value within the 'L' array, which represents the overall LIS length.
   // Math.max.apply is used to find the maximum in an array.
   var max = Math . max . apply ( null , L ) ;
   // Output the computed maximum LIS length to the console.
   console . log ( max ) ;
}


// --- Global Code Execution Block ---

// Require the 'fs' (file system) module to read input.
// Read the entire content of '/dev/stdin' (standard input) as a UTF-8 string.
var input = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ;

/*
 * Process the 'input' string:
 * 1. Remove leading and trailing whitespace using 'trim()'.
 * 2. Split the string into an array of substrings using the newline character ("\n") as a delimiter.
 * 3. Use 'map(Number)' to convert each substring in the array to a numeric value.
 * The resulting array of numbers is assigned to the global variable 'T'.
 */
var T = ( input . trim ( ) ) . split ( "\n" ) . map ( Number ) ;

// Call the LIS function to execute the LIS calculation and print the result.
LIS ( ) ;