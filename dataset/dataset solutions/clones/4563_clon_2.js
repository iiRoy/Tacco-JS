// Strict mode declaration for safer code execution within this module.
'use strict';

/**
 * Transforms raw text input into a framed grid-like output.
 * This function processes the provided string, extracts dimensions,
 * and constructs a visual representation with a border.
 * @param {string} sourceText - The entire input string, typically from stdin.
 */
function processGridData( sourceText )
{

  // Split the entire source text into individual lines based on newline characters.
  let processedLines = sourceText.split( '\n' );

  // Process the very first line to extract essential grid dimensions (height and width).
  // It splits this initial line by spaces and then converts each resulting part into an integer.
  processedLines[0] = processedLines[0].split( ' ' ).map( ( numericPart ) => {
    // Using parseInt for explicit and base-aware type conversion to an integer.
    return parseInt( numericPart, 10 );
  } );

  // Extract the height and width values from the newly parsed first line's array.
  const gridHeight = processedLines[0][0]; // Represents the number of rows for the inner content.
  const gridWidth  = processedLines[0][1]; // Represents the number of columns for the inner content.

  // Initialize a buffer to progressively build the final display string.
  // Start by adding the top border, which is two characters wider than the content width.
  let displayBuffer = '#'.repeat( gridWidth + 2 ) + '\n';

  // Iterate through each content line, adding a border character to both sides.
  for ( let currentLineIndex = 1; currentLineIndex <= gridHeight; ++currentLineIndex )
  {
    // Append the left border, the actual content line, the right border, and a newline character.
    displayBuffer += '#' + processedLines[currentLineIndex] + '#\n';
  }

  // After all content lines are processed, append the bottom border, mirroring the top border.
  displayBuffer += '#'.repeat( gridWidth + 2 );

  // Output the completely framed string to the standard console output.
  console.log( displayBuffer );

} // End of the processGridData function definition.

// Main execution block: Reads input from standard input and funnels it to the processing function.
// This leverages Node.js's file system module to synchronously read the full content of /dev/stdin.
processGridData( require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' ) );