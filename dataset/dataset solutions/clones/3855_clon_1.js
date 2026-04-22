var lines = [ ]; // Array to store input lines from standard input.
var B_counter, S, H, W; // B_counter: count of initial '#' cells, S: grid representation, H: height, W: width.

// Import the 'readline' module to handle input line by line.
var readline = require('readline');


// Create an interface for reading input.
var rl = readline.createInterface( {
  input: process.stdin,   // Specifies standard input as the source.
  output: process.stdout, // Specifies standard output (though not used for direct output in this logic).
} );


// Event listener: triggered when a new line of input is received.
rl.on( 'line', function ( x ) {
  // Each line read is added to the 'lines' array.
  lines.push( x );
} );


// Event listener: triggered when the input stream closes (e.g., EOF).
rl.on( 'close', function ( ) {
  // Parse height (H) and width (W) from the first line of input.
  // The first line is expected to contain "H W".
  H = Number( lines[ 0 ] . split( " " ) [ 0 ] );
  W = Number( lines[ 0 ] . split( " " ) [ 1 ] );

  // Remove the first line from the 'lines' array as it has been processed.
  lines.shift( );


  // Convert the remaining input lines into a 2D array (grid S) of characters.
  S = lines . map( i => i . split( "" ) );

  // Original code had a commented-out debug line:
  // // console.log(S);


  // Initialize B_counter to track the total number of '#' cells.
  // Initialize 'q' as an empty array, which will serve as a queue for BFS.
  B_counter = 0;
  var q = [ ];

  // Iterate through the grid to find all initial '#' cells.
  for ( var i = 0; i < H; i++ ) {
    for ( var j = 0; j < W; j++ ) {
      // If a '#' cell is found, add its coordinates to the queue and increment B_counter.
      if ( S[ i ] [ j ] === "#" ) {
        q . push( [ i, j ] );
        B_counter++;
      }
    }
  }

  // Call the BFS function with the initial queue of '#' cells and print its result.
  console . log( bfs( q ) );
} );


/**
 * Performs a Breadth-First Search (BFS) starting from the given queue of '#' cells.
 * It counts how many '#' cells are connected to the starting points.
 *
 * @param {Array<Array<number>>} q - The initial queue of coordinates [y, x] of '#' cells.
 * @returns {string} "Yes" if all initial '#' cells form a single connected component, "No" otherwise.
 */
function bfs( q ) {

  // 'black' counts the '#' cells visited during BFS.
  // 'ans' stores the final result, defaulting to "No".
  var black = 0;
  var ans = "No";


  // Continue the BFS process as long as there are elements in the queue.
  while ( q . length ) {

    // Dequeue the first element, which is a pair of coordinates [y, x].
    var t = q . shift( );
    var y = t[ 0 ], x = t[ 1 ]; // Extract y (row) and x (column) coordinates.

    // Check all four possible neighbors (right, left, down, up).

    // Check right neighbor: (x+1)
    if ( 0 <= x + 1 && x + 1 < W ) { // Ensure neighbor is within grid bounds.
      if ( S[ y ] [ x + 1 ] === "#" ) { // If neighbor is an unvisited '#' cell.
        S[ y ] [ x + 1 ] = ".";       // Mark it as visited by changing to '.'.
        black++;                      // Increment the count of visited '#' cells.
        q . push( [ y, x + 1 ] );     // Enqueue the neighbor for further exploration.
      }
    }
    // Check left neighbor: (x-1)
    if ( 0 <= x - 1 && x - 1 < W ) {
      if ( S[ y ] [ x - 1 ] === "#" ) {
        S[ y ] [ x - 1 ] = ".";
        black++;
        q . push( [ y, x - 1 ] );
      }
    }
    // Check down neighbor: (y+1)
    if ( 0 <= y + 1 && y + 1 < H ) {
      if ( S[ y + 1 ] [ x ] === "#" ) {
        S[ y + 1 ] [ x ] = ".";
        black++;
        q . push( [ y + 1, x ] );
      }
    }
    // Check up neighbor: (y-1)
    if ( 0 <= y - 1 && y - 1 < H ) {
      if ( S[ y - 1 ] [ x ] === "#" ) {
        S[ y - 1 ] [ x ] = ".";
        black++;
        q . push( [ y - 1, x ] );
      }
    }

  }


  // After BFS completes, compare the count of visited '#' cells ('black')
  // with the total initial count of '#' cells ('B_counter').
  if ( black === B_counter ) {
    ans = "Yes"; // If they are equal, all '#' cells form a single connected component.
  }

  // Return the final answer.
  return ( ans );
}