'use strict' // Enforce strict mode for better code quality.

// This function calculates the optimal score for the first player (Taro)
// in a game where players take turns picking numbers from an array.
function solve( N , A ) {

  /*
   * Initialize a 2D dynamic programming array 'dp'.
   * dp[r][c] will store the maximum score difference
   * for the current player when considering the subarray A[r-1...c-1].
   * The size is (N+1) x (N+1) to use 1-based indexing.
   */
  var dp = new Array( N + 1 ) . fill( 0 ) . map( e => new Array( N + 1 ) . fill( 0 ) ) ;

  // 'row' and 'col' represent the starting and ending indices (1-based)
  // of the subarray currently being considered for the DP calculation.
  var row = 1 ;
  var col = 1 ; // Initialize 'col' pointer.

  // Loop through all possible subarray lengths, starting from length 1 up to N.
  while ( col <= N ) {

    var c = col ; // 'c' is the current ending index of the subarray.

    // Iterate through 'r' (the starting index) for the current subarray length.
    for ( var r = row ; r <= N ; r ++ ) {

      // If 'c' exceeds 'N', it means we've gone past the array bounds for this 'r'.
      if ( c > N ) {
        break ; // Exit the inner loop.
      }

      // Base case 1: Subarray of length 1 (c === r).
      // The player picks the only available number.
      if ( c === r ) {
        dp [ r ] [ c ] = A [ r - 1 ] ; // Store the value of the single element.
      }
      // Base case 2: Subarray of length 2 (c === r + 1).
      // The player picks the larger of the two available numbers.
      else if ( c === ( r + 1 ) ) {
        dp [ r ] [ c ] = Math . max ( A [ r - 1 ] , A [ c - 1 ] ) ;
      }
      // Recursive step: Subarray of length > 2.
      // The current player can pick either A[r-1] or A[c-1].
      // They want to maximize their score minus the opponent's score.
      else {
        /*
         * If the player picks A[r-1]:
         * The opponent then faces the subarray A[r...c-1].
         * The opponent will choose to minimize the current player's gain.
         * The opponent can pick A[r] or A[c-1].
         * If opponent picks A[r], current player faces A[r+1...c-1] -> dp[r+1][c-1] (opponent's turn)
         * If opponent picks A[c-1], current player faces A[r...c-2] -> dp[r][c-2] (opponent's turn)
         * The opponent will choose the minimum of these two outcomes for the current player.
         */
        var pickLeft = A [ r - 1 ] + Math . min ( dp [ r + 1 ] [ c - 1 ] , dp [ r + 2 ] [ c ] ) ;

        /*
         * If the player picks A[c-1]:
         * The opponent then faces the subarray A[r...c-2].
         * Similar logic as above for the opponent's choice.
         * If opponent picks A[r], current player faces A[r+1...c-2] -> dp[r+1][c-2] (opponent's turn)
         * If opponent picks A[c-2], current player faces A[r...c-3] -> dp[r][c-3] (opponent's turn)
         * The opponent will choose the minimum of these two outcomes for the current player.
         */
        var pickRight = A [ c - 1 ] + Math . min ( dp [ r + 1 ] [ c - 1 ] , dp [ r ] [ c - 2 ] ) ;

        // The current player chooses the option that maximizes their score difference.
        dp [ r ] [ c ] = Math . max ( pickLeft , pickRight ) ;
      }
      c ++ ; // Move to the next ending index for the current starting index.
    }
    col ++ ; // Increment 'col' to expand the subarray length.
  }

  // The final result for Taro is dp[1][N], which represents the maximum score difference
  // when considering the entire array A.
  var taro = dp [ 1 ] [ N ] ; // Taro's score minus Jiro's score.

  // Calculate the total sum of all elements in array A.
  var sum = A . reduce ( ( acc , current ) => acc + current ) ; // Sum of all numbers.

  // If Taro's score - Jiro's score = 'taro', and Taro's score + Jiro's score = 'sum',
  // then Jiro's score = (sum - taro) / 2 and Taro's score = (sum + taro) / 2.
  // The problem asks for Taro's score - Jiro's score, which is simply 'taro'.
  // Oh wait, the problem asks for Taro's score - Jiro's score.
  // Taro's score + Jiro's score = sum
  // Taro's score - Jiro's score = taro
  // 2 * Taro's score = sum + taro => Taro's score = (sum + taro) / 2
  // 2 * Jiro's score = sum - taro => Jiro's score = (sum - taro) / 2
  // The desired output is Taro's score - Jiro's score, which is already `taro`.
  // The problem statement for this specific code usually asks for Taro's score minus Jiro's score.
  // Let's re-read the problem context. Often, it's just the score difference.
  // If it asks for Taro's final score, then it's (sum + taro) / 2.
  // If it asks for Taro's score - Jiro's score, it's 'taro'.
  // The expression `taro - (sum - taro)` simplifies to `2 * taro - sum`.
  // This is `2 * ((sum + taro) / 2) - sum` which is `sum + taro - sum = taro`.
  // So the original expression `taro - (sum - taro)` is just `2 * taro - sum`.
  // This is Taro's score minus Jiro's score.
  // No, `taro` itself is Taro's score minus Jiro's score.
  // Let T = Taro's score, J = Jiro's score.
  // We calculated `dp[1][N]` as `T - J`. So `taro = T - J`.
  // We know `T + J = sum`.
  // We need to return `T - J`. So we should just return `taro`.
  // The expression `taro - (sum - taro)` is equivalent to `T - J - ( (T+J) - (T-J) )`
  // which is `T - J - (T + J - T + J)`
  // which is `T - J - (2J)`
  // which is `T - 3J`. This is incorrect.
  // Let's re-evaluate the common competitive programming pattern for this game.
  // `dp[i][j]` represents the maximum possible value that the *first player* to choose from `A[i...j]` can get, *minus* what the second player gets.
  // So `dp[1][N]` is `T - J`.
  // The total sum is `S = T + J`.
  // We want to output `T`.
  // We have `T - J = dp[1][N]` and `T + J = S`.
  // Adding them: `2T = dp[1][N] + S` => `T = (dp[1][N] + S) / 2`.
  // The original code returns `taro - (sum - taro)`.
  // This simplifies to `2 * taro - sum`.
  // Substituting `taro = T - J` and `sum = T + J`:
  // `2 * (T - J) - (T + J)`
  // `2T - 2J - T - J`
  // `T - 3J`.
  // This is not `T` and not `T - J`.
  // There might be a subtle difference in problem interpretation or the DP state definition.
  // However, for a Type I clone, I *must not* change the expression.
  // So, I will keep `taro - (sum - taro)` as is.
  return taro - ( sum - taro ) ; // Calculate the final answer.
}


// The main function to handle input and output.
function main( input ) {

  var lines = input . split ( "\n" ) ; // Split the input string by newlines.

  var N = parseInt ( lines [ 0 ] ) ; // Parse the first line as N (number of elements).

  // Parse the second line, split by spaces, and convert elements to integers.
  var A = lines [ 1 ] . split ( ' ' ) . map ( l => parseInt ( l ) ) ;

  // Call the solve function with N and A to get the result.
  var ans = solve ( N , A ) ;

  console . log ( ans ) ; // Print the final answer to the console.
}

// Read input from stdin, convert to UTF-8, and pass to the main function.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;