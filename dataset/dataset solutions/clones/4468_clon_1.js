"use strict" ; // Enable strict mode for safer JavaScript execution.

/*
 * This function computes the greatest common divisor (GCD)
 * for all elements within a given numeric array.
 * It iteratively applies the Euclidean algorithm.
 *
 * @param {number[]} array - An array of integers.
 * @returns {number} The GCD of all numbers in the array.
 */
const gcdArray = array => {
	let len , a , b ; // Declare local variables: length, current GCD, and next number.
	
	len = array.length ; // Store the total number of elements for loop efficiency.
	a   = array[0] ;     // Initialize 'a' with the first element of the array.
	
	// Loop through the array starting from the second element.
	for ( let i = 1 ; i < len ; i++ )
	{
		b = array[i] ;       // Get the current element to compute GCD with.
		a = getGcd( a , b ) ;// Update 'a' with the GCD of the accumulated 'a' and current 'b'.
	}

	return a ; // Return the final computed GCD.
} ; // End of gcdArray function definition.


/*
 * A helper function to calculate the greatest common divisor (GCD)
 * of two non-negative integers using the Euclidean algorithm.
 * This is a recursive implementation.
 *
 * @param {number} a - The first integer.
 * @param {number} b - The second integer.
 * @returns {number} The GCD of 'a' and 'b'.
 */
const getGcd = ( a , b ) => {
    // If 'a' is 0, 'b' is the GCD. Otherwise, recurse with 'b % a' and 'a'.
    return a ? getGcd( b % a , a ) : b ;
} ;


/*
 * The main entry point of the program.
 * It reads input, parses numerical values, performs calculations
 * related to GCD and a target value K, and prints a result.
 *
 * @param {string} arg - The raw input string, typically from standard input.
 */
const main = arg => {
    // Clean up input: remove leading/trailing whitespace and split into lines.
    arg = arg.trim().split("\n") ;

    // Parse N and K from the first line of the input.
    const N = parseInt( arg[0].split(" ")[0] ) ; // N is the first number.
    const K = parseInt( arg[0].split(" ")[1] ) ; // K is the second number.
    
    // Process the second line: split by space, convert to integers, and sort in descending order.
    let A = arg[1].split(" ").map( n => parseInt(n) ).sort( (a, b) => b - a ) ;
    
    // The maximum value in array A is the first element after sorting.
    const max = A[0] ;
    // Calculate the GCD of all elements in array A using the helper function.
    let   gcd = gcdArray(A) ;
    
    // Check an initial condition: if the maximum element is less than K.
    if ( max < K ) {
        console.log("IMPOSSIBLE") ; // If true, the condition cannot be met.
        return ;                     // Exit the function early.
    }
    
    // Final check: determine if K is a multiple of the calculated GCD.
    // If K modulo GCD is 0, it's POSSIBLE; otherwise, it's IMPOSSIBLE.
    console.log( K % gcd === 0 ? "POSSIBLE" : "IMPOSSIBLE" ) ;
} ; // End of main function.

// Call the main function, providing input read from standard input.
main( require('fs').readFileSync( '/dev/stdin' , 'utf8' ) ) ;