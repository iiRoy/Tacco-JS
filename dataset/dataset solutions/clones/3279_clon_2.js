// This function determines a specific grid calculation based on provided numerical data.
function ComputeGridSolution( rawInputText ) {
  // First, normalize the input string: remove leading/trailing whitespace,
  // split into individual lines, and convert each line to a numerical value.
  rawInputText = rawInputText.trim().split( '\n' ).map( ( lineContent ) => Number( lineContent ) );

  // Extract the main dimension from the first element of the processed array.
  const overallLength = rawInputText[0];
  // Retrieve the vertical restriction from the second element.
  const restrictedHeight = rawInputText[1];
  // Obtain the horizontal restriction from the third element.
  const restrictedWidth = rawInputText[2];

  // Calculate the effective number of rows and columns after applying restrictions,
  // then compute their product to get the final area-like result.
  console.log( ( overallLength - restrictedHeight + 1 ) * ( overallLength - restrictedWidth + 1 ) );
}

// Read the input data from standard input using Node.js filesystem module.
// The file is read synchronously and decoded as UTF-8.
// Then, invoke the main processing function with the obtained data.
ComputeGridSolution( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );