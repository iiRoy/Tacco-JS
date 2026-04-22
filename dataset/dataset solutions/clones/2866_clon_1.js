/*
 This is a Type I code clone.
 The original code's functionality is preserved entirely.
 Only whitespace and comments have been altered significantly.
 */
function Main ( input )
{
  // First, process the input string.
  // It's expected to be a multi-line string.
  input = input . split ( "\n" ) ;


  /*
   Parse the dimensions H (height) and W (width)
   from the first line of the input.
   The first line is expected to contain "H W".
   */
  var H = parseInt ( input [ 0 ] . split ( " " ) [ 0 ] ) ;
  var W = parseInt ( input [ 0 ] . split ( " " ) [ 1 ] ) ;

  // Remove the first line as it's already processed.
  input . shift ( ) ;


  /*
   Convert the remaining input lines into a 2D array of characters.
   Each line becomes an array of characters.
   */
  var S = input . map ( i => i . split ( "" ) ) ;

  // Ensure 'S' only contains 'H' rows, trimming any excess.
  S . splice ( H , S . length - H ) ;


  // Initialize two 2D arrays, dp1 and dp2, for dynamic programming.
  // These will store lengths of continuous '.' segments.
  var dp1 = new Array ( H ) ;
  var dp2 = new Array ( H ) ;

  // Populate dp1 and dp2 with initial values (all 1s).
  // Each element will be an array of W elements, initialized to 1.
  for ( var i = 0 ; i < H ; i ++ )
  {
    var tmp1 = new Array ( W ) . fill ( 1 ) ; // Temporary array for dp1 row
    var tmp2 = new Array ( W ) . fill ( 1 ) ; // Temporary array for dp2 row

    dp1 [ i ] = tmp1 ;
    dp2 [ i ] = tmp2 ;
  }


  /*
   First DP pass: Calculate horizontal continuous '.' segments from left to right.
   dp1[i][j] will store the length of the continuous '.' segment ending at (i, j),
   looking left.
   If S[i][j] is '#', the segment breaks, so dp1[i][j] becomes 0.
   */
  for ( var i = 0 ; i < H ; i ++ )
  {
    for ( var j = 0 ; j < W ; j ++ )
    {
      if ( j == 0 ) // Special handling for the first column
      {
        if ( S [ i ] [ j ] == "#" )
        {
          dp1 [ i ] [ j ] = 0 ; // Wall, segment resets
        }
      }
      else // For columns other than the first
      {
        if ( S [ i ] [ j ] == "." ) // If it's an empty cell
        {
          // Extend the segment from the left
          dp1 [ i ] [ j ] = dp1 [ i ] [ j - 1 ] + 1 ;
        }
        else // If it's a wall
        {
          dp1 [ i ] [ j ] = 0 ; // Wall, segment resets
        }
      }
    }
  }


  /*
   Second DP pass: Adjust horizontal segments from right to left.
   This ensures that all '.' cells within a continuous horizontal segment
   have the same maximum length of that segment.
   e.g., if "....", dp1 would be [1,2,3,4]. This pass makes it [4,4,4,4].
   */
  for ( var i = 0 ; i < H ; i ++ )
  {
    for ( var j = W - 2 ; j >= 0 ; j -- ) // Iterate from right to left (excluding last column)
    {
      if ( S [ i ] [ j ] == "." ) // Only process empty cells
      {
        if ( dp1 [ i ] [ j + 1 ] != 0 ) // If the cell to its right is part of a segment
        {
          // Propagate the segment length from the right
          dp1 [ i ] [ j ] = dp1 [ i ] [ j + 1 ] ;
        }
      }
    }
  }


  /*
   Third DP pass: Calculate vertical continuous '.' segments from top to bottom.
   dp2[i][j] will store the length of the continuous '.' segment ending at (i, j),
   looking up.
   If S[i][j] is '#', the segment breaks, so dp2[i][j] becomes 0.
   */
  for ( var i = 0 ; i < H ; i ++ )
  {
    for ( var j = 0 ; j < W ; j ++ )
    {
      if ( i == 0 ) // Special handling for the first row
      {
        if ( S [ i ] [ j ] == "#" )
        {
          dp2 [ i ] [ j ] = 0 ; // Wall, segment resets
        }
      }
      else // For rows other than the first
      {
        if ( S [ i ] [ j ] == "." ) // If it's an empty cell
        {
          // Extend the segment from above
          dp2 [ i ] [ j ] = dp2 [ i - 1 ] [ j ] + 1 ;
        }
        else // If it's a wall
        {
          dp2 [ i ] [ j ] = 0 ; // Wall, segment resets
        }
      }
    }
  }


  /*
   Fourth DP pass: Adjust vertical segments from bottom to top.
   Similar to the horizontal adjustment, this ensures all '.' cells
   within a continuous vertical segment have the same maximum length
   of that segment.
   */
  for ( var i = H - 2 ; i >= 0 ; i -- ) // Iterate from bottom to top (excluding last row)
  {
    for ( var j = 0 ; j < W ; j ++ )
    {
      if ( S [ i ] [ j ] == "." ) // Only process empty cells
      {
        if ( dp2 [ i + 1 ] [ j ] != 0 ) // If the cell below it is part of a segment
        {
          // Propagate the segment length from below
          dp2 [ i ] [ j ] = dp2 [ i + 1 ] [ j ] ;
        }
      }
    }
  }


  // Calculate the maximum "lighted" cells.
  // For each cell (i, j), the total lighted cells passing through it
  // is (horizontal segment length + vertical segment length - 1)
  // The -1 is because the cell (i,j) itself is counted twice.
  var ans = 0 ;
  for ( var i = 0 ; i < H ; i ++ )
  {
    for ( var j = 0 ; j < W ; j ++ )
    {
      // Update the maximum answer found so far.
      ans = Math . max ( ans , dp1 [ i ] [ j ] + dp2 [ i ] [ j ] - 1 ) ;
    }
  }

  // Output the final answer to the console.
  console . log ( '%s' , ans ) ;

  // Return the calculated answer.
  return ans ;
}


/*
 This 'debug' function is likely for local testing in a browser environment.
 It reads input from a text area, calls Main, and compares the result
 with an expected output.
 */
function debug ( n )
{
  var input = document . getElementById ( "input" + n ) . value ;
  var ans = Main ( input ) ;

  var result = "WA" ; // Initialize result as "Wrong Answer"

  if ( ans == document . getElementById ( "output" + n ) . value . split ( "\n" ) [ 0 ] )
  {
    result = "AC" ; // If answer matches, it's "Accepted"
  }

  document . getElementById ( "result" + n ) . innerHTML = result ;
}

// This line is for execution in a Node.js environment (e.g., competitive programming platforms).
// It reads input from stdin and passes it to the Main function.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;