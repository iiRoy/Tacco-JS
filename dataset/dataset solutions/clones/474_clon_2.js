/*
This function performs a Breadth-First Search (BFS)
to find the shortest path to match a given sequence
on a grid.
*/
function PathFinder( initialColumn, initialRow, targetSequence )
{
  // Define relative movements for 4 directions (up, left, right, down)
  const columnOffsets = [ 0, -1, 1, 0 ];
  const rowOffsets = [ -1, 0, 0, 1 ];

  // Initialize a 2D array to store minimum path lengths to reach a cell
  // with a certain remaining sequence length.
  // Using a large initial value for unknown paths.
  let minPathLengths = [];
  for ( let rowIndex = 0; rowIndex <= 1000; rowIndex++ )
  {
    minPathLengths[ rowIndex ] = [];
    for ( let colIndex = 0; colIndex <= 1000; colIndex++ )
    {
      minPathLengths[ rowIndex ][ colIndex ] = targetSequence.length;
    }
  }

  let totalMoves = 0; // Counter for steps taken
  // Initialize the search queue with starting position, step count, and full target sequence
  const explorationFrontier = [ [ initialColumn, initialRow, totalMoves, targetSequence ] ];

  // Main BFS loop
  while ( true )
  {
    // If the queue is empty, no path was found
    if ( explorationFrontier.length === 0 )
    {
      totalMoves = Infinity;
      break;
    }

    // Dequeue the current processing node
    const currentNode = explorationFrontier.shift();
    const currentX = currentNode[ 0 ]; // Current column
    const currentY = currentNode[ 1 ]; // Current row
    const stepsTaken = currentNode[ 2 ]; // Steps to reach this node
    const remainingPattern = currentNode[ 3 ]; // Remaining sequence to match

    // If the sequence is fully matched, we found a path
    if ( remainingPattern === "" )
    {
      totalMoves = stepsTaken;
      break;
    }

    // Explore neighbors
    for ( let directionIdx = 0; directionIdx < 4; directionIdx++ )
    {
      const nextX = currentX + columnOffsets[ directionIdx ];
      const nextY = currentY + rowOffsets[ directionIdx ];
      let updatedPattern = remainingPattern;

      // Check boundary conditions using globally defined map dimensions (mapBounds)
      if ( nextX < 0 || nextY < 0 || nextX >= mapBounds[ 0 ] || nextY >= mapBounds[ 1 ] )
      {
        continue; // Skip out-of-bounds neighbors
      }

      // Check if the cell content matches the first character of the remaining pattern
      if ( gridData[ nextY ][ nextX ] === remainingPattern[ 0 ] )
      {
        updatedPattern = updatedPattern.slice( 1 ); // Consume the matched character
      }

      // If we found a shorter path to this cell with this remaining pattern length, update and enqueue
      if ( minPathLengths[ nextY ][ nextX ] <= updatedPattern.length )
      {
        continue; // Already found a better or equal path
      }

      minPathLengths[ nextY ][ nextX ] = updatedPattern.length; // Update minimum length
      explorationFrontier.push( [ nextX, nextY, stepsTaken + 1, updatedPattern ] ); // Enqueue neighbor
    }
  }
  return totalMoves; // Return the minimum number of moves
}


// --- Main Program Execution ---

// Read input from standard input
const fileContent = require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' );
const inputLines = ( fileContent.trim() ).split( "\n" );

let mapBounds; // Global variable for grid dimensions
let gridData; // Global variable for grid layout

// Process multiple test cases
while ( true )
{
  mapBounds = ( inputLines.shift() ).split( " " ).map( Number );

  // Termination condition: 0 0 for dimensions
  if ( mapBounds[ 0 ] === 0 && mapBounds[ 1 ] === 0 )
  {
    break;
  }

  gridData = []; // Reset grid for new test case
  let initialPosition = []; // Reset start position

  // Populate the grid and find the starting point 'S'
  for ( let r = 0; r < mapBounds[ 1 ]; r++ )
  {
    const rowSegments = ( inputLines.shift() ).split( "" );
    if ( rowSegments.indexOf( "S" ) !== -1 )
    {
      initialPosition = [ rowSegments.indexOf( "S" ), r ];
    }
    gridData.push( rowSegments );
  }

  const solutionPairs = []; // Store results for different target sequences

  // Calculate paths for various target sequences
  solutionPairs.push( [ PathFinder( initialPosition[ 0 ], initialPosition[ 1 ], "A1B2C" ), 1 ] );
  solutionPairs.push( [ PathFinder( initialPosition[ 0 ], initialPosition[ 1 ], "D3E4F" ), 2 ] );
  solutionPairs.push( [ PathFinder( initialPosition[ 0 ], initialPosition[ 1 ], "G5H6I" ), 3 ] );
  solutionPairs.push( [ PathFinder( initialPosition[ 0 ], initialPosition[ 1 ], "J7K8L" ), 4 ] );
  solutionPairs.push( [ PathFinder( initialPosition[ 0 ], initialPosition[ 1 ], "M9N0P" ), 5 ] );


  // Sort the results based on path length (first element of the pair)
  solutionPairs.sort( function( itemA, itemB ) { return itemA[ 0 ] - itemB[ 0 ]; } );

  // Output the result: "NA" if no path found, otherwise the index and path length
  console.log( ( solutionPairs[ 0 ][ 0 ] === Infinity ) ? "NA" : solutionPairs[ 0 ][ 1 ] + " " + solutionPairs[ 0 ][ 0 ] );
}