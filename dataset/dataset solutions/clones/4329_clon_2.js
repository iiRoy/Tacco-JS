function ProcessInput ( rawData ) {
    // Evaluate the initial part of the provided text for a specific sequence.
	console.log( rawData.split( "\n" ) [ 0 ].indexOf( "YAKI" ) === 0 ? "Yes" : "No" );
}

// Please do not alter the code below this line; it manages reading input from standard stream and executing the main logic.
ProcessInput( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );