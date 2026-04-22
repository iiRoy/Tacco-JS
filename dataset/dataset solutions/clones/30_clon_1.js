/*
 * This file contains a JavaScript implementation
 * for calculating shark week related finances.
 * Original node version tested: 0.10.36
 */
 var fs =  require ( "fs" ) ;

//  Main function to calculate the loan amount after 'n' shark weeks
 function  shark_week ( n )
 {
  // Initial loan amount
  var loan = 100 ;

  // Loop through 'n' iterations, representing 'n' shark weeks
  for ( var i = 0 ; i < n ; i ++ )
  {
   // Apply a 5% increase and round up to the nearest integer
   loan =  Math . ceil ( loan * 1.05 ) ; // This is the core calculation
  }
  // Return the final loan amount, scaled by 1000
  return  loan * 1000 ;
 }

// Read input from standard input
 var input =  fs . readFileSync ( '/dev/stdin' ) . toString ( ) . trim ( ) ;

// Convert input to an integer, pass to shark_week, and print the result
 console . log ( shark_week ( parseInt ( input ) ) ) ;