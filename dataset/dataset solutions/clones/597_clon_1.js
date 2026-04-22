// This is the main Breadth-First Search (BFS) function.
// It aims to find the shortest path or a specific state.
function BFS( X , Y )
{
  // Mark the starting position as visited or empty.
  YX[ Y ][ X ] = ".";


  // Define movement vectors for 4 directions (up, left, right, down).
  var dx = [ 0 , -1 , 1 , 0 ];
  var dy = [ -1 , 0 , 0 , 1 ];

  // Initialize a counter for the path length.
  var cnt = 0;

  // The BFS queue, storing [x, y, current_count, current_strength, current_grid_state].
  var bfs = [ [ X , Y , cnt , 1 , YX ] ];

  // An object to keep track of visited states to prevent cycles and redundant computations.
  var obj = { };

  // Initialize the object with the starting state.
  // Note: 'x' and 'y' here refer to the global X, Y passed to the function,
  // but due to scope, this line might have issues in the original code.
  // We must preserve it as is.
  obj[ x + " " + y + " " + YX.join( "" ) ] = true ;


  // Main BFS loop.
  while ( true )
  {
    // If the queue is empty, no path was found.
    if ( bfs.length == 0 )
    {
      cnt = -1 ;
      break ;
    }

    // Dequeue the first element (leaf node).
    var leaf = bfs.shift( );

    // Extract coordinates, count, strength, and grid state from the leaf.
    var x = leaf[ 0 ] ;
    var y = leaf[ 1 ] ;
    var c = leaf[ 2 ] ;
    var s = leaf[ 3 ] ;
    var yx = leaf[ 4 ] ;

    // Check if the target strength has been reached.
    if ( s === power + 1 )
    {
      cnt = c ; // Store the current count.
      break ;   // Exit the loop as the goal is achieved.
    }

    // Explore all 4 possible directions.
    for ( var i = 0 ; i < 4 ; i ++ )
    {
      // Calculate new coordinates.
      var xx = x + dx[ i ] ;
      var yy = y + dy[ i ] ;

      // Current strength for the next state.
      var ss = s ;

      // Boundary checks: Ensure new coordinates are within grid limits.
      if ( xx < 0 || yy < 0 || xx >= hw[ 1 ] || yy >= hw[ 0 ] )
      {
        continue ; // Skip invalid moves.
      }

      // Obstacle check: If the next cell is an 'X', it's impassable.
      if ( YX[ yy ][ xx ] == "X" )
      {
        continue ; // Skip obstacle cells.
      }

      // Create a deep copy of the current grid state.
      // This is crucial because the grid state changes for each path.
      var copy = yx.map( function ( v ) { return v.slice( ); } ) ;

      // Check if the next cell has a strength requirement that can be met.
      if ( copy[ yy ][ xx ] === "" + ss )
      {
        ss ++ ; // Increment strength if requirement is met.
        copy[ yy ][ xx ] = "." ; // Mark the cell as visited/consumed.
      }

      // Create a unique string representation of the new state (coordinates + grid).
      var str = xx + " " + yy + " " + copy.join( "" ) ;

      // Check if this state has already been visited to avoid redundant processing.
      if ( obj.hasOwnProperty( str ) )
      {
        continue ; // If visited, skip.
      }

      // Mark the new state as visited.
      obj[ str ] = true ;

      // Enqueue the new state into the BFS queue.
      bfs.push( [ xx , yy , c + 1 , ss , copy ] ) ;
    } // End of for loop
  } // End of while loop

  // Return the final count (shortest path length or -1 if not found).
  return cnt ;
} // End of BFS function definition


// --- Main Program Execution Starts Here ---
// This section handles input processing and initiating the BFS.

// Read input from standard input.
var input = require( 'fs' ) . readFileSync( '/dev/stdin' , 'utf8' ) ;

// Split input into lines and remove leading/trailing whitespace.
var Arr = ( input . trim( ) ) . split( "\n" ) ;

// Parse the first line for height, width, and initial power.
var hw = ( Arr . shift( ) ) . split( " " ) . map( Number ) ;

// Extract the power value.
var power = hw[ 2 ] ;

// Initialize an array to store the grid (map).
var YX = [ ] ;

// Initialize an array to store the starting coordinates.
var start = [ ] ;

// Loop through the remaining lines to build the grid and find the 'S' (start) position.
for ( var i = 0 ; i < hw[ 0 ] ; i ++ )
{
  // Split each line into an array of characters.
  var arr = ( Arr . shift( ) ) . split( "" ) ;

  // If 'S' is found in the current row, record its coordinates.
  if ( arr . indexOf( "S" ) != -1 )
  {
    start = [ arr . indexOf( "S" ) , i ] ;
  }
  // Add the processed row to the grid.
  YX . push( arr ) ;
}

// Call the BFS function with the starting coordinates.
var ans = BFS( start[ 0 ] , start[ 1 ] ) ;

// Output the result to the console.
console . log( ans ) ;