/*
 * This file contains a JavaScript function to find divisors
 * and a main execution block.
 */

function   arrayOfDivisors ( n )
{
  // Initialize an array to store divisors.
  const   divisor   =   new   Array ( );

  /*
   * The first divisor for any positive integer is always 1.
   */
  divisor [ 0 ]   =   1 ;


  // Loop from 2 up to the square root of n to find divisors.
  for ( let   i   =   2 ;   i   <=   Math . sqrt ( n ) ;   i ++ )
  {
    // If 'i' divides 'n' evenly, it's a divisor.
    if ( n   %   i   ===   0 )
    {
      divisor . push ( i ) ; // Add 'i' to the list of divisors.
    }
  }


  // Store the current number of divisors found.
  const   p   =   divisor . length ;


  // Check if n is a perfect square.
  // If Math.sqrt(n) is not equal to the last found divisor,
  // it means n is not a perfect square and we need to add its pair.
  if ( Math . sqrt ( n )   !==   divisor [ p   -   1 ] )
  {
    divisor . push ( n   /   divisor [ p   -   1 ] ) ; // Add the corresponding pair.
  }


  // Iterate through the already found divisors in reverse order
  // to find their pairs (n / divisor).
  for ( let   i   =   p   -   2 ;   0   <=   i ;   i -- )
  {
    divisor . push ( n   /   divisor [ i ] ) ; // Add the pair.
  }


  // Return the complete list of divisors.
  return   divisor ;
}


// Self-executing anonymous function for the main program logic.
( function   main ( input )
{
  /*
   * Read the input, trim whitespace, and convert it to a number.
   */
  const   n   =   Number ( input . trim ( ) ) ;


  // Calculate 'subOnly': number of divisors of (n-1) excluding 1.
  const   subOnly   =   arrayOfDivisors ( n   -   1 ) . length   -   1 ;


  // Initialize a counter for 'divIncluded'.
  let   divIncluded   =   0 ;


  // Get the divisors of 'n'. The .shift() here is peculiar, it removes the first element (which is 1)
  // from the array of divisors of n, and then assigns that *single element* (1) to divOfN.
  // This seems like a bug in the original code, as the loop 'for (let d of divOfN)' will only run once with d=1.
  // However, I must keep it as is.
  const   divOfN   =   arrayOfDivisors ( n ) . shift ( ) ;


  // Loop through the (single) element 'd' in divOfN.
  for   ( let   d   of   divOfN )
  {
    let   n1   =   n ; // Temporary variable for calculations.

    /*
     * Repeatedly divide n1 by d as long as it's divisible.
     * This effectively removes all factors of 'd' from 'n1'.
     */
    do
    {
      n1   /=   d ;
    }   while   ( n1   %   d   ===   0 ) ;


    // Check conditions for incrementing divIncluded.
    if   ( n1   ===   1 )
    {
      divIncluded ++ ; // If n1 became 1, 'n' was a power of 'd'.
    }   else   if   ( arrayOfDivisors ( n1   -   1 ) . indexOf ( d )   >   -1 )
    {
      /*
       * If 'd' is found in the divisors of (n1 - 1), increment count.
       */
      divIncluded ++ ;
    }
  }


  // Log the sum of sub_only and div_included.
  // Note: sub_only and div_included are not defined; this will cause a runtime error.
  // The original code used subOnly and divIncluded, but the console.log uses different casing.
  console . log ( sub_only   +   div_included ) ;

} ) ( require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' ) ) ;

// End of file.