/*
 * This module contains a function designed to analyze a string of three space-separated values.
 * It checks for specific conditions among these values to determine an output.
 */
function DetermineTripletStatus( inputLine )
{
	// Divide the incoming string into an array of string segments.
	// The splitting occurs at each occurrence of a space character.
	let valueSegments = inputLine.split( " " );

	// Initialize a status indicator.
	// This boolean variable will track if any of the problematic patterns are detected.
	// Initially, we assume no such pattern is present.
	let isPatternAbsent = true;

	// Evaluate the first potential pattern:
	// If the initial segment matches the second segment, AND
	// the second segment does NOT match the third segment.
	if ( ( valueSegments[0] === valueSegments[1] ) && ( valueSegments[1] !== valueSegments[2] ) )
	{
		// A specific pattern has been identified, so update the indicator.
		isPatternAbsent = false;
	}
	// Otherwise, proceed to check the second potential pattern:
	// If the initial segment matches the third segment, AND
	// the third segment does NOT match the second segment.
	else if ( ( valueSegments[0] === valueSegments[2] ) && ( valueSegments[2] !== valueSegments[1] ) )
	{
		// A specific pattern has been identified.
		isPatternAbsent = false;
	}
	// Otherwise, proceed to check the third potential pattern:
	// If the second segment matches the third segment, AND
	// the second segment does NOT match the initial segment.
	else if ( ( valueSegments[1] === valueSegments[2] ) && ( valueSegments[1] !== valueSegments[0] ) )
	{
		// A specific pattern has been identified.
		isPatternAbsent = false;
	}

	// Based on the final state of the 'isPatternAbsent' indicator,
	// print the corresponding textual output to the console.
	if ( isPatternAbsent )
	{
		console.log( "No" ); // No problematic pattern was found.
	}
	else
	{
		console.log( "Yes" ); // A problematic pattern was found.
	}
}

// The following code reads input from the standard input stream,
// processes it, and then invokes the primary function with the data.
// It uses Node.js's 'fs' module to read the file,
// decodes it using UTF-8, and removes any leading or trailing whitespace.
DetermineTripletStatus(
	require( "fs" )
		.readFileSync( "/dev/stdin", "utf8" )
		.trim()
);