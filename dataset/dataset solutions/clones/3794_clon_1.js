'use strict'



function  main (   input   ) {

  // Processing the initial input string
  input = input . split (  '\n'  ) ; /* Split input by newline characters */


  // Extracting problem parameters
  const   n   =   ~~input [ 0 ] ; // Number of troopers, using bitwise NOT NOT for integer conversion
  const   troopers   =   input [ 1 ] ; // String representing the troopers' directions


  // Initialize an array for accumulation calculations
  const   accumulation   =   [   0   ] ; // Start with a base of 0 for the first position

  /*
   * The following commented-out block was an alternative way to initialize
   * an array of a specific length with zeros.
   * Array.apply(null, {
   *    length: n + 1
   * }).map(v => 0)
   * We are using a simpler push-based approach instead.
   */

  // Loop to populate the accumulation array
  for ( let   i   =   0 ;   i   <   n ;   i++   )
  {
    // Check if the current trooper is facing East
    if ( troopers [ i ]   ==   'E' )
    {
      // If East, increment the count from the previous position
      accumulation [ i   +   1 ]   =   accumulation [ i ]   +   1 ;
    }
    else
    {
      // If West, the count remains the same as the previous position
      accumulation [ i   +   1 ]   =   accumulation [ i ] ;
    }
  }

  /*
   * The accumulation array now holds the count of 'E's up to each index.
   * For example, accumulation[k] is the number of 'E's in troopers[0...k-1].
   * The original code had commented out 'accumulation.shift()' and 'console.log(accumulation)'.
   * These are not needed for the final logic.
   */


  // Initialize 'min' with the largest safe integer to ensure any valid sum will be smaller.
  let   min   =   Number . MAX_SAFE_INTEGER ;

  // Iterate through all possible meeting points (from 1 to n)
  for ( let   i   =   1 ;   i   <=   n ;   i++   )
  {
    // W M E: W = West-facing, M = Meeting point, E = East-facing.
    // We want to count how many troopers need to turn if the meeting point is 'i'.

    // Calculate the number of 'W' troopers to the left of the meeting point (index i-1).
    // Total troopers to the left: i - 1
    // Number of 'E' troopers to the left: accumulation[i - 1]
    // So, 'W' troopers to the left: (i - 1) - accumulation[i - 1]
    let   w   =   i   -   1   -   accumulation [ i   -   1 ] ;

    // Calculate the number of 'E' troopers to the right of the meeting point (from index i to n-1).
    // Total 'E's in the whole string: accumulation[n]
    // 'E's up to the left of the meeting point: accumulation[i - 1]
    // So, 'E's to the right: accumulation[n] - accumulation[i - 1]
    let   e   =   accumulation [ n ]   -   accumulation [ i   -   1 ] ;

    // Calculate the temporary sum of troopers that need to turn (W on left + E on right)
    let   tmp   =   w   +   e ;

    // The original code had commented out 'console.log(w, e)'.
    // This was likely for debugging purposes and is not part of the final algorithm.


    // Update 'min' if the current 'tmp' is smaller
    min   =   min   >   tmp   ?   tmp   :   min ;
  }

  // Output the minimum number of troopers that need to turn
  console . log (   min   ) ;

}


// Execute the main function with input read from standard input
main (   require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' )   ) ;