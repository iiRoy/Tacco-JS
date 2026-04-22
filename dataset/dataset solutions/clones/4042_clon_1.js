// This function processes the entire input string.
function Main ( input ) {

   // Split the input string by newline characters to get individual lines.
   var inp  =  input . split ( '\n' ) ;

   // Parse the first line as an integer for N.
   var N  =  parseInt ( inp [ 0 ] ) ;

   // Split the second line into an array of strings 'a'.
   var a  =  inp [ 1 ] . split ( ' ' ) ;

   // Split the third line into an array of strings 'b'.
   var b  =  inp [ 2 ] . split ( ' ' ) ;


   // Initialize a temporary variable 'tmp' to accumulate differences.
   var tmp  =  0 ;
   // Initialize 'dx' to store the difference for each pair.
   var dx   =  0 ;

   // Loop N times to calculate the sum of differences.
   for  ( var i  =  0 ;  i  <  N ;  i ++ )  {

      // Calculate the difference between corresponding elements of b and a.
      dx  =  ( parseInt ( b [ i ] )  -  parseInt ( a [ i ] ) ) ;

      // Add the difference to the temporary sum.
      tmp  +=  dx ;

   }


   // Check if the accumulated sum 'tmp' is odd or even.
   if  ( tmp  %  2  ===  1 )  {

      // If tmp is odd, print "Yes".
      console . log ( "%s" ,  "Yes" ) ;

   }  else  {

      // If tmp is even, print "No".
      console . log ( "%s" ,  "No" ) ;

   }

}

/*
 * Do not edit the lines below this point.
 * This part handles reading input from stdin and calling the Main function.
 */
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" ,  "utf8" ) ) ;