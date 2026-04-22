/* This function serves as the main entry point for processing the provided input data.
   The 'input' parameter is expected to contain all necessary information as a single string. */
function Main ( input )
{
  // First, we'll split the entire input string into individual lines.
  // Each line will then be an element in the 'splitInput' array.
  var splitInput = input . split ( "\n" ) ;

  // The first element of the split input (which is the first line)
  // represents the total number of plates or items to process.
  var n = ( splitInput [ 0 ] ) ;

  /*
   * Next, we process the remaining lines of the input.
   * We slice the array from the second element (index 1) onwards.
   * Each of these lines represents a plate with two values (A and B).
   * We map each line to an array containing:
   *   [parsed_value_A, parsed_value_B, sum_of_A_and_B]
   */
  var plateArray = splitInput . slice ( 1 ) . map ( function ( e )
  {
    // For each line 'e', split it by space to get the two values.
    var splitab = e . split ( " " ) ;

    // Convert the string values to integers and calculate their sum.
    // This sum is crucial for the subsequent sorting step.
    return [ parseInt ( splitab [ 0 ] ) , parseInt ( splitab [ 1 ] ) , parseInt ( splitab [ 0 ] ) + parseInt ( splitab [ 1 ] ) ] ;
  } ) . sort ( function ( x , y )
  {
    // The sorting function compares plates based on their sum (the third element, index 2).
    // If x's sum is less than y's sum, x comes first.
    if ( x [ 2 ] < y [ 2 ] )
    {
      return -1 ;
    }
    // If x's sum is greater than y's sum, y comes first.
    if ( x [ 2 ] > y [ 2 ] )
    {
      return 1 ;
    }
    // If the sums are equal, their relative order does not matter for this primary sort.
    return 0 ;
  } ) ;


  // Initialize results for player A and player B.
  // These variables will accumulate the scores for each player.
  var aresult = 0 ;
  var bresult = 0 ;


  // Iterate through the sorted plate array.
  // The loop runs 'n' times, corresponding to the number of plates.
  for ( var i = 0 ; i < n ; i ++ )
  {
    // 'j' is used to find the end of a block of plates with the same sum.
    var j = 0 ;
    // 'j0' tracks the index within the current block that has the maximum value for the current player.
    var j0 = 0 ;

    // This while loop identifies a contiguous block of plates that have the same sum.
    // It also finds the plate within this block that offers the maximum value to the current player (A or B).
    while ( ( i + j < n ) && ( plateArray [ i + j ] [ 2 ] == plateArray [ i ] [ 2 ] ) )
    {
      // Determine which player is currently choosing (A if i%2 == 0, B if i%2 == 1).
      // Compare the current plate's value for that player with the maximum found so far in the block.
      if ( plateArray [ i + j ] [ i % 2 ] > plateArray [ i + j0 ] [ i % 2 ] )
      {
        j0 = j ; // Update j0 if a better plate is found for the current player.
      }
      j ++ ; // Move to the next plate in the current block.
    }

    // If j0 is not 0, it means a plate with a higher value for the current player was found later in the block.
    // We need to swap this plate with the current starting plate of the block (plateArray[i])
    // to ensure the current player gets their optimal choice from the equal-sum block.
    if ( j0 != 0 )
    {
      // Create a temporary copy of the current plate.
      var tmp = plateArray [ i ] . slice ( 0 ) ;
      // Replace the current plate with the optimal one from the block.
      plateArray [ i ] = plateArray [ i + j0 ] . slice ( 0 ) ;
      // Place the original current plate at the position of the optimal one.
      plateArray [ i + j0 ] = tmp ;
    }

    // Now, assign the plate to the appropriate player based on the turn.
    // Player A takes turns with even indices (0, 2, 4...).
    if ( i % 2 == 0 )
    {
      // Log the value taken by player A.
      console . log ( 'a take %d' , plateArray [ i ] [ i % 2 ] ) ;
      // Add the chosen plate's value (A's value) to A's total score.
      aresult += plateArray [ i ] [ i % 2 ] ;
    }
    // Player B takes turns with odd indices (1, 3, 5...).
    else
    {
      // Log the value taken by player B.
      console . log ( 'b take %d' , plateArray [ i ] [ i % 2 ] ) ;
      // Add the chosen plate's value (B's value) to B's total score.
      bresult += plateArray [ i ] [ i % 2 ] ;
    }
  }

  // Finally, output the difference between A's total score and B's total score.
  console . log ( '%d' , aresult - bresult ) ;
}
// This line of code is essential for the execution environment.
// It reads input from standard input and passes it to the Main function.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;