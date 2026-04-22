function myOut ( text ) { console . log ( text ) ; } /* This is a standard output utility function. */


function Main ( input )
{
	// Processing the input string.
	input = input . trim ( ) ;
	// The following lines are commented out as they represent alternative input parsing strategies.
	// input = input.trim().split(" ");
	// input = input.trim().split("\n");
	input = input . trim ( ) . split ( " " ) . map ( ( a ) => Number ( a ) ) ;
	// input = input.trim().split("\n").map((a)=>Number(a));


	/*
	 * Extracting individual color component values and the target sum N
	 * from the parsed input array.
	 */
	var R = input [ 0 ] ;
	var G = input [ 1 ] ;
	var B = input [ 2 ] ;
	var N = input [ 3 ] ;


	var list = [ R , G , B ] ; /* Array containing the three color values. */


	var max = Math . max . apply ( null , list ) ; // Finds the maximum color value.
	list . splice ( list . indexOf ( max ) , 1 ) ; // Removes the maximum value from the list.


	var first = Math . floor ( N / max ) ; // Calculates the maximum possible count for the largest color value.


	var next = Math . max . apply ( null , list ) ; // Finds the maximum of the remaining two color values.
	var last = Math . min . apply ( null , list ) ; // Finds the minimum of the remaining two color values.



	var output = 0 ; // Initialize the counter for valid combinations.


	// Outer loop iterates through possible counts for the 'max' color value.
	for ( var i = 0 ; i <= first ; i ++ )
	{
		var tmp = N - ( i * max ) ; // Remaining value after accounting for 'i' units of 'max'. This is '残り10' in original comment.
		var tmp2 = Math . floor ( tmp / next ) ; // Max possible count for 'next' color value with the remaining 'tmp'.


		// This conditional block was likely used for debugging purposes.
		if ( i == 227 )
		{
			// console.log(tmp); // Debugging line, currently commented out.
		}


		// Inner loop iterates through possible counts for the 'next' color value.
		for ( j = 0 ; j <= tmp2 ; j ++ )
		{
			var tmp3 = tmp - ( j * next ) ; // Remaining value after accounting for 'j' units of 'next'.

			// Check if the remaining value 'tmp3' can be perfectly divided by the 'last' color value.
			if ( tmp3 % last == 0 )
			{
				output ++ ; // Increment the counter if a valid combination is found.
			}
		}

	}

	// Output the total number of valid combinations.
	console . log ( output ) ;
}


// Call the Main function with input read from standard input.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;