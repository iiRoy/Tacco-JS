// This function processes raw input to display a framed grid.
function ProcessGridData( rawData )
{
  // Split the entire input string into an array of individual lines.
  let lineArray = rawData.split( '\n' );

  // The very first line of input contains the grid's dimensions;
  // it is split by spaces to get width and height as strings.
  const dimensionsString = lineArray[0].split( ' ' );
  
  // Convert the string representations of height and width into numerical values.
  const gridHeight = Number( dimensionsString[0] );
  const gridWidth = Number( dimensionsString[1] );

  // Initialize an empty string that will store the top and bottom border rows.
  let borderRow = '';
  // This loop constructs the border row by appending '#' characters.
  // The length is gridWidth + 2 to account for the left and right border characters.
  for ( let counter = 0; counter < gridWidth + 2; counter++ )
  {
    borderRow += '#';
  }
  // Output the fully constructed top border row to the console.
  console.log( borderRow );

  // Iterate through each line that represents the actual content of the grid.
  // The loop starts from index 1 because index 0 contained the dimensions.
  // It continues up to gridHeight, covering all content lines.
  for ( let lineIndex = 1; lineIndex < gridHeight + 1; lineIndex++ )
  {
    // For each content line, output it framed by a '#' character on both sides.
    console.log( '#' + lineArray[lineIndex] + '#' );
  }

  // Finally, output the bottom border row, which is identical to the top border.
  console.log( borderRow );
}

// Execute the grid processing function.
// It reads input from standard input using Node.js's 'fs' module,
// ensuring the input is interpreted as UTF-8 encoded text.
ProcessGridData( require( "fs" ) . readFileSync( "/dev/stdin", "utf8" ) );