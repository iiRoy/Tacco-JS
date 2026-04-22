/*
 * This JavaScript code defines a puzzle solver.
 * It first pre-calculates a set of valid number combinations
 * and then processes input strings to find digits that can be appended
 * to form one of these valid combinations, respecting certain rules.
 */
function Puzzle ( ) {
   // Initialize an empty object that will serve as a hash set
   // to store unique sorted number combinations.
   var obj = { } ;

   // Define the first array of string segments.
   // These segments are 3-digit numbers.
   var arrA = "123,234,345,456,567,678,789,111,222,333,444,555,666,777,888,999" . split ( "," ) ;

   // Define the second array of string segments.
   // These segments are 2-digit numbers.
   var arrB = "11,22,33,44,55,66,77,88,99" . split ( "," ) ;

   // This section involves five nested loops.
   // It generates all possible combinations by picking one element from arrA four times
   // and one element from arrB once.
   for ( var i = 0 ; i < 16 ; i ++ ) {
      for ( var j = 0 ; j < 16 ; j ++ ) {
         for ( var k = 0 ; k < 16 ; k ++ ) {
            for ( var l = 0 ; l < 16 ; l ++ ) {
               for ( var m = 0 ; m < 9 ; m ++ ) {
                  // Concatenate the selected string segments.
                  // For example: "123" + "234" + "345" + "456" + "11"
                  var str = arrA [ i ] + arrA [ j ] + arrA [ k ] + arrA [ l ] + arrB [ m ] ;

                  // Process the concatenated string:
                  // 1. Split the string into an array of individual characters (e.g., ["1", "2", "3", ...]).
                  // 2. Map each character to its numerical value (e.g., [1, 2, 3, ...]).
                  // 3. Sort the array of numbers in ascending order.
                  // 4. Join the sorted numbers back into a single string.
                  str = str . split ( "" ) . map ( Number ) . sort ( function ( a , b ) {
                     return a - b ; // Standard numeric sort comparison.
                  } ) . join ( "" ) ;

                  // Add the resulting sorted string as a key to the 'obj' object,
                  // with a value of 'true'. This indicates that this combination is valid.
                  obj [ str ] = true ;

               } // End of innermost loop (m)
            } // End of fourth loop (l)
         } // End of third loop (k)
      } // End of second loop (j)
   } // End of outermost loop (i)

   // Return the object containing all valid sorted number combinations.
   return obj ;

} // End of Puzzle function

// Execute the Puzzle function once to pre-compute all valid combinations.
// The result is stored in the global variable P.
var P = Puzzle ( ) ;

// Read the entire standard input as a UTF-8 string.
// This requires the 'fs' module, typical in Node.js environments.
var input = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ;

// Process the input string:
// 1. Remove any leading or trailing whitespace.
// 2. Split the string into an array of lines, using the newline character as a delimiter.
var Arr = ( input . trim ( ) ) . split ( "\n" ) ;

// Begin the main processing loop. This loop continues indefinitely
// until explicitly broken from within.
while ( true ) {

   // Check if the input array is empty.
   if ( Arr . length == 0 ) {
      break ; // If no more lines to process, exit the loop.
   }

   // Retrieve and remove the first line from the input array.
   var str = Arr . shift ( ) ;

   // Initialize an array to store the valid digits that can be appended
   // to the current 'str' to form a valid combination.
   var ans = [ ] ;

   // Iterate through possible digits from 0 to 8.
   for ( var i = 0 ; i < 9 ; i ++ ) {
      // Convert the current input string 'str' into an array of numbers.
      // E.g., "12345" becomes [1, 2, 3, 4, 5].
      var arr = str . split ( "" ) . map ( Number ) ;

      // Append the current candidate digit 'i' to the array.
      arr . push ( i ) ;

      // Sort the combined array of numbers.
      arr . sort ( function ( a , b ) {
         return a - b ; // Numeric sort.
      } ) ;

      // Initialize a frequency counter for digits 0 through 8.
      var cnt = [ 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 ] ;

      // Populate the frequency counter by iterating through the sorted array.
      arr . forEach ( function ( v ) {
         cnt [ v ] ++ ;
      } ) ;

      // Find the maximum frequency of any digit in the 'cnt' array.
      var max = Math . max . apply ( null , cnt ) ;

      // Rule check: If any digit appears 5 or more times, this combination is invalid.
      if ( max >= 5 ) {
         continue ; // Skip to the next iteration of the inner loop (next digit 'i').
      }

      // Check if the sorted numeric string (after joining) exists as a key
      // in the pre-calculated 'P' object.
      if ( P . hasOwnProperty ( arr . join ( "" ) ) ) {
         // If it exists, then 'i' is a valid digit to append.
         ans . push ( i ) ;
      }

   } // End of inner loop (for i)

   // Output the result for the current input line.
   // If no valid digits were found (ans array is empty), print "0".
   // Otherwise, print the valid digits joined by spaces.
   console . log ( ( ans . length == 0 ) ? "0" : ans . join ( " " ) ) ;

} // End of main while loop