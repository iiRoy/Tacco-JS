function	Main(	input	)
{
	// This is the main function that processes the input data.
	input	=	input.split(	"\n"	).map(	v	=>	v.split(	" "	)	)	;

	const	n	=	input[	0	][	0	]	;	// The first element of the first line defines 'n'.

	const	roop	=	(	curent	,	x	,	y	)	=>
	{
		// This helper function calculates a counter based on comparison logic.
		// The current location is included, so we start counting from 1.
		let	counter	=	1	;

		for	(	let	i	=	1	;	i	<=	n	;	i++	)
		{
			if	(	curent	===	i	)
			{
				// If the current index 'i' matches 'curent', skip this iteration.
				continue	;
			}

			// Extract coordinates for the current iteration.
			const	px	=	input[	i	][	0	]	,
					py	=	input[	i	][	1	]	;

			// Apply the comparison logic: either (x < px and y < py) OR (px < x and py < y).
			if	(	(	x	<	px	&&	y	<	py	)
				||	(	px	<	x	&&	py	<	y	)	)
			{
				// A debug log that was commented out.
				// console.log(px, py);
				counter++	;	// Increment counter if the condition is met.
			}
		}

		return	counter	;	// Return the final count.
	}	;


	// Iterate from 1 to 'n' to process each item.
	for	(	let	i	=	1	;	i	<=	n	;	i++	)
	{
		// Another debug log, now commented out.
		// console.log("xxxxxxx");
		// Call the 'roop' function with current index and its coordinates, then print the result.
		console.log(	roop(	i	,	input[	i	][	0	]	,	input[	i	][	1	]	)	)	;
	}
}

// This line is a common pattern for competitive programming in Node.js to read standard input.
// It's like magic!
Main(	require(	"fs"	).readFileSync(	"/dev/stdin"	,	"utf8"	)	)	;