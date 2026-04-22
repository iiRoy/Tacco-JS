/*
 *	This is a Type I clone of the original JavaScript code.
 *	It demonstrates extensive modifications in whitespace and comments
 *	while maintaining exact structural and logical equivalence.
 */


function	Main(	input	)
{
	//	Declare an array variable 'arr'
	var	arr	=	input	.	trim	( )	.	split	(	/\s|\n/	)	;	/*	Split the input string by whitespace or newline characters	*/


	//	Start an infinite loop that processes input
	while	(	1	)
	{
		/*
		 *	Extract the next string from the beginning of the array.
		 *	This string is expected to be a word to be processed.
		 */
		var	str	=	arr	.	shift	( )	;

		//	Check for the termination condition: a hyphen "-"
		if	(	str	==	"-"	)
		{
			break	;	//	Exit the loop if the termination character is found
		}

		//	Get the number of shuffle operations to perform
		var	n	=	arr	.	shift	( )	;

		//	Loop 'n' times to perform the shuffling operations
		for	(	var	i	=	0	;	i	<	parseInt(	n	)	;	i	++	)
		{
			//	Get the 'h' value for the current shuffle operation
			var	h	=	arr	.	shift	( )	;

			//	Convert 'h' to an integer
			h	=	parseInt(	h	)	;

			//	Perform the shuffle: move the first 'h' characters to the end of the string
			str	=	str	.	substr	(	h	)	+	str	.	slice	(	0	,	h	)	;
		}

		//	Output the shuffled string to the console
		console	.	log	(	str	)	;
	}
}	/*	End of the Main function definition	*/


//	Call the Main function with input read from standard input.
//	This is typically used in competitive programming environments.
Main	(	require	(	"fs"	)	.	readFileSync	(	"/dev/stdin"	,	"utf8"	)	)	;