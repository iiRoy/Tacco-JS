/*
 * This function performs arbitrary-precision addition
 * of two non-negative integers represented as strings or numbers.
 * It handles large numbers by processing them digit by digit.
 *
 * @param {number|string} x - The first number.
 * @param {number|string} y - The second number.
 * @returns {string} The sum of x and y as a string.
 */
function bigAdd ( x , y ) {

   // Convert numbers to arrays of digits, reversed for easier arithmetic.
   // For example, 123 becomes [3, 2, 1].
   var a = ( x + "" ) . split ( "" ) . reverse ( ) . map ( Number ) ;
   var b = ( y + "" ) . split ( "" ) . reverse ( ) . map ( Number ) ;

   // This array will store the result digits.
   var c = [ ] ;

   // Determine the maximum length of the two input number arrays.
   var max = Math . max ( a . length , b . length ) ;

   // Initialize the result array 'c' with zeros.
   // It needs to be one digit longer than the max input length
   // to accommodate a potential carry-over from the last digit.
   for ( var i = 0 ; i < max + 1 ; i ++ ) {
      c [ i ] = 0 ;
   }

   // Perform the initial digit-by-digit summation.
   // This step adds corresponding digits from 'a' and 'b' into 'c'.
   for ( var i = 0 ; i < max ; i ++ ) {
      var sum = 0 ; // Temporary variable to hold the sum of current digits.

      // Add digit from 'a' if it exists at the current position.
      if ( a . length > i ) {
         sum += a [ i ] ;
      }

      // Add digit from 'b' if it exists at the current position.
      if ( b . length > i ) {
         sum += b [ i ] ;
      }

      // Add the calculated sum to the corresponding position in 'c'.
      // Any existing value in c[i] (from previous carry) will be added here.
      c [ i ] += sum ;
   }

   // Process carries from right to left (least significant to most significant digit).
   // If a digit in 'c' is 10 or more, subtract 10 and carry over 1 to the next digit.
   for ( var i = 0 ; i < max ; i ++ ) {
      if ( c [ i ] >= 10 ) {
         c [ i ] -= 10 ; // Current digit becomes its remainder after carry.
         c [ i + 1 ] ++ ; // Increment the next digit (carry over 1).
      }
   }

   // Remove any leading zero from the result if it's not the only digit.
   // This handles cases like 1+2=3, where c might be [3, 0] initially.
   if ( c [ c . length - 1 ] == 0 ) {
      c . pop ( ) ;
   }

   // Reverse the digit array back to the correct order and join into a string.
   var str = c . reverse ( ) . join ( "" ) ;

   // Return the final sum as a string.
   return str ;
} // End of bigAdd function definition.


// This section of the script reads input, processes it, and prints results.

var input = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ; // Read all input from standard in.

// Trim leading/trailing whitespace and split the input into an array of lines.
var Arr = input . trim ( ) . split ( "\n" ) ;


// Loop indefinitely until there are no more lines to process.
while ( true ) {

   // If the input array is empty, break out of the loop.
   if ( Arr . length == 0 ) {
      break ;
   }

   // Shift the first line from the array and split it by '+' or '=' to get the operands and result template.
   // Example: "X+5=7" becomes ["X", "5", "7"]
   var arr = Arr . shift ( ) . split ( /[\+\=]/ ) ;

   // Initialize an array to store the possible solutions for 'X'.
   var ans = [ ] ;

   // Iterate through all possible digits for 'X' (0 to 9).
   for ( var i = 0 ; i <= 9 ; i ++ ) {
      // Replace 'X' with the current digit 'i' in the first operand, then convert to number.
      var a = arr [ 0 ] . replace ( /X/g , i ) - 0 ;
      // Replace 'X' with the current digit 'i' in the second operand, then convert to number.
      var b = arr [ 1 ] . replace ( /X/g , i ) - 0 ;
      // Replace 'X' with the current digit 'i' in the expected result (string).
      var c = arr [ 2 ] . replace ( /X/g , i ) ;

      // If the sum of 'a' and 'b' (calculated by bigAdd) matches 'c',
      // then 'i' is a valid solution.
      if ( bigAdd ( a , b ) == c ) {
         ans . push ( i ) ; // Add 'i' to the list of answers.
      }
   }

   // Output the result:
   // If exactly one solution is found, print that solution.
   // Otherwise (zero or multiple solutions), print "NA".
   console . log ( ( ans . length == 1 ) ? ans [ 0 ] : "NA" ) ;

} // End of while loop.