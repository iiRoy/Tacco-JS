/*
 * This JavaScript code represents a solution to a programming problem.
 * It processes input to generate a grid pattern based on given parameters.
 * This particular version is a Type I clone, meaning its functionality
 * and underlying structure are identical to the original.
 * Only whitespace and comments have been altered to demonstrate this.
 */

function Main ( input )
{
  // The input string is first split into an array of lines.
  input = input . split ( "\n" ) ;

  // Parse the first number from the first line of input.
  var A = parseInt ( input [ 0 ] . split ( " " ) [ 0 ] ) ;
  // Parse the second number from the first line of input.
  var B = parseInt ( input [ 0 ] . split ( " " ) [ 1 ] ) ;

  // Initialize a 2D array (grid) with 100 rows.
  grid = new Array ( 100 ) ;

  // Populate the grid based on a specific pattern.
  for ( i = 0 ; i < 100 ; i ++ )
  {
    if ( i < 50 )
    {
      // The first 50 rows are filled with '.' characters.
      tmp = new Array ( 100 ) . fill ( "." ) ;
    }
    else
    {
      // The remaining 50 rows are filled with '#' characters.
      tmp = new Array ( 100 ) . fill ( "#" ) ;
    }
    // Assign the temporary row to the grid.
    grid [ i ] = tmp ;
  }

  // Modify the grid based on the value of B.
  // This loop places '#' characters in the '.' half of the grid.
  for ( i = 0 ; i < B - 1 ; i ++ )
  {
    grid [ Math . round ( i / 100 ) * 2 ] [ ( i % 50 ) * 2 ] = "#" ;
  }

  // Modify the grid based on the value of A.
  // This loop places '.' characters in the '#' half of the grid.
  for ( i = 0 ; i < A - 1 ; i ++ )
  {
    grid [ 99 - Math . round ( i / 100 ) * 2 ] [ ( i % 50 ) * 2 ] = "." ;
  }

  // Prepare an array to hold the grid rows for final output.
  gridrow = new Array ( 101 ) ;
  // The first element of gridrow is a string indicating grid dimensions.
  gridrow [ 0 ] = "100 100" ;

  // Convert each grid row (array of characters) into a single string.
  for ( i = 0 ; i < 100 ; i ++ )
  {
    gridrow [ i + 1 ] = grid [ i ] . join ( "" ) ;
  }

  // Join all elements of gridrow with newline characters to form the final answer.
  var ans = gridrow . join ( "\n" ) ;


  // Output the generated answer to the console.
  console . log ( '%s' , ans ) ;
}


// This function is typically used for debugging purposes in a web browser environment.
// It retrieves input from an HTML element and passes it to the Main function.
function debug ( )
{
  var input = document . getElementById ( "input" ) . value ;
  Main ( input ) ;
}

// This is the main entry point for the script when executed in a Node.js-like environment.
// It reads the entire content of standard input, converts it to UTF-8, and passes it to Main.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;