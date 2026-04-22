var input = require ( 'fs' ) . readFileSync ( '/dev/stdin', 'utf8' ); // Reads the entire input from stdin.

// Trim leading/trailing whitespace and split the input into an array of lines.
var Arr = ( input . trim () ) . split ( "\n" );

// The first element of the array 'Arr' is the count 'n'.
// Convert it to a number (the '-0' ensures numeric conversion).
var n = Arr . shift () - 0 ;

// Initialize two variables 'a' and 'b' to zero. These will accumulate sums.
var a = 0 ;
var b = 0 ;

// Loop 'n' times to process each subsequent line of input.
for ( var i = 0 ; i < n ; i ++ )
{
   // Get the next line from the 'Arr' array.
   var v = Arr . shift ();

   // Split the line by space and convert each part to a number.
   // This creates an array 'arr' with two numeric elements.
   var arr = v . split ( " " ) . map ( Number );

   // Check conditions based on the values in 'arr'.

   // If the first number is greater than the second:
   if ( arr [ 0 ] > arr [ 1 ] )
   {
      a += arr [ 0 ] + arr [ 1 ]; // Add both numbers to 'a'.
   }

   // If the first number is less than the second:
   if ( arr [ 0 ] < arr [ 1 ] )
   {
      b += arr [ 0 ] + arr [ 1 ]; // Add both numbers to 'b'.
   }

   // If the two numbers are equal:
   if ( arr [ 0 ] == arr [ 1 ] )
   {
      a += arr [ 0 ]; // Add the first number to 'a'.
      b += arr [ 1 ]; // Add the second number to 'b'.
   }
}

// After processing all lines, print the final values of 'a' and 'b',
// separated by a space, to the console (stdout).
console . log ( a + " " + b );