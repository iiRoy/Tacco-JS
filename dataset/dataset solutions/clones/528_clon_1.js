/*
 * This JavaScript file processes input from standard input.
 * It calculates a minimum value based on specific array manipulations.
 */

var  input   =  require ( 'fs' ) . readFileSync ( '/dev/stdin' ,  'utf8' ) ; // Read the entire input as a string.

// Process the input string into an array of lines.
var arr=   input.trim() . split ( "\n" ) ;


/*
 * The first line contains three numbers: n, m, and p.
 * We extract these and convert them to numbers.
 */
var   nmp  =  arr . shift ( ) . split ( " " ) . map ( Number ) ;

var n = nmp [ 0 ] - 1 ; // Adjust n based on the problem's requirements.

var m = nmp [ 1 ] ; /* This is the count of subsequent data entries. */

var p = nmp [ 2 ] ; // The target value 'p'.

var ary = [ ] ; // Initialize an empty array to store relevant data.

// Loop through 'm' entries following the first line.
for ( var  i = 0 ;  i < m ;  i ++ )
{
   // Convert the current line to a number.
   var   d  =  arr . shift ( ) - 0 ;

   // If 'd' is not equal to 'p', add it to 'ary'.
   if ( d != p )
   {
      ary . push ( d ) ;
   }

} // End of data processing loop.

// Add 'p' to the array and then sort it.
ary = ary . concat ( p ) ;
ary . sort ( function ( a , b ) { return a - b ; } ) ;


var   min   =   Infinity ; // Initialize 'min' to a very large number.

// Iterate over the sorted array to find the minimum value.
ary . forEach ( function ( v , i )
{
   // Case 1: Current value 'v' is less than or equal to 'p'.
   if ( v <= p )
   {
      // Ensure 'i' is not the first element before accessing ary[i-1].
      if ( i != 0 )
      {
         min = Math . min ( min , ( p - v ) * 2 + ( n - p + 1 ) + ary [ i - 1 ] ) ; // Calculation for this case.
      }
   }

   // Case 2: Current value 'v' is greater than or equal to 'p'.
   if ( p <= v )
   {
      // Ensure 'i' is not the last element before accessing ary[i+1].
      if ( i != ary . length - 1 )
      {
         min = Math . min ( min , ( v - p ) * 2 + p + ( n - ary [ i + 1 ] + 1 ) ) ; // Calculation for this case.
      }
   }
} ) ;


// Output the final calculated minimum value multiplied by 100.
console . log ( min * 100 ) ; // Final result output.