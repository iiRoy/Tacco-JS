// Function to traverse a specific grid layout
function navigateGrid ( ) {
   var visitedSpots = {}; // Stores coordinates of cells already processed
   var finalOutcome = "NO_PATH"; // Default result if no path is found
   var searchFrontier = [ [ 0, 0, 0 ], [ 1, 0, 0 ] ]; // Queue for BFS: [row, col, steps]

   while ( true ) { // Main loop for exploration
      if ( searchFrontier.length === 0 )
      {
         break; // No more cells to explore, exit
      }

      var currentLocationData = searchFrontier.shift( ); // Get the next cell to process
      var rowIndex = currentLocationData[ 0 ]; // Current row index
      var colIndex = currentLocationData[ 1 ]; // Current column index

      // Check if this cell has been visited to avoid cycles and redundant processing
      if ( visitedSpots.hasOwnProperty( `${rowIndex},${colIndex}` ) )
      {
         continue; // Skip if already visited
      }
      else
      {
         visitedSpots[ `${rowIndex},${colIndex}` ] = true; // Mark as visited
      }

      var stepsTaken = currentLocationData[ 2 ]; // Number of steps to reach this cell

      // Check if we've reached the target column and the cell type allows termination
      if ( colIndex === gridWidth - 1 && gridLayout[ rowIndex ][ colIndex ] !== 2 )
      {
         finalOutcome = stepsTaken; // Path found, record steps
         break; // Exit the main exploration loop
      }

      var cellType = gridLayout[ rowIndex ][ colIndex ]; // Get the type of the current cell

      if ( cellType === 1 )
      { // Special movement rule for cell type 1
         var targetReached = false; // Flag to indicate if target boundary is reached
         while ( true )
         { // Move right as long as cell type is 1 or boundary not reached
            colIndex++; // Advance column
            if ( colIndex >= gridWidth - 1 )
            { // Check if we've hit or passed the end column
               targetReached = true; // Target reached through this path
               break; // Exit inner movement loop
            }
            if ( gridLayout[ rowIndex ][ colIndex ] !== 1 )
            {
               colIndex--; // Retreat one step if next cell is not type 1
               break; // Exit inner movement loop
            }
         }
         if ( targetReached )
         { // If the target was reached during the rightward scan
            finalOutcome = stepsTaken; // Store the current steps as the result
            break; // Exit the main exploration loop
         }
      }
      else if ( cellType === 2 )
      { // Special movement rule for cell type 2
         while ( true )
         { // Move left as long as cell type is 2
            colIndex--; // Retreat column
            if ( gridLayout[ rowIndex ][ colIndex ] !== 2 )
            {
               break; // Stop when cell type is no longer 2
            }
         }
      }

      // Add potential next exploration points to the frontier
      // This includes switching rows (1-rowIndex) and adjusting columns (colIndex + offset)
      for ( var offsetValue = 0; offsetValue <= 2; offsetValue++ )
      {
         searchFrontier.push( [ 1 - rowIndex, colIndex + offsetValue, stepsTaken + 1 ] );
      }
   }
   return finalOutcome; // Return the computed outcome
}

// Global variables for grid dimensions and layout, set by input processing
var gridWidth;
var gridLayout = [];

// Module for file system operations
var fileSystemModule = require( 'fs' );

// Read and process input from standard input
var rawInputContent = fileSystemModule.readFileSync( '/dev/stdin', 'utf8' );
var processedLines = rawInputContent.trim( ).split( "\n" );

while ( true )
{ // Loop to process multiple test cases
   gridWidth = processedLines.shift( ) - 0; // Get grid width and convert to number

   if ( gridWidth === 0 )
   {
      break; // Exit loop if grid width is zero
   }

   gridLayout[ 0 ] = processedLines.shift( ).split( " " ).map( Number ); // Parse first row
   gridLayout[ 1 ] = processedLines.shift( ).split( " " ).map( Number ); // Parse second row

   console.log( navigateGrid( ) ); // Execute the grid navigation and print result
}