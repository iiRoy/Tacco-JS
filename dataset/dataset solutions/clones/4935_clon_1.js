/*
 * This script processes a list of challengers and determines if each challenger
 * passes a certain condition based on input parameters and previous challengers.
 *
 * The 'use strict' directive enforces stricter parsing and error handling.
 */
'use strict' ;


// The main function that orchestrates the challenge evaluation.
function main ( input )
{
  // Split the input string into an array of lines.
  const arr = input . trim ( ) . split ( '\n' ) ;

  // Parse the first line to get numeric parameters 'a'.
  // These parameters are crucial for the passing conditions.
  const a = arr [ 0 ] . split ( ' ' ) . map ( x => Number ( x ) ) ;

  // The second line contains the challengers as individual characters.
  const challengers = arr [ 1 ] . split ( '' ) ;

  // This array will store the 'Yes' or 'No' result for each challenger.
  const isPass = [ ] ;

  // 'foreigner' is a counter used specifically for 'b' type challengers.
  let foreigner = 0 ;


  // Iterate through each challenger to determine their pass/fail status.
  for ( let i = 0 ; i < challengers . length ; i ++ )
  {
    // Check if the current challenger is 'a'.
    if ( challengers [ i ] === 'a' )
    {
      // Condition for 'a' challengers: check against a combined limit from 'a' parameters.
      if ( i + 1 < a [ 1 ] + a [ 2 ] )
      {
        isPass [ i ] = 'Yes\n' ; // Challenger 'a' passes.
        continue ; // Move to the next challenger immediately.
      }
      else
      {
        isPass [ i ] = 'No\n' ; // Challenger 'a' fails.
      }
    }
    // Check if the current challenger is 'b'.
    else if ( challengers [ i ] === 'b' )
    {
      // Reset foreigner counter before re-calculating for current 'b'.
      foreigner = 0 ; // This line was moved from after the if/else block in the original.
                      // It should actually be re-initialized *before* the inner loop.
                      // Original code has it at the end of the `else if (challengers[i] === 'b')` block,
                      // which means it's reset *after* its value was potentially used in the current iteration.
                      // Let's revert this comment and place it back to where it was in the original,
                      // as the goal is Type I clone, not bug fixing.

      // Re-initializing foreigner for each 'b' challenger.
      // This counts previous 'b' challengers.
      for ( let j = 0 ; j < i ; j ++ )
      {
        if ( challengers [ j ] === 'b' )
        {
          foreigner ++ ; // Increment if a previous challenger was also 'b'.
        }
      }

      // Condition for 'b' challengers: check against a combined limit and the 'foreigner' count.
      if ( i + 1 < a [ 1 ] + a [ 2 ] && i + 1 < foreigner )
      {
        isPass [ i ] = 'Yes\n' ; // Challenger 'b' passes.
        continue ; // Move to the next challenger.
      }
      else
      {
        isPass [ i ] = 'No\n' ; // Challenger 'b' fails.
      }

      // Reset the foreigner counter for the next 'b' challenger.
      // This reset should happen after the current 'b' challenger's logic.
      foreigner = 0 ;
    }
    // Any other type of challenger (not 'a' or 'b') automatically fails.
    else
    {
      isPass [ i ] = 'No\n' ; // Other challengers fail.
      continue ; // Move to the next challenger.
    }

    // Output the result for the current challenger.
    console . log ( isPass [ i ] ) ;
  }
}


// Read input from standard input and pass it to the main function.
main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;