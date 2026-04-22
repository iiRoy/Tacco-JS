/*
 * This JavaScript function processes input to generate a specific
 * pattern, often found in grid-based problems or data manipulation.
 * It reads dimensions, an array of counts, and then fills a 2D grid
 * in a snake-like pattern before formatting it for output.
 */
function Main ( input )
{
  // Split the entire input string by newline characters
  // This converts the single input string into an array of lines.
  input = input . split ( "\n" ) ;

  // Parse the height (h) and width (w) from the first line of input.
  // The first line is expected to contain "h w", space-separated.
  var h = parseInt ( input [ 0 ] . split ( " " ) [ 0 ] ) ;
  var w = parseInt ( input [ 0 ] . split ( " " ) [ 1 ] ) ;

  // Parse N, the number of elements, from the second line of input.
  var n = parseInt ( input [ 1 ] ) ;

  // The third line contains N space-separated integers.
  // Store these temporarily in 'tmp' before parsing them into array 'a'.
  tmp = input [ 2 ] . split ( " " ) ;

  // Initialize array 'a' with N elements, all set to 0 initially.
  // This array will store the counts for each block type.
  a = new Array ( n ) . fill ( 0 ) ;

  // Populate array 'a' by parsing each string element in 'tmp' to an integer.
  for ( i = 0 ; i < n ; i ++ )
  {
    a [ i ] = parseInt ( tmp [ i ] ) ;
  }

  // Initialize an empty string 'ans' which will accumulate the final output.
  var ans = "" ;

  // Initialize a 2D array 'c' (conceptually, the grid) with 'h' rows.
  // Each row is initially filled with 0, but will be replaced by a 'w'-sized array.
  c = new Array ( h ) . fill ( 0 ) ;

  // Populate each row of 'c' with a new array of 'w' columns, filled with 0s.
  // This creates the actual HxW 2D grid structure.
  for ( i = 0 ; i < h ; i ++ )
  {
    csub = new Array ( w ) . fill ( 0 ) ; // Temporary row array.
    c [ i ] = csub ; // Assign the new row to the current row index.
  }

  // Initialize array 'd'. This array will store the "colors" or "block types"
  // based on the counts in array 'a'.
  // If a[0] = 3, it means color 1 appears 3 times. So, d will have [1, 1, 1, ...].
  d = new Array ( ) ;

  // Populate array 'd' according to the counts in 'a'.
  // For each element a[i], add (i+1) to 'd' 'a[i]' times.
  for ( i = 0 ; i < n ; i ++ )
  {
    for ( j = 0 ; j < a [ i ] ; j ++ )
    {
      d . push ( i + 1 ) ;
    }
  }

  // Fill the 2D grid 'c' with values from 'd' in a snake-like pattern.
  // Even rows (0, 2, ...) are filled left-to-right.
  // Odd rows (1, 3, ...) are filled right-to-left.
  for ( i = 0 ; i < h ; i ++ )
  {
    if ( i % 2 != 1 ) // If 'i' is an even row index (0, 2, 4...)
    {
      // Fill left-to-right
      for ( j = 0 ; j < w ; j ++ )
      {
        c [ i ] [ j ] = d [ i * w + j ] ;
      }
    }
    else // If 'i' is an odd row index (1, 3, 5...)
    {
      // Fill right-to-left
      // The index in 'd' needs to be adjusted for the reverse order.
      // (i+1)*w gives the start of the next row's elements in 'd',
      // then subtract 'j' to get the elements in reverse for the current row.
      for ( j = 0 ; j < w ; j ++ )
      {
        c [ i ] [ j ] = d [ ( i + 1 ) * w - ( j + 1 ) ] ; // Corrected index for right-to-left
      }
    }
  }

  // Now, construct the final output string 'ans' based on the filled grid 'c'.
  // This also follows the snake-like pattern for output, but uses 'd' directly
  // to avoid re-reading from 'c' if it's not strictly necessary.
  // It effectively reconstructs the output based on the same logic used to fill 'c'.
  for ( i = 0 ; i < h ; i ++ )
  {
    if ( i % 2 != 1 ) // Even rows: left-to-right
    {
      for ( j = 0 ; j < w ; j ++ )
      {
        if ( j % w != w - 1 ) // If not the last element in the row, add a space
        {
          ans += d [ i * w + j ] + " " ;
        }
        else // If it's the last element in the row, add a newline
        {
          ans += d [ i * w + j ] + "\n" ;
        }
      }
    }
    else // Odd rows: right-to-left
    {
      for ( j = 0 ; j < w ; j ++ )
      {
        if ( j % w != w - 1 ) // If not the last element in the row, add a space
        {
          ans += d [ ( i + 1 ) * w - ( j + 1 ) ] + " " ; // Corrected index for right-to-left
        }
        else // If it's the last element in the row, add a newline
        {
          ans += d [ ( i + 1 ) * w - ( j + 1 ) ] + "\n" ; // Corrected index for right-to-left
        }
      }
    }
  }

  // Remove the trailing newline character from the 'ans' string,
  // as the problem usually expects no newline at the very end.
  ans = ans . substr ( 0 , ans . length - 1 ) ;

  // Print the final formatted string to the console.
  console . log ( '%s' , ans ) ;
}

// This line handles reading input from stdin and passing it to the Main function.
// It's common practice in competitive programming environments.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;