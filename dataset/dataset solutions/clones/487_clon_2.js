function pathSearcher ( )
{
   // This object stores visited states (row, column) to prevent re-processing
   var visitedNodes = {};

   // Initialize the result value to 'NA' (Not Available)
   var finalPathLength = "NA";

   // The queue of paths to explore, each element is [row, column, length]
   var queueOfPaths = [ [0, 0, 0], [1, 0, 0] ];

   while ( true )
   {
      // If there are no more paths to explore, exit the loop
      if ( queueOfPaths.length === 0 )
      {
         break;
      }

      // Get the next path segment from the front of the queue
      var currentPathSegment = queueOfPaths.shift();

      // Extract coordinates and path length from the current segment
      var currentRow = currentPathSegment[0];
      var currentColumn = currentPathSegment[1];

      // Check if this node has been visited before
      if ( visitedNodes.hasOwnProperty( currentRow + "," + currentColumn ) )
      {
         continue; // Skip if already visited
      }
      else
      {
         // Mark the current node as visited
         visitedNodes[ currentRow + "," + currentColumn ] = true;
      }

      var segmentLength = currentPathSegment[2];

      // Check if the target column is reached and the cell type is not a specific blocker (type 2)
      if ( currentColumn === gridDimension - 1 && gridConfiguration[currentRow][currentColumn] !== 2 )
      {
         finalPathLength = segmentLength; // Update the result with the current path length
         break; // Target reached, exit the main search loop
      }

      // Determine the type of the current cell
      var cellType = gridConfiguration[currentRow][currentColumn];

      // Special handling for cell type 1 (move right until boundary or non-1 cell)
      if ( cellType === 1 )
      {
         var reachedTarget = false;
         while ( true )
         {
            currentColumn++; // Move one step right
            if ( currentColumn === gridDimension - 1 ) // If we hit the right boundary
            {
               reachedTarget = true; // Mark that target was reached
               break;
            }
            if ( gridConfiguration[currentRow][currentColumn] !== 1 ) // If the next cell is not type 1
            {
               currentColumn--; // Step back, as the current cell is not type 1
               break;
            }
         }
         if ( reachedTarget ) // If the target was reached by continuous movement
         {
            finalPathLength = segmentLength; // Update the result
            break; // Exit the main search loop
         }
      }
      // Special handling for cell type 2 (move left until non-2 cell)
      else if ( cellType === 2 )
      {
         while ( true )
         {
            currentColumn--; // Move one step left
            if ( gridConfiguration[currentRow][currentColumn] !== 2 ) // If the next cell is not type 2
            {
               break; // Stop moving left
            }
         }
      }
      // For all cell types, explore neighbors in the other row
      for ( var neighborOffset = 0; neighborOffset <= 2; neighborOffset++ )
      {
         // Add potential next states to the queue: switch row, move to currentColumn + offset, increment length
         queueOfPaths.push( [ 1 - currentRow, currentColumn + neighborOffset, segmentLength + 1 ] );
      }
   }
   return finalPathLength; // Return the calculated path length
}

// Read input from standard input
var fileData = require('fs') .readFileSync( '/dev/stdin', 'utf8' );

// Process the input data: trim whitespace and split into lines
var inputLinesArray = fileData .trim() .split( "\n" );

// Main loop to process multiple test cases
while ( true )
{
   // Get the grid dimension for the current test case and convert to number
   var gridDimension = inputLinesArray.shift() - 0;

   // If gridDimension is 0, it signifies the end of input
   if ( gridDimension === 0 )
   {
      break;
   }

   // Initialize the grid configuration for two rows
   var gridConfiguration = [];
   // Parse the first row of the grid
   gridConfiguration[0] = inputLinesArray.shift() .split( " " ) .map( Number );
   // Parse the second row of the grid
   gridConfiguration[1] = inputLinesArray.shift() .split( " " ) .map( Number );

   // Call the path searcher function and print the result
   console.log( pathSearcher() );
}