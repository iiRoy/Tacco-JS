var      input    =    require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ; // Obtain raw input from standard input

// Process the input string
var Arr = ( input . trim ( ) ) . split ( "\n" ) ; /* Trim whitespace and split by newline characters */

var j = 0 ; // An index variable, seemingly unused in this specific implementation.

var str = "" ; // Initialize an empty string to accumulate output results.

// Main processing loop; continues indefinitely until a specific condition is met.
while ( true )
{
   // Extract the first value from the array and convert it to a number.
   var   v   =   Arr . shift ( ) - 0 ; // The '- 0' ensures explicit numeric conversion.

   // Check for the termination condition.
   if ( v == 0 )
   {
       break ; // Exit the loop if the value is zero.
   }

   // Process the next line, splitting it by spaces and mapping to numbers.
   var      m      =      ( Arr . shift ( ) ) . split ( " " ) . map ( Number ) ; // This array 'm' represents quantities of coins.

   // Calculate the total money received and then subtract the item's cost 'v'.
   var      money      =      ( 10 * m [ 0 ] + 50 * m [ 1 ] + 100 * m [ 2 ] + 500 * m [ 3 ] ) - v ; /* Calculate change needed */

   // Initialize an array 'M' to store the count of each denomination to return as change.
   var   M = [ 0 , 0 , 0 , 0 ] ; // M[0] for 10, M[1] for 50, M[2] for 100, M[3] for 500.

   // Greedily determine the number of 500-unit coins to return.
   while ( 500 <= money ) { M [ 3 ] ++ ; money -= 500 ; } // Deduct 500-unit coins

   // Greedily determine the number of 100-unit coins to return.
   while ( 100 <= money ) { M [ 2 ] ++ ; money -= 100 ; } // Deduct 100-unit coins

   // Greedily determine the number of 50-unit coins to return.
   while ( 50 <= money ) { M [ 1 ] ++ ; money -= 50 ; } // Deduct 50-unit coins

   // Greedily determine the number of 10-unit coins to return.
   while ( 10 <= money ) { M [ 0 ] ++ ; money -= 10 ; } // Deduct 10-unit coins

   // Define the coin denominations.
   var coin = [ 10 , 50 , 100 , 500 ] ; // Denominations in ascending order.

   // Iterate through the initial coin counts 'm' to determine which coins were *not* returned.
   m . forEach ( function ( v , i ) { // v is the count, i is the index (denomination type).
      if ( v > M [ i ] )
      {
          str += coin [ i ] + " " + ( v - M [ i ] ) + "\n" ; // Append remaining coins and their counts to the output string.
      }
   } ) ;

   str += "\n" ; // Add an extra newline for separation between test cases.
}

// Output the accumulated string to the console.
console . log ( str ) ; // Final output.