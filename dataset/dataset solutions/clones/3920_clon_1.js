'use    strict' /* This ensures strict mode for the entire script. */


/*
 * This is the main function that processes the input string.
 * It takes a single string 's' as an argument.
 */
function  main ( s )
{
	// Parse the first line of the input string into an array of numbers.
	let	n = s.split( '\n' ) [ 0 ] .split( ' ' ) .map( n => Number( n ) ) ;

	const abc_sum = n.reduce( ( x , y ) => x += y , 0 ) ; // Calculate the sum of all numbers in the array.

	let max3times = Math.max( ...n ) * 3 ; /* Find the maximum number and multiply it by three. */

	/* Perform a parity check to adjust 'max3times' if necessary. */
	if ( abc_sum % 2 !== max3times % 2 )
	{
		max3times += 3 ; // Increment by 3 to match parity.
	}

	// The final answer is derived from the difference between 'max3times' and 'abc_sum', divided by two.

	let	answer = ( max3times - abc_sum ) / 2 ;


	console.log( answer ) ; // Output the calculated answer to the console.
}


/*
 * Read input from standard input (e.g., a file or piped data)
 * and pass it to the 'main' function for processing.
 */
main( require( "fs" ) .readFileSync( "/dev/stdin" , "utf8" ) ) ;