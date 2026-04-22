/*
 * This is a Type I clone of the original JavaScript code.
 * All identifiers, operators, and expressions remain identical.
 * Only whitespace (spaces, tabs, newlines) and comments have been altered
 * to make the code visually distinct from the original.
 */

'use strict'

// Define the main dynamic programming solver function.
function   solve ( N , P ) {

  // Initialize a 2D array (dp table) of size (N+1)x(N+1) with zeros.
  // This table will store probabilities for our DP approach.
  var   dp   =   new   Array ( N + 1 ) . fill ( 0 ) . map ( e   =>   new   Array ( N + 1 ) . fill ( 0 ) )

  // Iterate through the rows of the DP table.
  for   ( var   i   =   0 ;   i   <   dp . length ;   i ++ ) {

    // Iterate through the columns of the DP table.
    for   ( var   j   =   0 ;   j   <   dp [ i ] . length ;   j ++ ) {

      // Base case: If both i and j are 0, set dp[0][0] to 1.
      // This typically represents the starting state with 0 items and 0 successes.
      if   ( i   ===   0   &&   j   ===   0 )   {
        dp [ i ] [ j ]   =   1
        continue   // Move to the next iteration.
      }

      // If the number of successes (j) exceeds the number of items considered (i),
      // this state is impossible, so the probability is 0.
      if   ( j   >   i )   {
        dp [ i ] [ j ]   =   0
      }
      // If the number of successes (j) is equal to the number of items considered (i),
      // it means all 'i' items were successful.
      // The probability is the probability of the (i-1)th item being successful
      // multiplied by the probability of (i-1) items having (j-1) successes.
      else   if   ( j   ===   i )   {
        dp [ i ] [ j ]   =   P [ i - 1 ]   *   dp [ i - 1 ] [ j - 1 ]
      }
      // If the number of successes (j) is less than the number of items considered (i),
      // we consider two cases for the current item (i-1).
      else   if   ( j   <   i )   {

        // Sub-case: If j is 0, it means no successes up to item i.
        // This probability depends on the (i-1)th item being a failure
        // and (i-1) items having 0 successes.
        if   ( j   ===   0 )   {
          dp [ i ] [ j ]   =   ( 1 - P [ i - 1 ] )   *   dp [ i - 1 ] [ j ]
        }
        // General case for j < i and j > 0.
        // The probability is the sum of two scenarios:
        // 1. The (i-1)th item was successful AND there were (j-1) successes among (i-1) items.
        // 2. The (i-1)th item was a failure AND there were (j) successes among (i-1) items.
        else   {
          dp [ i ] [ j ]   =   P [ i - 1 ]   *   dp [ i - 1 ] [ j - 1 ]   +   ( 1 - P [ i - 1 ] )   *   dp [ i - 1 ] [ j ]
        }
      }
    }
  }

  // Calculate the starting index for summing up results.
  // This typically corresponds to N/2 + 1 successes.
  var   startIndex   =   parseInt ( N / 2 )   +   1

  // Initialize the result accumulator.
  var   res   =   0

  // Sum probabilities from startIndex up to N for the Nth row (all items considered).
  for   ( var   i   =   startIndex ;   i   <   dp [ N ] . length ;   i ++ )   {
    res   +=   dp [ N ] [ i ]
  }

  // Return the final calculated probability.
  return   res
}


// --- Main function to handle input and output ---

function   main ( input ) {

  // Split the input string into an array of lines.
  var   lines   =   input . split ( "\n" )

  // Parse the first line as an integer N.
  var   N   =   parseInt ( lines [ 0 ] )

  // Parse the second line, splitting by space and mapping to floats for probabilities P.
  var   P   =   lines [ 1 ] . split ( ' ' ) . map ( l   =>   parseFloat ( l ) )

  // Call the solver function with N and P.
  var   ans   =   solve ( N , P )

  // Print the calculated answer to the console.
  console . log ( ans )
}

// Read input from stdin and pass it to the main function.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' ) ) ;

// End of JavaScript code.