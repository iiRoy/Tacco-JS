/*
 * This is a Type I clone of an existing JavaScript program.
 * It processes input to simulate movement on a grid or detect loops.
 * The core logic and identifiers are preserved exactly.
 */
function main ( )
{
  // Declare all necessary variables at the start of the function.
  var
    i, j, w, h, t, l, /* Loop counters and grid dimensions */
    line, cache, map, isLoop, /* Data structures and flags */
    len = input.length; // Determine the total number of input lines for iteration.

  // Iterate through each block of input data.
  for ( i = 0 ; i < len ; i++ )
  {
    // Split the current line to get width and height.
    line = input[i].split ( ' ' ) ;
    w = parseInt ( line[0] , 10 ) ; // Parse width from the first part.
    h = parseInt ( line[1] , 10 ) ; // Parse height from the second part.

    // If both width and height are zero, it's the termination condition.
    if ( w === 0 && h === 0 )
      break ; // Exit the loop if termination condition is met.

    // Initialize the map (grid) and cache for tracking visited positions.
    map = [ ] ;
    cache = { } ;

    // Populate the map with 'h' lines following the current line.
    for ( j = 0 ; j < h ; j++ )
      map[j] = input [ ++i ] ;

    // Initialize current position (t: row, l: column).
    t = 0 ;
    l = 0 ;
    isLoop = false ; // Flag to detect if a loop is encountered.

    // Simulate movement until an exit point ('.') is reached.
    while ( map[t].charAt ( l ) !== '.' )
    {
      // Mark the current position as visited in the cache.
      cache [ [ t , l ] ] = true ;

      // Determine the next move based on the character at the current position.
      switch ( map[t].charAt ( l ) )
      {
        case '>' : // Move right
          l += 1 ;
          break ;
        case '<' : // Move left
          l -= 1 ;
          break ;
        case 'v' : // Move down
          t += 1 ;
          break ;
        case '^' : // Move up
          t -= 1 ;
          break ;
      }

      // Check if the next position has already been visited, indicating a loop.
      if ( cache [ [ t , l ] ] === true )
      {
        isLoop = true ; // Set the loop flag.
        break ; // Exit the movement simulation loop.
      }
    }
    // Output the result: 'LOOP' if a loop was found, or the final coordinates.
    console.log ( isLoop ? 'LOOP' : [ l , t ].join ( ' ' ) ) ;
  }
}

// Global variable to store all input received from stdin.
var
  input = '' ;

// Start listening for input from the standard input stream.
process.stdin.resume ( ) ;
process.stdin.setEncoding ( 'utf8' ) ; // Set encoding for input.

// Event listener for incoming data chunks.
process.stdin.on ( 'data' , function ( chunk ) {
  input += chunk ; // Append each chunk to the input string.
} ) ;

// Event listener for the 'end' of input stream.
process.stdin.on ( 'end' , function ( ) {
  // Split the accumulated input into an array of lines.
  input = input.split ( '\n' ) ;
  // Call the main function to process the input.
  main ( ) ;
} ) ;