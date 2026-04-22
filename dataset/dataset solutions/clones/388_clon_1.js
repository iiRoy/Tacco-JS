/*
 * This JavaScript function, named 'bomb', is a recursive procedure
 * designed to generate a specific path pattern within a 2D grid.
 * It's essentially a maze-like drawing algorithm.
 *
 * Parameters:
 *   y:    The current row index in the grid.
 *   x:    The current column index in the grid.
 *   z:    Represents the current direction of movement (0: Up, 1: Right, 2: Down, 3: Left).
 */
function bomb( y , x , z )
{
  // Base case: If the current cell is not an empty path marker ('+'),
  // then we cannot proceed further from this point in the current recursion branch.
  // This typically happens when a cell has already been marked as part of the path ('#')
  // or if it's an initial boundary condition.
  if ( yx [ y ] [ x ] != "+" )
  {
    return ; // Exit the function call.
  }

  // Define arrays for directional offsets in y and x coordinates.
  // These arrays correspond to the four cardinal directions (Up, Right, Down, Left).
  var dy = [ -1 , 0 , 1 , 0 ] ; // Change in y for each direction.
  var dx = [ 0 , 1 , 0 , -1 ] ; // Change in x for each direction.

  // Calculate the coordinates of the next cell based on the current position (y, x)
  // and the current direction (z).
  var Y = y + dy [ z ] ;
  var X = x + dx [ z ] ;

  // Check if the calculated next cell (Y, X) is outside the grid boundaries.
  // The grid size is 'n' by 'n'.
  if ( Y < 0 || X < 0 || Y >= n || X >= n )
  {
    // If the next cell is out of bounds, change the direction.
    // The direction 'z' is updated to the next one in a clockwise manner (0->1->2->3->0).
    z = ( z + 1 ) % 4 ;

    // Recursively call the 'bomb' function from the *current* cell (y, x)
    // with the newly adjusted direction. This attempts to find a valid path
    // by changing direction from the current point.
    bomb ( y , x , z ) ;
  }
  else
  {
    // If the next cell (Y, X) is within the grid boundaries,
    // check its current content.
    if ( yx [ Y ] [ X ] == "#" )
    {
      // If the next cell is already marked as part of the path ('#'),
      // it signifies either a collision with an existing path segment or a backtracking scenario.
      // In this case, the cell *before* the current one in the current direction 'z'
      // is reset to an empty path marker ('+'). This is crucial for the specific pattern.
      yx [ Y - dy [ z ] ] [ X - dx [ z ] ] = "+" ;

      // Based on the current direction 'z', a specific recursive call is made.
      // These calls involve specific offsets and initial directions,
      // which are part of the unique logic to generate the desired spiral/maze pattern.
      if ( z == 3 )
      {
        bomb ( Y - 2 * dy [ z ] - 1 , X - 2 * dx [ z ] , 0 ) ;
      }
      else if ( z == 0 )
      {
        bomb ( Y - 2 * dy [ z ] , X - 2 * dx [ z ] + 1 , 1 ) ;
      }
      else if ( z == 1 )
      {
        bomb ( Y - 2 * dy [ z ] + 1 , X - 2 * dx [ z ] , 2 ) ;
      }
      else if ( z == 2 )
      {
        bomb ( Y - 2 * dy [ z ] , X - 2 * dx [ z ] - 1 , 3 ) ;
      }
    }
    else
    {
      // If the next cell (Y, X) is not marked '#' (meaning it's an empty '+'),
      // then we can extend the path.
      // Mark the *current* cell (y, x) as part of the path ('#').
      yx [ y ] [ x ] = "#" ;

      // Store the coordinates of this newly marked cell in the 'last' array.
      // This variable tracks the last cell that was successfully marked as '#'.
      last = [ y , x ] ;

      // Recursively call 'bomb' to continue extending the path from the 'next' cell (Y, X)
      // in the *same* current direction (z).
      bomb ( Y , X , z ) ;
    }
  }
} // End of the 'bomb' function definition.


// --- Main Program Execution Block ---

// Read the entire content of standard input synchronously as a UTF-8 string.
var input = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ;

// Process the input string:
// 1. Remove leading/trailing whitespace (`trim()`).
// 2. Split the string into an array of strings based on newline characters (`split("\n")`).
// 3. Convert each string in the array to a `Number` (`map(Number)`).
var arr = input . trim ( ) . split ( "\n" ) . map ( Number ) ;

// The first element of the processed array `arr` represents the number of test cases.
// `arr.shift()` removes and returns this first element, and `d--` decrements it in the loop condition.
var d = arr . shift ( ) ;

// Loop through each test case until `d` becomes 0.
while ( d-- )
{
  // For each test case, the next element in `arr` is the grid size `n`.
  var n = arr . shift ( ) ;

  // Handle a special case: if the grid size `n` is 1.
  if ( n == 1 )
  {
    // A 1x1 grid simply contains a single '#' character.
    console . log ( "#" ) ;
    continue ; // Skip the rest of the loop for this test case and proceed to the next.
  }

  // Initialize a 2D array (grid) `yx` of size `n` by `n`.
  // All cells are initially filled with the '+' character, representing an empty, unvisited cell.
  var yx = [ ] ;
  for ( var i = 0 ; i < n ; i++ )
  {
    yx [ i ] = [ ] ; // Initialize each row as an empty array.
    for ( var j = 0 ; j < n ; j++ )
    {
      yx [ i ] [ j ] = "+" ; // Fill each cell in the row with '+'.
    }
  }

  // Declare an array `last` to store the coordinates of the last cell
  // that was successfully marked as '#' by the `bomb` function.
  var last = [ ] ;

  // Initiate the recursive path generation process by calling the `bomb` function.
  // The starting point is the bottom-left corner of the grid (n-1, 0),
  // and the initial direction is '0' (Up).
  bomb ( n - 1 , 0 , 0 ) ;

  // Post-processing step: If `n` (the grid size) is an even number,
  // the cell stored in `last` is reset from '#' back to '+'.
  // This adjustment is part of the specific output pattern requirement.
  if ( n % 2 == 0 )
  {
    yx [ last [ 0 ] ] [ last [ 1 ] ] = "+" ;
  }

  // Prepare and output the final grid to the console.
  // 1. `yx.join("\n")`: Joins all rows of the 2D array into a single string,
  //    with each row separated by a newline character.
  // 2. `.replace(/\,/g,"")`: Removes all commas that might be introduced by `join()`
  //    when joining elements within a row (e.g., `["#", "+"]` becomes `"#,"`).
  // 3. `.replace(/\+/g," ")`: Replaces all '+' characters with a space character.
  //    This is for the final visual representation of the path.
  console . log ( yx . join ( "\n" ) . replace ( /\,/g , "" ) . replace ( /\+/g , " " ) ) ;
}
// --- End of Main Program Execution Block ---