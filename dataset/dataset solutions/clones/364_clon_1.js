/*
 * This JavaScript code solves a puzzle using a Breadth-First Search (BFS) approach.
 * It reads input, initializes a board, and then explores possible moves
 * to reach a target configuration.
 */

// Read the entire input from standard input, assuming it's UTF-8 encoded.
var input = require('fs').readFileSync('/dev/stdin' , 'utf8');


// Process the input: trim whitespace and split into an array of lines.
var Arr = ( input.trim() ) .split("\n") ;

// Define movement vectors for the Y-axis (up, no change, no change, down).
var dy = [ -1 , 0 , 0 , 1 ] ;

// Define movement vectors for the X-axis (no change, left, right, no change).
var dx = [ 0 , -1 , 1 , 0 ] ;


// Iterate over each line (puzzle configuration) received from the input.
Arr .forEach( function ( v , I ) {
  // Parse the current line into an array of numbers.
  // Each number represents a tile on the puzzle board.
  var V = v .split(" ") .map( Number ) ;

  // Initialize an object to keep track of visited board configurations (states).
  // This helps in avoiding redundant computations and cycles.
  var obj = { } ;

  // Initialize the queue for the Breadth-First Search (BFS).
  // Each element in the queue is a pair: [board_state, number_of_moves].
  var P = [ [ V , 0 ] ] ;

  // Continue BFS as long as there are states to explore in the queue.
  while ( P .length > 0 ) {
    // Dequeue the next state to process.
    var A = P .shift() ;

    // Extract the current board configuration (array of tiles).
    var arr = A[0] ;
    // Extract the number of moves made to reach this configuration.
    var cnt = A[1] ;

    // Check if the current board configuration matches the target state.
    // The target state is "01234567" when joined as a string.
    if ( arr .join("") == "01234567" ) {
      // If target reached, print the number of moves and exit this puzzle's processing.
      console .log( cnt ) ;
      break ;
    }

    // Find the index of the '0' tile (empty space) on the board.
    var index = arr .indexOf( 0 ) ;

    // Calculate the Y-coordinate (row) of the empty space.
    var y = Math .floor( index / 4 ) ;
    // Calculate the X-coordinate (column) of the empty space.
    var x = index % 4 ;

    // Represent the 1D array as a 2x4 2D array for easier movement calculations.
    // This creates two arrays, each representing a row of the puzzle.
    var yx = [ arr .slice( 0 , 4 ) , arr .slice( 4 , 8 ) ] ;

    // Loop through all four possible directions (up, left, right, down).
    for ( var i = 0 ; i < 4 ; i++ ) {
      // Calculate the new Y-coordinate for the potential move.
      var yy = y + dy[i] ;
      // Calculate the new X-coordinate for the potential move.
      var xx = x + dx[i] ;

      // Check if the new coordinates are within the board boundaries (2x4).
      if ( yy < 0 || xx < 0 || yy >= 2 || xx >= 4 ) {
          // If out of bounds, skip this direction and try the next.
          continue ;
      }

      // Simulate swapping the empty tile with the adjacent tile.
      // 1. Move the tile from (yy, xx) to the empty spot (y, x).
      yx[y][x] = yx[yy][xx] ;
      // Store the value of the tile that was moved to the empty spot.
      var card = yx[yy][xx] ;
      // 2. Set the original position of the moved tile to 0 (making it the new empty spot).
      yx[yy][xx] = 0 ;

      // Convert the 2D board representation back into a 1D array.
      var YX = yx[0] .concat( yx[1] ) ;
      // Convert the 1D array into a string for easy comparison and storage in the visited set.
      var str = YX .join("") ;

      // Check if this new board configuration has already been visited.
      if ( obj .hasOwnProperty( str ) == false ) {
        // If not visited, mark it as visited.
        obj[str] = true ;
        // Add this new configuration and its move count to the BFS queue.
        P .push( [ YX , cnt + 1 ] ) ;
      }

      // Backtrack: Undo the swap to restore the board to its state before this move.
      // This is crucial for exploring other directions from the original (y,x) empty spot.
      yx[yy][xx] = card ;
      yx[y][x] = 0 ;
    }
  }
} ) ;