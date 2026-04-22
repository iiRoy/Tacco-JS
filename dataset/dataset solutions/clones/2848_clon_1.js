/*
 * This JavaScript code processes input data.
 * The Main function is the entry point for execution.
 * It calculates a maximum value and then performs
 * further calculations based on the parity of N.
 */
// The 'input' parameter will contain the entire input data as a string.
function         Main (   input   ) {
	// First, split the input string by newline characters into an array of strings.
	input   =   input . split   ( "\n" ) ;

	// Parse the first element of the input array as an integer to get N.
	const    N    =    parseInt   ( input [ 0 ] ) ;

	/*
	 * Process the second line of input:
	 * 1. Split it by spaces.
	 * 2. Map each string element to an integer.
	 * 3. Sort the numbers in descending order.
	 *    The sorting logic (a > b ? -1 : a == b ? 0 : 1) ensures descending order.
	 */
	const    nums    =    input [ 1 ] . split   ( " " ) . map   ( x    =>    parseInt ( x ) ) . sort   ( ( a , b )    =>    a > b ? -1 : a == b ? 0 : 1 ) ;

	// Initialize 'max' variable to store the calculated maximum value.
	var    max    =    0 ;

	// Loop through 'N' iterations to calculate 'max'.
	for    ( i = 0 ;    i < N ;    i ++ ) {
		// Check if the current index 'i' is even.
		if    ( i % 2 == 0 ) {
			// If 'i' is even, add an element from 'nums' to 'max'.
			// The index for 'nums' is Math.floor(i/2).
			max    =    max    +    nums [ Math . floor   ( i / 2 ) ] ;
		}    else {
			// If 'i' is odd, subtract an element from 'nums' from 'max'.
			// The index for 'nums' is N - Math.floor(i/2 + 1).
			max    =    max    -    nums [ N - Math . floor   ( i / 2 + 1 ) ] ;
		}
	}

	// Output the final calculated 'max' value to the console.
	console . log   ( max ) ;

	// Check the parity of N to determine the next calculation path.
	if    ( N % 2 == 0 ) {
		// If N is even, initialize 'now' with the last element of 'nums'.
		var    now    =    nums [ N - 1 ] ;

		// Loop N-1 times for the even N case.
		for    ( i = 0 ;    i < N - 1 ;    i ++ ) {
			// Inner check for parity of 'i'.
			if    ( i % 2 == 0 ) {
				// If 'i' is even, log a specific pair of numbers and update 'now'.
				console . log   ( nums [ Math . floor   ( i / 2 ) ]    +    " "    +    now ) ;
				now    =    nums [ Math . floor   ( i / 2 ) ]    -    now ;
			}    else {
				// If 'i' is odd, log a different pair of numbers and update 'now'.
				console . log   ( nums [ N - Math . floor   ( i / 2 + 1 ) ]    +    " "    +    now ) ;
				now    =    nums [ N - Math . floor   ( i / 2 + 1 ) ]    -    now ;
			}
		}
	}    else {
		// If N is odd, initialize 'now' with the first element of 'nums'.
		var    now    =    nums [ 0 ] ;

		// Loop N-1 times, starting from i=1, for the odd N case.
		for    ( i = 1 ;    i < N ;    i ++ ) {
			// Inner check for parity of 'i'.
			if    ( i % 2 == 0 ) {
				// If 'i' is even, log a specific pair and update 'now'.
				console . log   ( nums [ Math . floor   ( i / 2 ) ]    +    " "    +    now ) ;
				now    =    nums [ Math . floor   ( i / 2 ) ]    -    now ;
			}    else {
				// If 'i' is odd, log a different pair and update 'now'.
				console . log   ( nums [ N - Math . floor   ( i / 2 + 1 ) ]    +    " "    +    now ) ;
				now    =    nums [ N - Math . floor   ( i / 2 + 1 ) ]    -    now ;
			}
		}
	}
}

/*
 * The following line is boilerplate code for competitive programming environments.
 * It reads the entire standard input and passes it to the Main function.
 * DO NOT EDIT BELOW THIS LINE.
 */
Main    (    require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" )    ) ;