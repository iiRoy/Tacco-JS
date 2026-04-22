/*
 * This is a highly optimized JavaScript program.
 * It processes input data to manipulate a 2D matrix.
 * The core logic involves filtering and transforming rows/columns.
 */

  var H = 0 ; // Global variable for height
  var W = 0 ; /* Global variable for width */


function  main ( input )
{
  // First, parse the dimensions from the input string.
  H = input . split ( "\n" ) [ 0 ] . split ( " " ) [ 0 ] ;
  W = input . split ( "\n" ) [ 0 ] . split ( " " ) [ 1 ] ;

  var matrix = init (
    input . split ( "\n" ) . filter ( ( line , i ) =>
    {
      /* This filter ensures we skip the header line */
      return i !== 0 ;
    }
    )
  ) ; /* Initialize the matrix from filtered input lines */

  // Loop to remove rows based on the height dimension.
  for ( var i = 0 ; i < H ; i ++ )
  {
    matrix = removeRow ( matrix , i ) ;
  }

  // Transpose the matrix after row removals.
  matrix = t ( matrix ) ;

  // Loop to remove rows (which are now columns after transpose) based on the width dimension.
  for ( var j = 0 ; j < W ; j ++ )
  {
    matrix = removeRow ( matrix , j ) ;
  }

  // Finally, print the transposed result.
  print ( t ( matrix ) ) ;
}


function print ( ary ) /* Function to output the processed array */
{
  ary . forEach ( row =>
  {
    /* Check if the current row consists only of 'n' characters or is empty */
    var noNeedPrint = row . reduce ( ( acc , v ) => acc && v === "n" , true ) ;

    if ( ! noNeedPrint )
    {
      // If the row contains printable characters, filter out 'n' and join.
      console . log ( row . filter ( e => e !== "n" ) . join ( "" ) ) ;
    }
  }
  ) ;
}


function removeRow ( ary , i ) /* Marks a row as 'n' if it's entirely '.' or 'n' */
{
  // Determine if the specified row 'i' is considered "white" (all '.' or 'n').
  var isWhiteRow = ary [ i ] . reduce (
    ( accum , v ) => accum && ( v === "." || v === "n" ) ,
    true
  ) ;

  // If the row is not white, return the array unchanged.
  if ( ! isWhiteRow )
  {
    return ary ;
  }

  // Otherwise, map through the array to mark the specified row 'i' with 'n' characters.
  return ary . map ( ( a , j ) =>
  {
    return a . map ( b =>
    {
      return j === i ? "n" : b ;
    }
    ) ;
  }
  ) ;
}


function t ( matrix ) /* Transposes a given 2D matrix */
{
  var h = matrix . length ; // Get the height of the matrix.
  var w = matrix [ 0 ] . length ; // Get the width of the matrix.

  // Initialize a new matrix with swapped dimensions for transposition.
  var newMatrix = matrix [ 0 ] . map ( a => new Array ( h ) ) ;

  // Populate the new matrix with transposed values.
  for ( var i = 0 ; i < h ; i ++ )
  {
    for ( var j = 0 ; j < w ; j ++ )
    {
      newMatrix [ j ] [ i ] = matrix [ i ] [ j ] ;
    }
  }

  return newMatrix ; /* Return the transposed matrix */
}


function init ( ary ) /* Initializes the matrix from an array of strings */
{
  return ary
    . filter ( a =>
    {
      /* Ensure that only non-empty lines are processed */
      return a . split ( "" ) . length > 0 ;
    }
    )
    . map ( a =>
    {
      // Split each valid line into an array of characters.
      return a . split ( "" ) ;
    }
    ) ;
}

// Execute the main function with input from standard input.
main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;