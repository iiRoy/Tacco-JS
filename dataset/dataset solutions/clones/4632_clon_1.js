/*
 * This JavaScript source file contains a solution for a specific problem.
 * It reads numerical data from standard input, processes it to identify
 * changes in direction (increasing/decreasing sequences), and outputs
 * a final calculated value.
 *
 * The code is structured as an Immediately Invoked Function Expression (IIFE)
 * to encapsulate variables and prevent global scope pollution.
 */

const    input    =    require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ;


// This IIFE takes the 'input' string as an argument.
;  (    (    input    data    )    =>    {

	// First, split the entire input data string into an array of individual lines.
	const    lines    =    input    data . split ( '\n' ) ;

	// The first line typically contains the count of numbers (N).
	// We parse it as an integer. The '- 0' is a common JavaScript idiom
	// to ensure explicit numeric conversion.
	const    N    =    lines [ 0 ]    -    0 ;

	// The second line contains the actual sequence of numbers.
	// It's split by spaces, and then each part is converted to a Number.
	const    A    =    lines [ 1 ] . split ( ' ' ) . map ( Number ) ;


	// Initialize a counter to keep track of "turns" or changes in trend.
	let    count    =    0 ;

	// Initialize a variable to store the current direction of the sequence:
	//   0: No established direction yet, or direction has been reset (after a turn).
	//   1: The sequence is currently increasing.
	//  -1: The sequence is currently decreasing.
	let    dir    =    0 ;


	// Iterate through the array 'A', starting from the second element (index 1).
	// This allows comparison of each element with its immediate predecessor.
	for    (    let    i    =    1 ;    i    <    N ;    i++    )    {

		// Check if the current element is greater than the previous one.
		// This indicates an increasing trend.
		if    (    A [ i ]    -    A [ i - 1 ]    >    0    )    {
			// If the sequence was previously decreasing (dir === -1),
			// and now it's increasing, a "turn" has occurred.
			if    (    dir    ===    -1    )    {
				// Reset the direction to neutral, signaling a turn completion.
				dir    =    0 ;
				// Increment the turn counter.
				count++ ;
			}    else    {
				// If not a turn, simply update the direction to increasing.
				dir    =    1 ;
			}
		}
		// Otherwise, check if the current element is less than the previous one.
		// This indicates a decreasing trend.
		else    if    (    A [ i ]    -    A [ i - 1 ]    <    0    )    {
			// If the sequence was previously increasing (dir === 1),
			// and now it's decreasing, a "turn" has occurred.
			if    (    dir    ===    1    )    {
				// Reset the direction to neutral, signaling a turn completion.
				dir    =    0 ;
				// Increment the turn counter.
				count++ ;
			}    else    {
				// If not a turn, simply update the direction to decreasing.
				dir    =    -1 ;
			}
		}
		// If A[i] - A[i-1] is 0, it means A[i] === A[i-1].
		// In this case, the direction ('dir') remains as it was,
		// or stays at 0 if no direction was established yet.
		// No explicit 'else' block is needed for equality as it doesn't change 'dir' or 'count'.
	}


	// Finally, print the result to the console.
	// The problem usually asks for the number of "segments" or "groups",
	// which is always one more than the number of turns detected.
	console . log (    count    +    1    ) ;

	// The IIFE ends here.
}    )    (    input    )    ; // The 'input' variable (containing the raw stdin content) is passed to the IIFE.