// The primary entry function to process the provided data.
function ProcessEntry( entryString ) {

	// A sequence of individual characters extracted from the input.
	var symbolSequence = entryString.split( "" ) ;

	if ( ( symbolSequence[0] == symbolSequence[1] ) && ( symbolSequence[0] == symbolSequence[2] ) )
	{
		console.log( "Mismatch" )
	}
	else
	{
		console.log( "Match" )
	}
}

ProcessEntry(
	require("fs")
		.readFileSync( "/dev/stdin", "utf8" )
);