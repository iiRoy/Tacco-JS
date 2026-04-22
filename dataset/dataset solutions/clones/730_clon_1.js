// This JavaScript program processes numerical data from standard input.
// It continuously reads sets of three integers (x, y, s) until a termination condition is met.
// For each set, it calculates a maximum value based on nested loops and specific arithmetic operations.

var input = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ; // Reads the entire content of standard input as a UTF-8 string.

var Arr = ( input . trim ( ) ) . split ( "\n" ) ; // Trims any leading/trailing whitespace from the input and splits it into an array of strings, one for each line.

// The main processing loop. It continues indefinitely until explicitly broken out of.
while ( true )
{
   // Extracts the first line from the 'Arr' array, splits it by spaces, and converts each part to a number.
   var xys = Arr . shift ( ) . split ( " " ) . map ( Number ) ;

   var x = xys [ 0 ] ; // Assigns the first number to variable 'x'.
   var y = xys [ 1 ] ; // Assigns the second number to variable 'y'.
   var s = xys [ 2 ] ; // Assigns the third number to variable 's'.

   // Checks for the termination condition: if all three numbers are zero.
   if ( x == 0 && y == 0 && s == 0 )
   {
      break ; // Exits the 'while' loop if the termination condition is met.
   }

   var max = 0 ; // Initializes a variable 'max' to 0 for tracking the maximum value found in the current iteration.

   // Outer loop: iterates with variable 'i' from 1 up to 's - 1'.
   for ( var i = 1 ; i <= s - 1 ; i ++ )
   {
      // Inner loop: iterates with variable 'j' from 1 up to 's - 1'.
      for ( var j = 1 ; j <= s - 1 ; j ++ )
      {
         // Calculates 'a' using 'i', 'j', and 'x' with specific percentage calculations and flooring.
         var a = Math . floor ( i * ( 100 + x ) / 100 ) + Math . floor ( j * ( 100 + x ) / 100 ) ;

         // If the calculated 'a' is greater than 's', it means further 'j' values for this 'i' will also be too large.
         if ( a > s )
         {
            break ; // Breaks out of the inner 'for' loop and proceeds to the next 'i'.
         }

         // If 'a' is exactly equal to 's', then a potential match is found.
         if ( a == s )
         {
            // Calculates 'b' using 'i', 'j', and 'y' with similar percentage calculations and flooring.
            var b = Math . floor ( i * ( 100 + y ) / 100 ) + Math . floor ( j * ( 100 + y ) / 100 ) ;

            // Updates 'max' if the newly calculated 'b' is greater than the current 'max' value.
            max = Math . max ( max , b ) ;

            // Since 'a == s' is met, no need to check further 'j' values for this 'i'.
            break ; // Breaks out of the inner 'for' loop and proceeds to the next 'i'.
         }
      }
   }

   // Prints the maximum value found for the current set of (x, y, s) to the console.
   console . log ( max ) ;
}

// End of the program.