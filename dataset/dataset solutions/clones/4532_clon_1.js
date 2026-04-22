/* This is a Type I clone of the original JavaScript code.
   Whitespace and comments have been extensively altered
   to make the code visually distinct, while maintaining
   absolute logical and structural equivalence. */

// The 'input' parameter will receive the complete input data
function Main(  input  ) {
	// The first line of input goes into input[0], the second into input[1], and so on.

	// console.log('%s',input); // This line was commented out in the original, keeping it that way.

	input = input.split( "\n" ) ; // Split the input string by newline characters.

	var tmp = input[1].split( " " ) ; // Take the second line and split it by spaces.

	var max = [ ] ; // Declare an array named 'max'.

	// Initialize the 'max' array with nine elements, all set to zero.
	for ( var i = 0 ; i < 9 ; i++ )
	{
		max[i] = 0 ;
	}

	// Iterate through the 'tmp' array, which contains the numbers from the second line.
	for ( var i = 0 ; i < tmp.length ; i++ )
	{
		var a = parseInt( tmp[i] , 10 ) ; // Convert the current string element to an integer.

		// Check the range of 'a' and set the corresponding 'max' array element to 1,
		// indicating that a number in that range was found.
		if ( 0 <= a && a < 400 ) { max[0] = 1 ; }
		else if ( 400 <= a && a < 800 ) { max[1] = 1 ; }
		else if ( 800 <= a && a < 1200 ) { max[2] = 1 ; }
		else if ( 1200 <= a && a < 1600 ) { max[3] = 1 ; }
		else if ( 1600 <= a && a < 2000 ) { max[4] = 1 ; }
		else if ( 2000 <= a && a < 2400 ) { max[5] = 1 ; }
		else if ( 2400 <= a && a < 2800 ) { max[6] = 1 ; }
		else if ( 2800 <= a && a < 3200 ) { max[7] = 1 ; }
		// The last range (3200 to 4800) counts occurrences instead of just marking presence.
		else if ( 3200 <= a && a <= 4800 ) { max[8] += 1 ; }
	}

	var b = 0 ; // Initialize a counter 'b'.

	// Sum the first eight elements of the 'max' array into 'b'.
	// These elements represent the number of distinct "rank" categories found.
	for ( var i = 0 ; i < 8 ; i++ )
	{
		b += max[i] ;
	}

	/* Calculate the maximum possible rank categories. */
	var ma = b + max[8] ; // 'ma' is the sum of distinct categories (b) plus the count of the highest category (max[8]).

	if ( ma > 8 ) { ma = 8 ; } // Cap 'ma' at 8 if it exceeds it.

	/* Calculate the minimum possible rank categories. */
	var mi = b ; // 'mi' is simply the count of distinct categories excluding the highest one.

	// Output the calculated minimum and maximum values.
	console.log( '%d %d' , mi , ma ) ;
}

// * This line and below should not be edited. It reads input from standard input
// * and calls the Main function with it.
Main( require( "fs" ) . readFileSync( "/dev/stdin" , "utf8" ) ) ;