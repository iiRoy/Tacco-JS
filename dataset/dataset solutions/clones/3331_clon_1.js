/* This file contains a solution for a dynamic programming problem.
 * It calculates the winner of a game based on certain rules.
 * The Main function processes input and determines the game outcome.
 * The debug function is included for local testing purposes.
 */

function   Main ( input )
{
  // Process the raw input string by splitting it into lines
  input = input . split ( "\n" ) ;

  // Parse N and K from the first line of input.
  // N is the number of available moves, K is the target state.
  var N = parseInt ( input [ 0 ] . split ( " " ) [ 0 ] ) ;
  var K = parseInt ( input [ 0 ] . split ( " " ) [ 1 ] ) ;

  // Parse the array 'a' from the second line.
  // 'a' contains the possible move sizes.
  var a = input [ 1 ] . split ( " " ) . map ( i => parseInt ( i ) ) ;

  // Initialize the dynamic programming array 'dp'.
  // dp[i] will store the winner for state 'i'.
  var dp = new Array ( K + 1 ) . fill ( 0 ) ;

  // Base cases for the DP: states where the second player wins.
  // Any state 'i' less than the smallest move 'a[0]' means no moves can be made,
  // so the player whose turn it is (first player) loses, meaning the second player wins.
  for ( var i = 0 ; i < a [ 0 ] ; i ++ ) {
    dp [ i ] = "Second" ;
  }

  /*
   * Iterate through possible game states from a[0] up to K.
   * For each state 'i', determine if the first player can win.
   */
  for ( var i = a [ 0 ] ; i < K + 1 ; i ++ )
  {
    // Initialize a flag to indicate if the first player can make a winning move from state 'i'.
    var flag = 0 ;

    // Check all possible moves from the current state 'i'.
    // A move 'a[j]' means transitioning from state 'i' to 'i - a[j]'.
    for ( var j = 0 ; j < N ; j ++ )
    {
      // If a move leads to a state where the second player wins (i.e., the opponent loses from that state),
      // then the current state 'i' is a winning state for the first player.
      if ( dp [ i - a [ j ] ] == "Second" )
      {
        flag = 1 ; // Set flag to indicate a winning move has been found
        break ;    // No need to check further moves for this state 'i', as a winning path is found
      }
    }

    // Assign the winner for the current state 'i' based on the flag.
    if ( flag == 1 )
    {
      dp [ i ] = "First" ; // If a winning move was found, the first player wins from state 'i'.
    }
    else
    {
      dp [ i ] = "Second" ; // If no winning move was found, the first player loses, meaning the second player wins from state 'i'.
    }
  }

  // The final answer is the result for the target state K.
  ans = dp [ K ] ;


  // Output the result to the console in a formatted string.
  console . log ( '%s' , ans ) ;

  // Return the computed answer.
  return ans ;
}


// This function is purely for local debugging purposes.
// It simulates button clicks for testing different inputs against expected outputs.
function debug ( n )
{
  var input = document . getElementById ( "input" + n ) . value ;
  var ans = Main ( input ) ;
  var result = "WA" ; // Assume Wrong Answer initially

  // Compare the computed answer with the expected output.
  if ( ans == document . getElementById ( "output" + n ) . value . split ( "\n" ) [ 0 ] )
  {
    result = "AC" ; // If they match, it's Accepted
  }
  // Display the result (AC/WA) on the webpage.
  document . getElementById ( "result" + n ) . innerHTML = result ;
}

// Main execution block: Reads input from standard input and calls the Main function.
// This is typically used in competitive programming environments.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;