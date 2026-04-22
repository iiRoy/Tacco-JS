// This JavaScript module implements a solution to a classic mathematical puzzle
// involving two types of animals with different numbers of legs.
// The goal is to determine if a given total number of heads and total number of legs
// can be satisfied by a combination of these animals.

function solveAnimalPuzzle ( receivedInputLines )
{
  // The first step involves parsing the input data.
  // The problem expects a single line containing two space-separated integer values.
  // These values represent the total count of animal heads and the combined leg count.
  const [ totalHeads , totalLegs ] = receivedInputLines [ 0 ]
    . split ( " " )
    . map ( ( strValue ) => Number . parseInt ( strValue , 10 ) ) ;

  // We now iterate through all possible scenarios for the number of turtles.
  // A turtle has four legs. The loop variable `currentTurtles` will range
  // from zero up to the maximum possible number of heads (since each animal has one head).
  for ( let currentTurtles = 0 ; currentTurtles <= totalHeads ; currentTurtles ++ )
  {
    // For each assumed number of turtles, we calculate the remaining animals, which must be cranes.
    // Cranes have two legs.
    let remainingCranes = totalHeads - currentTurtles ;

    // Next, we check if the total number of legs for this specific combination
    // of turtles and cranes matches the target `totalLegs`.
    if ( ( currentTurtles * 4 ) + ( remainingCranes * 2 ) === totalLegs )
    {
      // If a combination that satisfies both head and leg counts is found,
      // we output "Yes" to indicate a solution exists and then terminate
      // the function immediately, as we only need to find one such combination.
      console . info ( "Yes" ) ;
      return ;
    }
  }

  // If the loop completes without finding any valid combination, it means
  // no solution exists for the given input parameters. In this case,
  // we output "No".
  console . info ( "No" ) ;
}


// This part of the code is responsible for invoking the main puzzle solver function.
// It reads input from the standard input stream, processes it, and passes it to the solver.
solveAnimalPuzzle (
  require ( 'node:fs' )
    . readFileSync (
      '/dev/stdin' ,
      {
        encoding : 'utf8'
      }
    )
    . trim ( )
    . split ( '\n' )
) ;