// This function rotates a 2D array (matrix) by 90 degrees clockwise.
// It effectively transposes the matrix and then reverses the order of columns.
function circle( part )
{
  // Declare variables for matrix dimensions and loop counters.
  var
    m = part.length, // 'm' stores the number of rows/columns (assuming square matrix).
    i,               // Loop counter for rows.
    j,               // Loop counter for columns.
    part2 = [ ]      // 'part2' will store the rotated matrix.
  ; // Semicolon after var declaration block.

  // Initialize 'part2' with empty arrays for each row.
  for ( i = 0 ; i < m ; i++ )
  {
    part2[ i ] = [ ] ; // Each row of the new matrix is an empty array.
  }

  // Perform the rotation: transpose and reverse column order.
  for ( i = 0 ; i < m ; i++ )
  {
    for ( j = 0 ; j < m ; j++ )
    {
      // The element at [j][i] in the original matrix
      // goes to [i][m - j - 1] in the rotated matrix.
      part2[ i ][ m - j - 1 ] = part[ j ][ i ] ;
    }
  }

  // Return the newly created rotated matrix.
  return part2 ;
}

/*
 * Main function to solve the image matching problem.
 * It reads image and part data, rotates the part, and searches for its occurrence
 * within the image, reporting the top-left coordinate if found.
 */
function main ( )
{
  var
    image ,      // The main image matrix.
    part ,       // The smaller part (pattern) matrix.
    parts ,      // Array to store all 4 rotations of the 'part'.
    checkFlag ,  // Boolean flag to indicate if a match is found for the current part rotation.
    i , j ,      // Loop counters for general iteration.
    x , y ,      // Coordinates of the top-left corner of the found pattern.
    ax , ay ,    // Stores the minimum (y, x) coordinates of a match.
    h ,          // Loop counter for iterating through different part rotations (0-3).
    k , l ,      // Loop counters for iterating through rows/columns of the part.
    n , m ,      // Dimensions: 'n' for image, 'm' for part.
    line         // Temporary variable to store parsed input lines.
  ;

  // Infinite loop for processing multiple test cases.
  for ( ; ; )
  {
    // --- Input Processing Section ---
    // Reads a line from input, splits by whitespace, and converts to floats.
    line = input . shift ( ) . split ( /\s+/ ) . map ( parseFloat ) ;

    // Extracts image dimensions (n) and part dimensions (m).
    n = line[ 0 ] ;
    m = line[ 1 ] ;

    // Termination condition: if both n and m are zero, exit the loop.
    if ( n === 0 && m === 0 )
      break ;

    // Initialize the 'image' array.
    image = [ ] ;
    // Populate the 'image' array by reading 'n' lines of data.
    for ( i = 0 ; i < n ; i++ )
    {
      image . push ( input . shift ( ) . split ( / +/ ) . map ( parseFloat ) ) ;
    }

    // Initialize the 'part' array.
    part = [ ] ;
    // Populate the 'part' array by reading 'm' lines of data.
    for ( i = 0 ; i < m ; i++ )
    {
      part . push ( input . shift ( ) . split ( / +/ ) . map ( parseFloat ) ) ;
    }

    // Generate all four rotations of the 'part' and store them in 'parts'.
    parts = [ ] ; // Initialize array to hold rotations.
    for ( i = 0 ; i < 4 ; i++ , part = circle ( part ) )
    {
      parts . push ( part ) ; // Add current rotation to the 'parts' array.
    }

    // --- Search Algorithm Section ---
    // Initialize 'ax' and 'ay' to a very large value to ensure any valid coordinate
    // will be smaller and thus become the initial match.
    ax = ay = 99999999 ;

    // Label for the outer search loop to allow breaking out of multiple loops.
    search:
    // Iterate through all possible top-left positions (i, j) in the image
    // where the 'part' could fit.
    for ( i = 0 ; i <= n - m ; i++ )
    {
      for ( j = 0 ; j <= n - m ; j++ )
      {
        // Iterate through all four rotations of the 'part'.
        for ( h = 0 ; h < 4 ; h++ )
        {
          checkFlag = true ; // Assume a match initially for this rotation and position.
          x = y = 0 ;        // Reset coordinates for the current potential match.

          // Label for the inner pattern matching loop.
          check:
          // Iterate through the elements of the current 'part' rotation.
          for ( k = 0 ; k < m ; k++ )
          {
            for ( l = 0 ; l < m ; l++ )
            {
              // If the part element is -1, it's a wildcard; skip comparison.
              if ( parts[ h ][ k ][ l ] === -1 )
              {
                continue ;
              }

              // If the part element does not match the corresponding image element,
              // this is not a match. Set flag to false and break from inner loops.
              if ( parts[ h ][ k ][ l ] !== image[ i + k ][ j + l ] )
              {
                checkFlag = false ;
                break check ; // Break out of the 'check' loop (k and l loops).
              }

              // If this is the first non-wildcard element found, record its absolute coordinates.
              // This ensures 'x' and 'y' store the coordinates of the first *meaningful* match.
              if ( x === 0 && y === 0 )
              {
                x = j + l + 1 ; // Column index (1-based).
                y = i + k + 1 ; // Row index (1-based).
              }
            }
          }

          // If a full match was found for the current rotation and position.
          if ( checkFlag )
          {
            // Update 'ay' and 'ax' if the current match has a smaller 'y' coordinate.
            if ( y < ay )
            {
              ay = y ;
              ax = x ;
            }
            // If 'y' coordinates are equal, update if the current match has a smaller 'x' coordinate.
            else if ( y === ay && x < ax )
            {
              ax = x ;
            }
          }
        }
      }
    }

    // --- Output Section ---
    // If a match was found (ax and ay are no longer their initial large values).
    if ( ax !== 99999999 && ay !== 99999999 )
    {
      console . log ( ax + ' ' + ay ) ; // Output the 1-based coordinates.
    }
    else
    {
      console . log ( 'NA' ) ; // No match found.
    }
  } // End of main loop for test cases.
}

// Global variable to accumulate input data.
var
  input = ''
;

// Standard Node.js input handling setup.
// Resume stdin to start listening for input.
process . stdin . resume ( ) ;
// Set input encoding to UTF-8.
process . stdin . setEncoding ( 'utf8' ) ;

// Event listener for incoming data chunks.
process . stdin . on ( 'data' , function ( chunk )
{
  input += chunk ; // Append each chunk of data to the 'input' string.
} ) ;

// Event listener for the 'end' of input stream.
process . stdin . on ( 'end' , function ( )
{
  // Once all input is received, split it into lines.
  input = input . split ( '\n' ) ;
  // Call the main function to process the data.
  main ( ) ;
} ) ;