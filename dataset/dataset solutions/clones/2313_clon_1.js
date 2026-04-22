/**
 * @param {string[]} input - The raw input array from stdin.
 */
function  Main ( input )
{
  /* This is a comment indicating the type of the first parsed input element. */
  /**
   * @type {number[]} // An array of numbers.
   */
  const input0Numbered = input [ 0 ] . split ( ' ' ) . map ( Number ) ;

  const N = input0Numbered [ 0 ] ; // The first number represents N.
  const M = input0Numbered [ 1 ] ; /* The second number is M. */
  const V = input0Numbered [ 2 ] ; // This is V.
  const P = input0Numbered [ 3 ] ; /* And finally, P. */

  /**
   * @type {number[]}
   * This array, `alist`, holds the problem scores, sorted in ascending order.
   */
  const alist = input [ 1 ]
                      . split ( ' ' ) // Split the second input line by spaces.
                      . map ( Number ) // Convert each part to a number.
                      . sort ( ( v1 , v2 ) => v1 - v2 ) ; // Sort numerically, ascending.

  /*
   * This multi-line comment describes the overall algorithm strategy.
   *
   * 1. Initially, sort the array in ascending order.
   * 2. Identify the minimum score 'K' and account for its duplicates by
   *    reducing the available votes accordingly.
   * 3. Deduct one vote (v -= 1) as if all votes were cast for K.
   * 4. If, after giving M votes to K, the resulting score K2 is higher than
   *    subsequent scores, calculate the difference and subtract these from
   *    the remaining votes. Repeat this until M votes are used, storing the
   *    remainder as R.
   * 5. If the score of the V-th element from the end of the array (after adding M-R)
   *    is less than or equal to K2, proceed to step 5. Otherwise, remove K
   *    from consideration and restart from step 1.
   * 6. Once a problem that can be ranked within the top P is found, the
   *    final answer is the total number of problems minus the index of this
   *    problem (adjusted for duplicates).
   */

  v = V ; // Initialize 'v' with the value of 'V'.

  var ai, ai2, aj, r, j, reducedV, max = null ; // Declare multiple variables.

  // Search for the minimum score that allows a problem to be selected.
  for ( var i = 0 ; i < alist . length ; i ++ ) {
    // If the current problem has the same score as the next, skip it
    // and decrement the available votes. This handles duplicates.
    while ( alist [ i ] === alist [ i + 1 ] )
    {
      i ++ ; // Advance the index.
      v -- ; // Reduce available votes.
    }

    v -- ; // Decrement 'v' again, as if one vote is used for the current problem.

    ai = alist [ i ] ; // 'ai' stores the current problem's score.

    ai2 = ai + M ; // 'ai2' is the score of 'ai' after adding M votes.

    r = 0 ; // Initialize 'r' (remainder) to zero.

    // For problems with scores greater than 'ai' but less than 'ai2',
    // calculate the total difference that needs to be 'filled' by votes.
    for ( j = i + 1 ; alist [ j ] < ai2 ; j ++ )
    {
      r += ai2 - alist [ j ] ; // Accumulate the difference.
    }

    reducedV = Math . floor ( r / M ) ; // Calculate how many full 'M' vote blocks are needed.
    r = r % M ; // Calculate the remaining votes needed after full blocks.

    if ( v <= reducedV ) // Check if available votes are less than or full vote blocks required.
    {
      // If all votes are accounted for, 'ai' is the maximum possible score.
      max = ai ;
      break ; // Exit the loop.
    }

    // At this point, it's known that 'v' is less than the count of problems
    // from the current index 'i' to the end of the list.
    // This comment line was originally present and is preserved.
    // This時点で v < alist.length - (i + 1)


    // Distribute remaining votes to problems with higher scores,
    // starting from the highest.
    var voteds = alist . slice ( - ( v - reducedV ) ) // Take a slice from the end.
                       . map ( ( aj ) => aj + M ) ; // Add M votes to each in the slice.

    // If there's a remainder 'r' from the previous calculation,
    // distribute it among the 'voteds' problems, starting with the lowest scores.
    if ( r > 0 )
    {
      for ( j = 0 ; j < voteds . length ; j ++ )
      {
        aj = voteds [ j ] ; // Current score in 'voteds' array.

        // If subtracting 'r' would make 'aj' less than 'ai2',
        // cap it at 'ai2' and adjust 'r'.
        if ( aj - r < ai2 )
        {
          voteds [ j ] = ai2 ; // Set to 'ai2'.
          r -= aj - ai2 ; // Reduce 'r' by the amount adjusted.
        }
        else // Otherwise, simply subtract 'r' from 'aj'.
        {
          voteds [ j ] -= r ; // Subtract 'r'.
          r = 0 ; // 'r' is now zero.
          break ; // Exit inner loop.
        }
      }

      if ( r > 0 ) // If 'r' still has a value after the loop,
      {
        voteds [ voteds . length - 1 ] -= r ; // Subtract it from the last element.
      }
    }

    // Now, check if 'ai' can be ranked within the top 'P'.
    var k, cmp; // Declare loop variable 'k' and comparison variable 'cmp'.
    for ( k = 0 ; k < P ; k ++ )
    {
      // Determine the comparison value 'cmp'.
      // If 'k' is within the bounds of 'voteds', use an element from 'voteds'.
      // Otherwise, use an element from the original 'alist'.
      cmp = ( k < voteds . length )
              ? voteds [ voteds . length - k - 1 ]
              : alist [ alist . length - k - 1 ] ;

      if ( ai2 >= cmp ) // If 'ai2' (score of current problem) is greater than or equal to 'cmp',
      {
        max = ai ; // 'ai' can be a selected problem.
        break ; // Exit the 'P' loop.
      }
    }

    if ( max ) // If 'max' has been set (a suitable 'ai' found),
    {
      break ; // Exit the main outer loop.
    }
  }

  // After finding a suitable 'ai', adjust 'i' back to the first occurrence
  // of that score, if there were duplicates.
  for ( ; i > 0 ; i -- )
  {
    if ( alist [ i ] !== alist [ i - 1 ] ) // If the current score is different from the previous,
    {
      break ; // Stop decrementing 'i'.
    }
  }

  var answer = alist . length - i ; // Calculate the final answer.

  console . log ( answer ) ; // Output the result to console.
}

// Read input from standard input, process it, and call the Main function.
Main ( require ( "fs" )
         . readFileSync ( "/dev/stdin" , "utf8" ) // Read file content as UTF-8.
         . trim ( ) // Remove leading/trailing whitespace.
         . split ( "\n" ) ) ; // Split the input string by newlines into an array.