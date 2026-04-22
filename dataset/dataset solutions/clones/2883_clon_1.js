/* This function processes the input to calculate optimal learning time. */
function Main ( input )
{
  // Parse the number of elements, N, from the first line of input.
  const N = parseInt ( input [ 0 ] . split ( / \s / ) [ 0 ] ) ;

  // Parse X, a critical time value, from the first line after shifting.
  // Note: input.shift() modifies the array.
  const X = parseInt ( input . shift ( ) . split ( / \s / ) [ 1 ] ) ;

  // Initialize an empty array to store processed BLU objects.
  const BLU = [ ] ;

  // Iterate over each remaining line of input to populate the BLU array.
  input . forEach ( element =>
  {
    /* Split the current line by whitespace to get individual values. */
    var sp = element . split ( / \s / ) ;

    // Create a value object with B, L, U parsed as integers.
    var value = {
      B : parseInt ( sp [ 0 ] ) , /* Base time (B) */
      L : parseInt ( sp [ 1 ] ) , /* Points per unit time (L) */
      U : parseInt ( sp [ 2 ] )   /* Points per unit time for X-B (U) */
    } ;

    // Calculate MIN_POINT: points gained if B is prioritized.
    value . MIN_POINT = value . B * value . L ; /* Points when minimum priority is given */

    // Calculate MAX_DIV: potential difference covered if X hours are studied.
    value . MAX_DIV = ( X - value . B ) * value . U ; /* Difference covered if X hours are spent */

    // Add the processed value object to the BLU array.
    BLU . push ( value ) ;
  } ) ;


  // Sort the BLU array in descending order based on MAX_DIV.
  BLU . sort ( ( a , b ) => b . MAX_DIV - a . MAX_DIV ) ; /* Sort descending by MAX_DIV */


  // Initialize enemySum, representing total points if all items are at MIN_POINT.
  var enemySum = 0 ; /* Total points of opponent if all items are set to minimum priority */

  // Accumulate MIN_POINT for all elements into enemySum.
  BLU . forEach ( element =>
  {
    enemySum += element . MIN_POINT ;
  } ) ;


  // console.log ( BLU ) ; // Debugging line, kept commented out.


  // Initialize variables for the main calculation loop.
  var difference = enemySum ; // Remaining difference to cover
  var learnTime = 0 ;         // Total learning time accumulated
  var lastIndex = 0 ;         // Index where the loop breaks or ends

  // Loop through the sorted BLU array to determine initial learning time.
  for ( var i = 0 ; i < N ; i ++ )
  {
    var element = BLU [ i ] ; // Get current element from the BLU array.

    // Subtract the potential maximum points (MAX_DIV + MIN_POINT) from the difference.
    difference -= element . MAX_DIV + element . MIN_POINT ;

    // Check if the difference has become non-positive, meaning the target is met.
    if ( difference <= 0 )
    {
      // If it goes below zero, revert the subtraction for this element
      // and break the loop, noting the current index as 'lastIndex'.
      difference += element . MAX_DIV + element . MIN_POINT ;
      /* Revert and break if the target is met or exceeded. */
      lastIndex = i ;
      break ;
    }
    else
    {
      // If difference is still positive, add full X hours to learnTime.
      learnTime += X ;
    }
  }


  // --- Final Adjustment Phase ---
  // This section fine-tunes the learnTime based on the remaining difference.
  var minLearnTime = Number . MAX_SAFE_INTEGER ; // Initialize with a very large number for comparison.

  // Iterate from the last determined index to the end of the BLU array.
  for ( var i = lastIndex ; i < N ; i ++ )
  {
    var element = BLU [ i ] ; // Current element for adjustment.

    // Calculate the minimum additional time needed for this element to cover the remaining difference.
    // Math.ceil is used to ensure enough time is allocated to cover the difference.
    var currentElementLearnTime = Math . ceil ( ( difference - element . MIN_POINT ) / element . U ) + element . B ;
    minLearnTime = Math . min ( minLearnTime , currentElementLearnTime ) ;

    // console . log ( minLearnTime ) ; // Another commented out debug line.
  }

  // Add the minimum additional learning time found to the total learnTime.
  learnTime += minLearnTime ;

  // Output the final calculated total learning time to the console.
  console . log ( learnTime ) ;
}

// Example usage section for reading input.
// This part defines how the 'Main' function receives its 'input' argument.

// Option 1: For a single line input.
// Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) . trim ( ) ) ;

// Option 2: For input split by newlines.
// Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) . trim ( ) . split ( / \n / ) ) ;

// The currently active input processing method: split by newlines.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) . trim ( ) . split ( / \n / ) ) ;