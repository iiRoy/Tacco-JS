// This top-level function processes the incoming data string.
function ProcessDataEntry( incomingText )
{
	// The provided text string is split into individual components using a space as the delimiter.
	const tokenizedInput = incomingText.split( " " );


	// Extract and parse the initial value, representing the total count, from the first component.
	let totalQuantity = Number.parseInt( tokenizedInput[ 0 ], 10 );

	// Extract and parse the second value, representing the quantity of the first group.
	let firstQuantity = Number.parseInt( tokenizedInput[ 1 ], 10 );

	// Extract and parse the third value, representing the quantity of the second group.
	let secondQuantity = Number.parseInt( tokenizedInput[ 2 ], 10 );


	// Compute the remaining count or the absolute deficit if the combined groups exceed the total.
	let deficitValue = ( totalQuantity - firstQuantity - secondQuantity > 0 )
		? 0
		: Math.abs( totalQuantity - firstQuantity - secondQuantity );

	// Display the smaller of the two group quantities and the calculated deficit value.
	console.log( '%i %i', Math.min( firstQuantity, secondQuantity ), deficitValue );
}


// Do not alter the following segment of the script; it handles input/output and calls the main processing routine.
ProcessDataEntry( require( "node:fs" ).readFileSync( "/dev/stdin", "utf8" ) );