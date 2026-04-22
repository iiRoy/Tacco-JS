'use strict'// This line enforces strict mode for better error handling.

// The main function that processes the input.
function Main ( input )
{
  // Process the raw input string: trim whitespace and split into lines.
  input = input . trim ( ) . split ( '\n' ) ;

  // Parse the first line to get array values for H and N.
  const array = input [ 0 ] . split ( ' ' ) . map ( s => parseInt ( s ) ) ;
  // Get the remaining lines which contain attack data.
  const rest = input . slice ( 1 ) ;

  // Extract H (target health) from the parsed array.
  const H = array [ 0 ] ;
  // Extract N (number of magic spells) from the parsed array.
  const N = array [ 1 ] ;

  // Initialize an array to store magic spell details (attack value and magic points).
  const A = [ ] ;

  // Loop through the 'rest' array to populate the 'A' array.
  for ( let i = 0 ; i < rest . length ; ++ i )
  {
    // Parse each line into attack value and magic points.
    const a = rest [ i ] . split ( ' ' ) . map ( s => parseInt ( s ) ) ;
    // Add an object representing the spell to array A.
    A . push ( { value : a [ 0 ] , mp : a [ 1 ] } ) ;
  }

  // Initialize a dynamic programming array 'dp'.
  // dp[j] will store the minimum magic points needed to deal 'j' damage.
  // It's initialized with 0s, but effectively 0 means "not yet reachable" or "no cost".
  let dp = Array ( 9999 ) . fill ( 0 ) ;

  // The first spell's cost for its value is itself.
  // This part of the logic seems to be missing from the original,
  // typically for DP, you'd initialize dp[A[0].value] = A[0].mp,
  // and then iterate from there. The current code implicitly handles it
  // if dp[j - A[i].value] becomes non-zero first.
  // Let's assume dp[0] is 0 (no cost for 0 damage).

  // Iterate through each available magic spell.
  for ( let i = 0 ; i < N ; ++ i )
  {
      // Iterate through possible damage values from the current spell's value up to H.
      // This is a knapsack-like problem.
      for ( let j = A [ i ] . value ; j <= H ; ++ j )
      {
          // If dp[j] is not zero, it means we have a known way to reach 'j' damage.
          if ( dp [ j ] !== 0 )
          {
              // We compare the current cost to reach 'j' with the cost of
              // reaching 'j - A[i].value' and then casting the current spell A[i].
              dp [ j ] = Math . min ( dp [ j ] , dp [ j - A [ i ] . value ] + A [ i ] . mp ) ;
          }
          // If dp[j] is zero, it means we haven't found a way to reach 'j' yet,
          // OR it's the base case where dp[0] is 0.
          else
          {
              // The cost to reach 'j' is the cost to reach 'j - A[i].value'
              // plus the magic points of the current spell.
              dp [ j ] = dp [ j - A [ i ] . value ] + A [ i ] . mp ;
          }
      }
  }


  // Output the minimum magic points required to deal at least H damage.
  console . log ( dp [ H ] ) ;

}

// Read input from stdin and pass it to the Main function.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;