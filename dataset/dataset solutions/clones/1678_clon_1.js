/*
 * This is the main program entry point.
 * It processes the input and performs calculations.
 */
function     Main (  input )
{

	input   =   input . split ( "\n" ) ; /* Split the input string by newline characters */
	// Retrieve N, the number of iterations
	const   N   =   parseInt ( input [ 0 ] ,   10 ) ;
	const   X   =   input [ 1 ] ; // Get the binary string X
	console . log ( X ) ; /* Output the original binary string X */

	for ( let   i   =   0 ;   i   <   N ;   i ++ )   {
		/*
		 * Generate a new binary string x_str
		 * by flipping the bit at position i.
		 */
		const   x_str   =   X . slice ( 0 ,   i ) . concat ( ( X [ i ]   ===   "1"   ?   "0"   :   "1" ) ,   X . slice ( i   +   1 ) ) ;
		console . log ( f ( Number . parseInt ( x_str ,   2 ) ,   0 ) ) ; // Call function f and log its result
	}

} // End of Main function

/*
 * Execute the Main function with input from stdin.
 */
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" ,   "utf8" ) ) ;


/*
 * Calculates the population count (number of set bits) of a given integer.
 * @param {number} n - The input integer.
 * @returns {number} The count of set bits.
 */
function     popcount (  n )
{
	return   parseInt ( n . toString ( 2 ) ) . toString ( ) . split ( "" ) . filter ( b   =>   b   ==   1 ) . length ; // Convert to binary, then count '1's
} // End of popcount function


/*
 * Recursive function to calculate a value based on popcount.
 * @param {number} n - The current number.
 * @param {number} count - The accumulated count.
 * @returns {number} The final calculated value.
 */
function     f (  n ,   count )
{
	if (  n   ===   0  )   { // Base case: if n is 0, return current count
		return   count ;
	}

	const   p   =   popcount ( n ) ; // Calculate population count of n

	if (  p   ===   0  )   { // Edge case: if popcount is 0, return current count
		return   count ;
	}

	return   f ( n   %   p ,   count   +   1 ) ; // Recursive call with n modulo p and incremented count
} // End of f function