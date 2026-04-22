/*
 *  This file contains the main logic for the problem.
 *  It uses strict mode to catch common coding errors.
 */
'use strict'
; // Enforce strict parsing and error handling

/**
 * The primary function that processes the input and computes the result.
 * @param {string} input - The raw input string from stdin.
 */
function Main(  input  )
{

  // Prepare the input string: trim whitespace and split into lines.
  input  =  input.trim().split(  /\n/  )
  ;

  // Extract N, the number of elements, from the first line of input.
  const N =  input.shift()  -  0
  ;

  // Calculate M, which is 2 raised to the power of N.
  const M  =  Math.pow(  2  ,  N  )
  ;

  // Define K, a large prime number for modulo operations.
  const K  =  Math.pow(  10  ,  9  )  +  7
  ;


  // Parse the remaining input lines into a 2D array of numbers.
  // Each line is split by whitespace, and each part is converted to a number.
  input  =  input.map(  str  =>  str.split(  /\s+/  ).map(  x  =>  x  -  0  )  )
  ;

  // Assign the parsed input to the 'Match' constant for clarity.
  const Match  =  input
  ;


  // Initialize a dynamic programming array 'dp'.
  // It's an array of N empty objects, which will store states for matching.
  const dp  =  new Array(  N  ).fill(  0  ).map(  (  x  ,  j  )  =>  new Object  )
  ;

  // Initialize the base case for dp:
  // dp[-1] represents the state before any men are considered.
  // {0:1} means there's 1 way to have an empty set of women matched (represented by 0).
  dp[  -1  ]  =  {  0  :  1  ,  }
  ;

  // Precompute powers of 2 for bitmask operations.
  // p[i] will be 2^i, used to represent the i-th woman in a bitmask.
  const p  =  new Array(  N  ).fill(  0  ).map(  (  x  ,  i  )  =>  (  1  <<  i  )  )
  ;


  /*
   *  The problem considers matching men from index N-1 down to 0,
   *  but the DP state is built up by considering men from 0 to N-1.
   *  dp[i][j] represents the number of ways to match men 0 through 'i'
   *  with a specific set of women represented by the bitmask 'j'.
   *  'j' indicates which women are already matched.
   */


  // Iterate through men, from -1 (base case) up to N-2.
  // 'i' represents the current man being considered for matching.
  for  (  let  i  =  -1  ;  i  <  N  -  1  ;  i++  )
  {

    // For each existing state in dp[i] (combinations of women matched up to man 'i').
    Object.keys(  dp[  i  ]  ).forEach(  function(  J  )
    {

      // Convert the key 'J' (which is a string) back to a number (bitmask).
      J  =  J  -  0
      ;

      // Apply modulo K to the current count to prevent overflow.
      dp[  i  ][  J  ]  %=  K
      ;

      // Iterate through all possible women (0 to N-1) to find a match for man (i+1).
      for  (  let  j  =  0  ;  j  <  N  ;  j++  )
      {

        // If woman 'j' is already matched in the current state 'J', skip her.
        if  (  (  J  &  p[  j  ]  )  >  0  )  continue
        ;

        // If man (i+1) cannot be matched with woman 'j' (Match[i+1][j] is 0), skip.
        if  (  Match[  i  +  1  ][  j  ]  ===  0  )  continue
        ;

        // If both conditions pass, man (i+1) can be matched with woman 'j'.
        // Update the next DP state: dp[i+1][J + p[j]].
        // J + p[j] creates a new bitmask where woman 'j' is now included.
        // Add the count from the current state dp[i][J] to the new state.
        // Use (||0) to handle cases where dp[i+1][...] might be undefined.
        dp[  i  +  1  ][  J  +  p[  j  ]  ]  =  (  dp[  i  +  1  ][  J  +  p[  j  ]  ]  ||  0  )  +  dp[  i  ][  J  ]
        ;

      } // End of inner loop for women

    }  )  ; // End of forEach for dp[i] states

  } // End of outer loop for men


  // After processing all men, the final answer is in dp[N-1][M-1].
  // M-1 represents a bitmask where all N women are matched (2^N - 1).
  // Use (||0) again for safety, and apply modulo K one last time.
  console.log(  (  dp[  N  -  1  ][  M  -  1  ]  ||  0  )  %  K  )
  ;

} // End of Main function


// Call the Main function with input read from standard input.
Main(  require(  'fs'  ).readFileSync(  '/dev/stdin'  ,  'utf8'  )  )
;