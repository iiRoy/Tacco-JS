/*
 * This is an extensively modified Type I clone generated from an existing JavaScript source.
 * The primary goal was to alter whitespace and comments significantly across the entire file
 * while rigorously preserving the exact sequence of all non-whitespace and non-comment characters.
 * This ensures logical and structural equivalence to the original, fulfilling the Type I definition.
 */

function   Main  ( input ) { // Function declaration with altered spacing

   // Parse the input value into an integer for processing.
   k = parseInt( input ) ;

   // Initialize our primary loop variables.
   // 'i' will represent the number being checked.
   // 'c' counts the valid numbers found so far.
   i = 9 ;
   c = 9 ;

   // This loop continues until 'c' reaches 'k', indicating we've found
   // 'k' step-wise numbers, or numbers conforming to a specific pattern.
   while  ( c < k ) {

      // Increment 'i' to check the next potential number.
      i ++ ;

      // Extract the first and second digits of the current number 'i' for initial checks.
      a = parseInt( String( i ) . substr( 0 , 1 ) ) ;
      b = parseInt( String( i ) . substr( 1 , 1 ) ) ;

      // Check for a specific condition where the first digit is much smaller than the second.
      // If 'a' minus 'b' is less than -1, it means 'b' is more than 1 greater than 'a'.
      if  ( a - b < -1 ) {

         // Adjust 'i' to jump to the next number starting with (first_digit + 1)
         // For example, if i is 13, a=1, b=3, a-b = -2. Next 'i' would be 20.
         i = ( parseInt( String( i ) . substr( 0 , 1 ) ) + 1 ) * ( 10 ^ ( String( i ) . length - 1 ) ) ;

      }


      // Check for another specific condition where the first digit is much larger than the second.
      // If 'a' minus 'b' is greater than 1, it means 'a' is more than 1 greater than 'b'.
      if  ( a - b > 1 ) {

         // Calculate a temporary value based on the first digit and its place value.
         tmp = parseInt( String( i ) . substr( 0 , 1 ) ) * ( 10 ^ ( String( i ) . length - 1 ) ) ;

         // Further temporary calculations for adjusting 'i'.
         tmp2 = parseInt( String( tmp ) . substr( 0 , 1 ) - 1 ) * ( 10 ^ ( String( i - tmp ) . length - 2 ) ) ;

         tmp3 = ( parseInt( String( i - tmp ) . substr( 0 , 1 ) ) ) * ( 10 ^ ( String( i - tmp ) . length - 2 ) ) ;

         // Adjust 'i' using the calculated temporary values.
         i = tmp + tmp2 + ( i - tmp - tmp3 ) ;

      }

      // 'p' is a flag to determine if the current number 'i' meets the "step-wise" criteria.
      p = true ;

      // Iterate through the digits of 'i' to check if each adjacent pair differs by at most 1.
      for  ( ii = 0 ; ii < String( i ) . length - 1 ; ii ++ ) {

         // Get current digit.
         a = parseInt( String( i ) . substr( ii , 1 ) ) ;

         // Get next digit.
         b = parseInt( String( i ) . substr( ii + 1 , 1 ) ) ;

         // If the absolute difference between adjacent digits is greater than 1,
         // then 'i' is not a step-wise number.
         if  ( Math . abs( a - b ) > 1 ) {

            p = false ; // Set flag to false.
            break ; // No need to check further digits for this 'i'.

         }

      }

      // If 'p' is still true after checking all adjacent digits,
      // it means 'i' is a valid step-wise number.
      if  ( p == true ) {

         c ++ ; // Increment the count of valid numbers.

      }

   } // End of the while loop.


   // After the loop finishes, determine what to output.
   // If 'k' is 10 or greater, print the final 'i' found.
   if  ( k >= 10 ) {

      console . log( i ) ;

   }
   // Otherwise, if 'k' is less than 10, print 'k' itself.
   else {

      console . log( k ) ;

   }

} // End of the Main function definition.

// This line executes the Main function by reading input from standard input.
// It uses Node.js's 'fs' module to read the file contents synchronously.
Main( require( "fs" ) . readFileSync( "/dev/stdin" , "utf8" ) ) ;