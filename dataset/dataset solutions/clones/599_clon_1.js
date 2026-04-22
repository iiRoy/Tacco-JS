// This section contains a commented-out Breadth-First Search (BFS) function.
// It's part of the original problem description but not actively executed in this snippet.
/*
function BFS( X , Y )
{
   // Mark the starting position as visited or processed
   YX[Y][X] = ".";

   // Define movement vectors for 4 directions (up, left, right, down)
   var dx = [ 0 , -1 , 1 , 0 ];
   var dy = [ -1 , 0 , 0 , 1 ];

   // Initialize counter for steps
   var cnt = 0;

   // Initialize the BFS queue with the starting state:
   // [x-coordinate, y-coordinate, current_count, current_power_level, current_map_state]
   var bfs = [ [ X , Y , cnt , 1 , YX ] ];

   // Initialize an object to keep track of visited states to prevent cycles and redundant computations
   var obj = {};
   // The key for the object combines coordinates and the flattened map state
   obj[ x + " " + y + " " + YX.join("") ] = true;

   // Main BFS loop
   while ( true )
   {
      // If the queue is empty, no path found
      if ( bfs.length == 0 )
      {
         cnt = -1; // Indicate failure
         break;    // Exit loop
      }

      // Dequeue the first element (current leaf/node)
      var leaf = bfs.shift();

      // Extract state variables from the dequeued leaf
      var x  = leaf[0]; // Current x-coordinate
      var y  = leaf[1]; // Current y-coordinate
      var c  = leaf[2]; // Current step count
      var s  = leaf[3]; // Current power level
      var yx = leaf[4]; // Current state of the map

      // Check if the target power level has been reached
      if ( s === power + 1 )
      {
         cnt = c; // Store the step count
         break;   // Exit loop as solution found
      }

      // Explore neighbors (4 directions)
      for ( var i = 0 ; i < 4 ; i++ )
      {
         var xx = x + dx[i]; // Calculate new x-coordinate
         var yy = y + dy[i]; // Calculate new y-coordinate
         var ss = s;         // Initialize new power level with current one

         // Check boundary conditions
         if ( xx < 0 || yy < 0 || xx >= wh[0] || yy >= wh[1] )
         {
            continue; // Skip if out of bounds
         }

         // Check if the new position is an obstacle ('X')
         if ( YX[yy][xx] == "X" )
         {
            continue; // Skip if obstacle
         }

         // Create a deep copy of the current map state for the next step
         var copy = yx.map( function( v ) { return v.slice(); } );

         // Check if the new position contains a power-up matching the current level
         if ( copy[yy][xx] === "" + ss )
         {
            ss++;                 // Increment power level
            copy[yy][xx] = ".";   // Mark power-up as collected
         }

         // Construct a unique string representation of the new state for visited tracking
         var str = xx + " " + yy + " " + copy.join("");

         // Check if this state has already been visited
         if ( obj.hasOwnProperty( str ) )
         {
            continue; // Skip if already visited
         }

         // Mark the new state as visited
         obj[str] = true;

         // Enqueue the new state into the BFS queue
         bfs.push( [ xx , yy , c + 1 , ss , copy ] );
      }
   }
   // Return the minimum steps or -1 if no path found
   return cnt;
}
*/
// End of commented-out BFS function definition.

// --- Main script execution starts here ---

// Read input from standard input (e.g., a file or pipe)
var input = require( 'fs' ) . readFileSync( '/dev/stdin' , 'utf8' );

// Process the input: trim whitespace and split by newline characters
var Arr = ( input . trim() ) . split( "\n" );

// Extract width, height, and initial power from the first line of input
// and convert them to numbers
var wh = ( Arr . shift() ) . split( " " ) . map( Number );

// Assign the third element of 'wh' array as the 'power' variable
var power = wh[2];

// Initialize an empty array to store the game map
var YX = [];

// Initialize an empty array to store the starting coordinates
var start = [];

// Loop through the remaining lines of input to build the map and find the 'S' (start) position
for ( var i = 0 ; i < wh[1] ; i++ )
{
   // Get the current row and split it into characters
   var arr = ( Arr . shift() ) . split( "" );

   // Check if the current row contains the starting point 'S'
   if ( arr . indexOf( "S" ) != -1 )
   {
      // If 'S' is found, store its coordinates [x, y]
      start = [ arr . indexOf( "S" ) , i ];
   }

   // Add the processed row to the YX (map) array
   YX . push( arr );
}

// Initialize the answer variable.
// The actual calculation for 'ans' would typically happen using the BFS function,
// but in this snippet, it's just initialized and then logged.
var ans = 0;

// Output the final answer to the console
console . log( ans );