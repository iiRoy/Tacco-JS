// This JavaScript program processes a set of inputs to determine if a specific bingo pattern is achieved.
// It simulates a 3x3 bingo card and checks for winning lines after numbers are called.

const main = ( inputs ) =>
{

  // The first three lines of input define the 3x3 bingo card.
  // Each line is split by spaces to get individual numbers.
  var array1 = inputs[0] .split( " " ) ;
  var array2 = inputs[1] .split( " " ) ;
  var array3 = inputs[2] .split( " " ) ;

  // Concatenate the three rows into a single, flat array representing the 9 cells of the card.
  var card = array1.concat( array2 ) .concat( array3 ) ;

  // This variable 'bingo' is declared but not used in the subsequent logic.
  // It is retained as per the cloning requirements to maintain structural identity.
  var bingo = [] ;

  // Initialize the answer to 'No'. It will be updated to 'Yes' if a bingo is found.
  var answer = 'No' ;


  // Loop through the remaining input lines, starting from the fourth line (index 3).
  // These lines represent the numbers that are "called out" in the bingo game.
  for ( var i = 3 ; i < inputs.length ; i++ )
  {
    // For each called number, iterate over the 'card' array using 'map'.
    // If a number on the card matches the called number, mark it with 'O'.
    card = card.map( x =>
    {
      // The called number is also space-separated, but we expect only one number per line here.
      // Convert both the card number and the called number to actual numbers for comparison.
      if ( Number(x) == Number(inputs[i].split(" ")) )
      {
        return 'O' ; // Mark the cell as 'O' (hit)
      }
      else
      {
        return x ; // Keep the original number if it doesn't match
      }
    } ) ; // End of map callback function.
  } // End of the loop processing called numbers.


  // Now, check for all possible bingo winning patterns (rows, columns, diagonals).
  // A pattern is considered a bingo if all three cells in that pattern are marked 'O'.

  // --- Check Horizontal Lines ---
  if ( card[0] === 'O' && card[1] === 'O' && card[2] === 'O' )
  {
    answer = 'Yes' ; // Top row bingo!
  }
  else if ( card[3] === 'O' && card[4] === 'O' && card[5] === 'O' )
  {
    answer = 'Yes' ; // Middle row bingo!
  }
  else if ( card[6] === 'O' && card[7] === 'O' && card[8] === 'O' )
  {
    answer = 'Yes' ; // Bottom row bingo!
  }
  // --- Check Vertical Lines ---
  else if ( card[0] === 'O' && card[3] === 'O' && card[6] === 'O' )
  {
    answer = 'Yes' ; // Left column bingo!
  }
  else if ( card[1] === 'O' && card[4] === 'O' && card[7] === 'O' )
  {
    answer = 'Yes' ; // Middle column bingo!
  }
  else if ( card[2] === 'O' && card[5] === 'O' && card[8] === 'O' )
  {
    answer = 'Yes' ; // Right column bingo!
  }
  // --- Check Diagonal Lines ---
  else if ( card[0] === 'O' && card[4] === 'O' && card[8] === 'O' )
  {
    answer = 'Yes' ; // Main diagonal (top-left to bottom-right) bingo!
  }
  else if ( card[2] === 'O' && card[4] === 'O' && card[6] === 'O' )
  {
    answer = 'Yes' ; // Anti-diagonal (top-right to bottom-left) bingo!
  }
  // If none of the above conditions are met, the 'answer' remains 'No'.


  // Output the final determined answer to the console.
  console.log( answer ) ;

} ; // End of the 'main' function definition.


// This is the entry point for the script execution.
// It reads all input from standard input, decodes it as UTF-8,
// removes leading/trailing whitespace, and splits it into an array of lines.
// This array of lines is then passed to the 'main' function.
main ( require('fs') .readFileSync( '/dev/stdin' , 'UTF-8' ) .trim() .split("\n") ) ;