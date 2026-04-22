const fileSystemModule = require('fs');
let sourceData = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

let linesOfData = ( sourceData.trim() ).split( "\n" );

const yOffsets = [ -1, 0, 0, 1 ]; // Vertical movement deltas
const xOffsets = [ 0, -1, 1, 0 ]; // Horizontal movement deltas

// Process each puzzle configuration from the input file
linesOfData.forEach( function( currentLine ) {

   let puzzleState = currentLine.split(" ").map(Number); // Convert input string to array of numbers

   const visitedStates = {}; // Object to track already processed puzzle states

   // Initialize a Breadth-First Search (BFS) queue
   // Each element is [puzzle configuration (1D array), moves count]
   let processingQueue = [ [ puzzleState, 0 ] ];

   // Continue as long as there are states to explore
   while ( processingQueue.length > 0 ) {

      let currentEntry = processingQueue.shift(); // Dequeue the next state
      let currentPuzzleLayout = currentEntry[0];
      let totalMoves = currentEntry[1];

      // Check if the current puzzle configuration matches the solved state
      if ( currentPuzzleLayout.join("") === "01234567" ) {
         console.log( totalMoves ); // Output the number of moves
         break; // Exit the loop for this puzzle, as it's solved
      }

      let zeroTilePosition = currentPuzzleLayout.indexOf(0); // Find the index of the empty tile (0)
      let currentRow = Math.floor( zeroTilePosition / 4 ); // Calculate row of the empty tile
      let currentColumn = zeroTilePosition % 4; // Calculate column of the empty tile

      // Convert the 1D puzzle array into a 2D representation (2 rows, 4 columns)
      let twoDRender = [ currentPuzzleLayout.slice(0,4), currentPuzzleLayout.slice(4,8) ];

      // Explore all four possible directions for moving the empty tile
      for (let directionIndex = 0; directionIndex < 4; directionIndex++ ) {

         let newRow = currentRow + yOffsets[directionIndex];
         let newColumn = currentColumn + xOffsets[directionIndex];

         // Check if the new position is within the 2x4 grid boundaries
         if ( newRow < 0 || newColumn < 0 || newRow >= 2 || newColumn >= 4 ) {
            continue; // Skip if the move is out of bounds
         }

         // Simulate the tile swap: move the adjacent tile into the empty spot
         let movedTileValue = twoDRender[newRow][newColumn];
         twoDRender[currentRow][currentColumn] = movedTileValue;
         twoDRender[newRow][newColumn] = 0; // The old tile's spot becomes the new empty spot

         // Convert the modified 2D array back to a 1D array
         let potentialNextState = twoDRender[0].concat( twoDRender[1] );
         let stateSignature = potentialNextState.join(""); // Create a unique string identifier for the state

         // Check if this new state has been visited before
         if ( !visitedStates.hasOwnProperty( stateSignature ) ) {
            visitedStates[stateSignature] = true; // Mark the state as visited
            // Enqueue the new state along with the incremented move count
            processingQueue.push( [ potentialNextState, totalMoves + 1 ] );
         }

         // Revert the tile swap to prepare for exploring the next direction
         twoDRender[newRow][newColumn] = movedTileValue; // Put the tile back
         twoDRender[currentRow][currentColumn] = 0; // Restore the empty spot
      }
   }
});