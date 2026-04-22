/*
 * This module is designed to perform a preliminary check
 * on a given textual input stream.
 */
function  analyzeSource  (   incomingText   )   {

	// The core logic involves searching for a specific leading sequence.
	if	(	incomingText.indexOf	(	"YAKI"	)	===	0	)	{
		// If the designated prefix is found at the very beginning.
		console.log (	"Yes"	); // Output positive confirmation.
	}
	else	{
		// Should the prefix not be present, we indicate a negative result.
		console.log (	"No"	); // Output negative confirmation.
	}
}


// Initiate the processing by acquiring input from the standard input channel.
analyzeSource	(	require	(	"fs"	)	.	readFileSync	(	"/dev/stdin"	,	"utf8"	)	)	;