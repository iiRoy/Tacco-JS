/*
 * This is the main entry point function for the program.
 * It processes the input to calculate a final value based on a series of operations.
 * The 'input' parameter is expected to be a string containing multiple lines.
 */
function Main( input )
{
  // Initialize an array to hold the state.
  var ary = [];

  // Determine the initial length of the 'ary' array based on the first line of input.
  // The first number on the first line specifies the array length.
  var aryLen = input . split ( "\n" ) [ 0 ] . split ( " " ) [ 0 ] ;

  // Populate the 'ary' with initial values (all 1s).
  for ( var i = 0 ; i < aryLen ; i ++ ) {
  	ary . push ( 1 ) ; // Add a '1' to the array for each position.
  }

  // Extract the second line of input, which represents a string 'str'.
  var str = input . split ( "\n" ) [ 1 ] ;

  /*
   * This loop processes subsequent lines of input, each representing a "jumon" (spell/command).
   * It iterates from the third line (index 2) to the end of the input.
   */
  for ( var i = 2 ; i < input . split ( "\n" ) . length ; i ++ )
  {
  	var jumon = input . split ( "\n" ) [ i ] ; // Get the current "jumon" command.

    // Initialize a new array for the next state, filled with zeros.
    var newAry = [ ] ;
    for ( var j = 0 ; j < aryLen ; j ++ )
    {
        newAry . push ( 0 ) ; // Fill newAry with zeros.
    }

    // Check the third character of the "jumon" to determine the operation type.
    if ( jumon [ 2 ] == "L" ) // If the operation is 'L' (Left shift/move)
    {
      // Iterate through the 'str' string and apply the 'L' operation.
      for ( var j = 0 ; j < str . length ; j ++ )
      {
        // Condition to check if a move is allowed or if the character matches.
        if ( j != 0 || str [ j ] != jumon [ 0 ] )
        {
            // If condition met, update newAry based on a leftward movement
            // or by keeping the current position if characters don't match.
            newAry [ str [ j ] == jumon [ 0 ] ? j - 1 : j ] += ary [ j ] ;
        }
      }
    }
    else // If the operation is not 'L', it's implicitly 'R' (Right shift/move)
    {
      // Iterate through the 'str' string and apply the 'R' operation.
      for ( var j = 0 ; j < str . length ; j ++ )
      {
        // Condition to check if a move is allowed or if the character matches.
        if ( j != aryLen - 1 || str [ j ] != jumon [ 0 ] )
        {
            // If condition met, update newAry based on a rightward movement
            // or by keeping the current position if characters don't match.
            newAry [ str [ j ] == jumon [ 0 ] ? j + 1 : j ] += ary [ j ] ;
        }
      }
    }

    // Update the main 'ary' with the newly calculated 'newAry' for the next iteration.
    ary = newAry . concat ( ) ;
  }

  // Calculate the total sum of elements in the final 'ary'.
  var golems = 0 ;
  for ( var i of ary )
  {
      golems += i ; // Summing up all elements.
  }

  // Output the final calculated sum.
  console . log ( golems ) ;
}

// Call the Main function with input read from standard input.
// This reads the entire file content as a UTF-8 string.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;