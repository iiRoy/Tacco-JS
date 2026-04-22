/*
 * This JavaScript file contains a function to calculate a specific maximum value.
 * It processes input from stdin, performs calculations, and prints the result to stdout.
 *
 * The main logic resides in the 'main' function.
 *
 */
function   main  (   input   )   {
	// Declare variables for a, b, and n.
	let    a  ,  b  ,  n   ;

	/*
	 * Parse the first line of input.
	 * The input is expected to be a single string containing three space-separated integers.
	 * These integers are then assigned to 'a', 'b', and 'n' respectively.
	 */
	[   a   ,    b    ,    n   ]    =    input[    0    ]    .trim(  )  .split(   " "   )  .map(   i   =>   parseInt(   i   )   )   ;


	// Initialize 'max' with a very small number to ensure any valid 's' value will be greater.
	let    max    =    -100000000   ;


	// Check if 'n' is greater than 'b'. This determines the calculation strategy.
	if    (   n   >   b   )   {
		/*
		 * If n > b, iterate through a specific range to find the maximum 's'.
		 * The loop starts from n - (b + 1) and goes up to n (inclusive).
		 */
		for    (   let    i    =    n   -   (   b   +   1   )   ;   i   <=   n   ;   i   ++   )   {
			// Calculate 's' based on the given formula.
			let    s    =    Math.floor(   a   *   i   /   b   )    -    (   a    *    Math.floor(   i   /   b   )   )   ;

			// Update 'max' if the current 's' value is greater.
			if    (   max   <   s   )   {
				max    =    s   ;
			}
		}
	}    else    {
		// If n <= b, a direct calculation for 'max' is performed using 'n'.
		max    =    Math.floor(   a   *   n   /   b   )    -    (   a    *    Math.floor(   n   /   b   )   )   ;
	}

	// Print the final calculated maximum value to the console.
	console.log(   max   )   ;
}

// Read input from standard in, process it, and pass it to the main function.
main(   require(   'fs'   )   .readFileSync(   '/dev/stdin'   ,    'utf8'   )   .trim(  )  .split(   "\n"   )   )   ;
/* End of file */