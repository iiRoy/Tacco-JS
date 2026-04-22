// Declare global variables for grid state and final outcome.
let gridConfiguration;
let finalVerdict;

// Custom function to parse strings into numbers, replacing the global Number constructor in map.
const numericalParser = ( strVal ) => Number( strVal );

// Define the recursive function for navigating the grid.
// It takes current Y and X coordinates as arguments.
function cellNavigator( currentYPosition, currentXPosition ) {
   // Check if the current cell has already been marked as visited ('#').
   // If so, it indicates a looping path.
   if ( gridConfiguration[ currentYPosition ][ currentXPosition ] === "#" ) {
      finalVerdict = "PATH_CYCLE"; // Set the outcome to indicate a loop.
      return; // End this recursive branch.
   }

   // Check if the current cell is the target exit point ('.').
   // If so, record its coordinates as the successful outcome.
   if ( gridConfiguration[ currentYPosition ][ currentXPosition ] === "." ) {
      finalVerdict = currentXPosition + " " + currentYPosition; // Store the coordinates.
      return; // End this recursive branch, success.
   }

   // Mark the current cell as visited to prevent revisiting and detect cycles.
   gridConfiguration[ currentYPosition ][ currentXPosition ] = "#";

   // The following conditional statements check the current cell's value
   // for directional symbols. However, because the cell was just marked '#',
   // these conditions will always evaluate to false, and no coordinate change will occur.
   // This behavior replicates the original code's specific logic.
   if ( gridConfiguration[ currentYPosition ][ currentXPosition ] === ">" ) {
      currentXPosition++; // This line will not execute due to previous assignment.
   }
   if ( gridConfiguration[ currentYPosition ][ currentXPosition ] === "<" ) {
      currentXPosition--; // This line will not execute.
   }
   if ( gridConfiguration[ currentYPosition ][ currentXPosition ] === "^" ) {
      currentYPosition--; // This line will not execute.
   }
   if ( gridConfiguration[ currentYPosition ][ currentXPosition ] === "v" ) {
      currentYPosition++; // This line will not execute.
   }

   // Recursively call the navigator for the next position.
   // Due to the logic above, this will often be the same coordinates,
   // leading to a quick detection of "PATH_CYCLE" in the next iteration.
   cellNavigator( currentYPosition, currentXPosition );
}

// Obtain the Node.js 'fs' module for file system operations.
const fileSystemHandler = require('fs');

// Create an alias for console output operations for clarity.
const outputService = {
  displayMessage: ( content ) => console.log( content )
};

// Read all data from standard input, using UTF-8 encoding.
const rawInputText = fileSystemHandler.readEntireFileContents( '/dev/stdin', 'utf8' );

// Process the raw input: remove leading/trailing whitespace, then split into an array of lines.
const processedLines = (rawInputText.trim()).split("\n");

// Main loop to process multiple grid scenarios from the input.
while ( true ) {
   // Extract the first line, split by space, and convert elements to numbers
   // to get the grid's height and width.
   const gridDimensionsInfo = processedLines.shift().split(" ").map( numericalParser );

   // Check for the termination condition: both dimensions are zero.
   if ( gridDimensionsInfo[0] === 0 && gridDimensionsInfo[1] === 0 ) {
      break; // Exit the processing loop.
   }

   // Initialize a new empty grid for the current scenario.
   gridConfiguration = [];

   // Loop to populate the grid with character arrays, row by row.
   for ( let rowIndex = 0; rowIndex < gridDimensionsInfo[0]; rowIndex++ ) {
      // Get the next line from processed input, split it into individual characters.
      const rowCharacters = (processedLines.shift()).split("");
      gridConfiguration.push( rowCharacters ); // Add the character array as a row to the grid.
   }

   // Reset the final outcome for the new grid traversal.
   finalVerdict = "";

   // Initiate the grid traversal starting from the top-left cell (0,0).
   cellNavigator( 0, 0 );

   // Output the determined verdict for the current grid scenario.
   outputService.displayMessage( finalVerdict );
}