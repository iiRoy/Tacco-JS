// The entire incoming stream of characters is provided to this routine.
function ProcessInput( rawData )
{

	// The provided text is split into an array of individual rows.
	let processedLines = rawData.split( "\n" ) ;


	// The initial row is further segmented by spaces.
	let firstLineParts = processedLines[0].split( " " ) ;

	// The first numerical component from the initial row is assigned.
	let numeratorValue = firstLineParts[0] ;
	// The second numerical component from the initial row is assigned.
	let denominatorValue = firstLineParts[1] ;


	// The division result is printed to the console output.
	console.log( numeratorValue / denominatorValue ) ;
}

// Do not alter any code below this comment, as it handles standard input/output operations and invokes the primary handler.
ProcessInput( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) ) ;