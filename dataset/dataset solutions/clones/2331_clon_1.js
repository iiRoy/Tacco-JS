/*
 * This is the main function that processes the input.
 * It takes a string 'arg' as input, which typically comes from standard input.
 */
function         Main (   arg  ) {
	// Initialize N: The first line of input, converted to a number.
	var   N = arg . split ( "\n" ) [ 0 ] - 0   ;


	// Initialize 'a': The second line of input, split by spaces, and each part converted to a number.
	var   a   =   arg . split ( "\n" ) [ 1 ] . split ( " " ) . map ( v => v - 0 ) ;


	// 'num' tracks the expected number in the sequence (1, 2, 3, ...).
	var   num = 1       ;
	// 'block' counts how many numbers are "out of place".
	var   block   =   0 ;

	/*
	 * Iterate through the array 'a' to check for sequential numbers.
	 * The loop runs 'N' times, where 'N' is the count of elements.
	 */
	for  (  var   i   =   0 ;   i   <   N ;   i++  )  {

		// If the current number in 'a' does not match the expected 'num',
		// it means we encountered a "block".
		if   (   num   !==   a [ i ]   )
		{
			block++ ; // Increment the block counter.
		}
		// Otherwise, if the number matches,
		else
		{
			num++ ;   // Increment 'num' to expect the next sequential number.
		}

	} // End of the main processing loop.


	// Special condition: If all numbers were "blocked" AND we never found '1',
	// it implies no sequential numbers started, so set block to -1.
	if  (  block   ===   N   &&   num   == 1  )
		block   =   -1   ;

	// Output the final 'block' count to the console.
	console.log ( block ) ;

	// The function completes its execution.
	return     ;
}

// Read input from standard input and pass it to the Main function for processing.
Main (   require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" )   ) ;