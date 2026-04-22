/*
 * This is a Type I clone of the original JavaScript code.
 * All identifiers, operators, and expressions are preserved exactly.
 * Only whitespace (indentation, spacing, blank lines) and comments
 * have been extensively modified to create a visually distinct version
 * while maintaining identical logical and structural behavior.
 */

// Define the main function that processes the incoming data.
function Main ( input )
{
  // First, split the entire input string into an array of lines.
  // Each element in the 'input' array will now be a single line.
  input  =  input . split ( "\n" ) ;


  // The first line of input contains two numbers, 'n' and 'm', separated by a space.
  // We extract these by splitting the first line.
  nm  =  input [ 0 ] . split ( " " ) ;

  // Parse the first number as 'n' (representing the size of the main grid).
  n  =  parseInt ( nm [ 0 ] ) ;
  // Parse the second number as 'm' (representing the size of the pattern grid).
  m  =  parseInt ( nm [ 1 ] ) ;

  // Initialize an empty array 't' which will hold the 'm x m' pattern grid.
  t  =  [ ] ;


  // Loop 'm' times to read each row of the pattern grid.
  for  ( var i = 0 ;  i < m ;  i ++ )
  {
    // Initialize an empty array 'r' for the current row of the pattern.
    r  =  [ ] ;

    // Inner loop 'm' times to read each character in the current pattern row.
    for  ( var j = 0 ;  j < m ;  j ++ )
    {
      // The pattern grid data starts after the 'n x n' main grid data.
      // Assuming the main grid takes 'n' lines (from input[1] to input[n]),
      // the pattern starts from input[n+1].
      // So, the current pattern row is at index 'i + 1 + n' in the 'input' array.
      r . push ( input [ i + 1 + n ] [ j ] ) ;
    }

    // After populating row 'r', add it to the pattern array 't'.
    t . push ( r ) ;
  }


  // Initialize a boolean flag 'yes' to false. This flag will be set to true
  // if the pattern (or at least a part of it, as per original logic) is found.
  yes  =  false ;

  // This is the outermost loop, iterating through possible starting rows
  // for the pattern within the main 'n x n' grid.
  // The loop runs from 0 up to 'n - m' to ensure the pattern fits vertically.
  loop0 : for  ( var i = 0 ;  i < n - m + 1 ;  i ++ )
  {
    // This is the second loop, iterating through possible starting columns
    // for the pattern within the main 'n x n' grid.
    // It runs from 0 up to 'n - m' to ensure the pattern fits horizontally.
    for  ( var j = 0 ;  j < n - m + 1 ;  j ++ )
    {
      /*
       * Inside this nested loop, we are now at a potential top-left corner
       * (i, j) in the main grid where the pattern 't' might fit.
       * We compare the characters of the pattern with the corresponding
       * characters in the main grid.
       */

      // Loop through the rows of the pattern 't' (indexed by 'k').
      loop1 : for  ( var k = 0 ;  k < m ;  k ++ )
      {
        // Loop through the columns of the pattern 't' (indexed by 'l').
        for  ( var l = 0 ;  l < m ;  l ++ )
        {
          // Compare a character from the main grid with a character from the pattern.
          // Main grid data starts from input[1], so offset by 1.
          // The character in the main grid is at (i + k + 1, j + l).
          // The character in the pattern is at (k, l).
          if  ( input [ i + 1 + k ] [ j + l ]  !=  t [ k ] [ l ] )
          {
            // If a mismatch is found, it means this specific pattern row (k)
            // does not match at the current (i, j) position.
            // Break out of the 'loop1' (k loop) to try the next (i, j) starting point.
            break  loop1 ;
          }
        }
        // IMPORTANT: The original code's logic places the `yes = true; break loop0;`
        // here, *after* the inner `l` loop completes for a given `k`, but *inside*
        // the `k` loop. This implies that if *any single row* of the pattern 't'
        // matches the corresponding row in the main grid, the program considers
        // it a full match and exits all loops. This is likely an anomaly in the
        // original algorithm's intent (e.g., it might have intended to check all
        // `m` rows of the pattern), but it is precisely what must be cloned.
        yes  =  true ;
        break  loop0 ; // Pattern (or a row of it) found, exit all search loops.
      }
      // End of loop1 (k loop for pattern rows)
    }
    // End of inner j loop (for main grid columns)
  }
  // End of loop0 (outer i loop for main grid rows)


  // After all loops complete, check the 'yes' flag.
  if  ( yes )
  {
    // If 'yes' is true, print "Yes".
    console . log ( "Yes" ) ;
  }
  else
  {
    // Otherwise (if no match was found), print "No".
    console . log ( "No" ) ;
  }

  // The Main function concludes here.
}

// This line executes the Main function.
// It reads the entire content of standard input ("/dev/stdin")
// as a UTF-8 encoded string and passes it to the Main function.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" ,  "utf8" ) ) ;