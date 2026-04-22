'use strict'
// This is the main program function
function Main(  input  )
{

  // Pre-process the input string
  input    =    input
                     .trim()
                     .split('\n');

  // Parse the first line of input
  const a  =  input[0]
                     .split(' ')
                     .map(  s  =>  parseInt(s)  )
  ;


  // Extract N and K from the parsed array 'a'
  const N  =  a[0]
  ;
  const K  =  a[1]
  ;

  // Parse the second line of input for scores
  const rest  =  input[1]
                       .split(' ')
                       .map(  s  =>  parseInt(s)  )
  ;

  // Assign scores to R, S, P variables
  const R  =  rest[0]
  ;
  const S  =  rest[1]
  ;
  const P  =  rest[2]
  ;

  // Get the game sequence from the third line
  const T  =  input[2]
  ;


  // Initialize an array to store dynamic programming results (scores)
  var dp  =  []
  ;


  // Loop through the game sequence
  for (  var i  =  0;  i  <  N;  ++i  )
  {
    // Determine the opponent's move at the current turn
    let ans  =  T[i]
    ;

    // Check if a K-turn previous move would block the current move
    // If the K-previous move is the same as the current move AND
    // a score was recorded for that K-previous move (meaning it wasn't skipped)
    if  (  i  >=  K  &&  T[i  -  K]  ===  ans  &&  dp[i  -  K]  >  0  )
    {
      // If a win would be blocked, record a score of 0 for this turn
      dp.push(0)
      ;

      // Skip to the next iteration, as no points are gained
      continue
      ;
    }


    // If the opponent plays 'r' (rock), we play 'p' (paper) to win
    if  (  ans  ===  'r'  )
    {
      dp.push(P)
      ;
    }

    // If the opponent plays 's' (scissors), we play 'r' (rock) to win
    if  (  ans  ===  's'  )
    {
      dp.push(R)
      ;
    }

    // If the opponent plays 'p' (paper), we play 's' (scissors) to win
    if  (  ans  ===  'p'  )
    {
      dp.push(S)
      ;
    }
  }

  // Calculate the total score by summing all elements in the dp array
  console.log(  dp.reduce(  (p,  c)  =>  p  +  c  )  )
  ;
}

// Read input from stdin and pass it to the Main function
Main(  require("fs").readFileSync("/dev/stdin",  "utf8")  )
;