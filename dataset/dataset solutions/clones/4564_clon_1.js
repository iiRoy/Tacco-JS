/*
 * This is a Type I clone of a JavaScript program.
 * It processes input to print a framed grid.
 */

function Main( input )
{
  // Split the input string by newlines into an array of lines.
  input = input . split ( '\n' ) ;

  // The first line contains H and W, separated by a space.
  var input2 = input [ 0 ] . split ( ' ' ) ;


  // Parse H (height) and W (width) from the first line.
  var h = Number ( input2 [ 0 ] ) ;
  var w = Number ( input2 [ 1 ] ) ;

  // Initialize a string to hold the top/bottom border.
  var igeta = '' ;

  // Loop to construct the top/bottom border.
  // It needs to be W + 2 characters long (W for content, +2 for '#' borders).
  for ( i = 0 ; i < w + 2 ; i ++ )
  {
    igeta += '#' ; // Append a hash character
  }

  // Print the top border.
  console . log ( igeta ) ;


  // Loop through the input lines representing the grid content.
  // Start from index 1 because index 0 contained H and W.
  // Go up to H lines.
  for ( i = 1 ; i < h + 1 ; i ++ )
  {
    // Print each line, framed by '#' characters.
    console . log ( '#' + input [ i ] + '#' ) ;
  }

  // Print the bottom border, which is the same as the top.
  console . log ( igeta ) ;

} // End of Main function definition.


// This line reads input from standard input and passes it to the Main function.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;