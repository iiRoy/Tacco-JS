function ComputeOutcome( inputPayload ) {

  let parsedLines = inputPayload.split( "\n" );

  const overallDimension = parseInt( parsedLines[0] );
  const restrictedHeight = parseInt( parsedLines[1] );
  const restrictedWidth  = parseInt( parsedLines[2] );

  var calculatedOutcome = ( overallDimension - restrictedHeight + 1 ) * ( overallDimension - restrictedWidth + 1 );

  console.log( "%s", calculatedOutcome );

}


// This function is for simulating user input, typically for testing purposes in a browser environment.
function performTest( ) {

  const sampleInput = document.querySelector( "#dataEntry" ).value;

  ComputeOutcome( sampleInput );
}

// Execute the primary calculation function with data read from the standard input file.
ComputeOutcome( require( "node:fs" ).readFileSync( "/app/data/input.txt", "utf8" ) );