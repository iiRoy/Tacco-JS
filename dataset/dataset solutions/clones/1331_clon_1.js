/*
 * This is a Type I clone of a JavaScript program.
 * It demonstrates processing input for a simple scoring system.
 * The original logic and identifiers are preserved precisely.
 */
( function( input )
{

  // Declare an array 'a' by splitting the incoming 'input' string at each newline character.
  var a = input . split ( '\n' ) ;

  /*
   * The variable 'n' is initialized here.
   * It takes the first element from array 'a' (which is removed from 'a' by 'shift()')
   * and converts it into a numerical type.
   * This variable 'n' is declared but not subsequently used in the provided code snippet.
   */
  var n = Number ( a . shift ( ) ) ;


  // Initialize a counter 'i' for the loop.
  var i = 0 ;

  // Initialize scores for two entities, 't' (team A) and 'h' (team B), to zero.
  var t = h = 0 ;

  // Begin a 'while' loop that iterates exactly three times.
  // The 'i++' increments 'i' after its value is used in the comparison.
  while ( i ++ < 3 )
  {
    // Inside the loop:
    // 1. Remove the next element from array 'a' using 'shift()'.
    // 2. Split that element (a string) by space characters.
    // 3. Store the resulting array of strings in variable 'l'.
    var l = a . shift ( ) . split ( ' ' ) ;

    // Extract the first element of 'l' (team A's score for the round) into 'tc'.
    var tc = l [ 0 ] ;

    // Extract the second element of 'l' (team B's score for the round) into 'hc'.
    var hc = l [ 1 ] ;

    // Conditional logic to determine points awarded for the current round.
    if ( tc > hc )
    {
      // If team A's score ('tc') is greater than team B's score ('hc'),
      // add 3 points to team A's total score 't'.
      t += 3 ;
    }
    else if ( tc < hc )
    {
      // Else if team A's score ('tc') is less than team B's score ('hc'),
      // add 3 points to team B's total score 'h'.
      h += 3 ;
    }
    else
    {
      // Otherwise (if 'tc' is equal to 'hc', indicating a tie),
      // add 1 point to both team A's total 't' and team B's total 'h'.
      t ++ ; h ++ ;
    }
  } // End of the 'while' loop.


  // After the loop completes, print the final scores.
  // The output format is two space-separated numbers: team A's score then team B's score.
  console . log ( '%s %s' , t , h ) ;

} ) ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ; // This immediately invoked function expression (IIFE)
                                                                    // takes the content of '/dev/stdin' as its 'input'.