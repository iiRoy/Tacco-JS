/*
 * This file contains a JavaScript program that calculates a specific mathematical
 * function using memoization to optimize performance.
 *
 * The program is designed to solve a problem involving BigInt arithmetic
 * and utilizes a recursive approach with dynamic programming principles.
 */

/*
 * The `keyStr` function generates a unique string key
 * for a given row (r) and column (c) pair.
 * This key is crucial for the memoization map (`calcMap`)
 * to store and retrieve previously computed results efficiently.
 */
const keyStr = ( r, c ) => `r${r}c${c}`;


// `calcMap` is a global Map object used for memoization.
// It stores the results of the `calc` function calls,
// keyed by the `keyStr` generated from the `c` and `d` parameters.
// This prevents redundant computations, especially in recursive calls.
const calcMap = new Map();


/*
 * The `calc` function is the core of the program,
 * performing a recursive calculation based on four BigInt parameters:
 * `a`, `b`, `c`, and `d`.
 *
 * It employs memoization to significantly speed up computation
 * for overlapping subproblems.
 *
 * @param {BigInt} a - The first input parameter.
 * @param {BigInt} b - The second input parameter.
 * @param {BigInt} c - The third input parameter, often decremented in recursion.
 * @param {BigInt} d - The fourth input parameter, often decremented in recursion.
 * @returns {BigInt} The calculated result for the given inputs.
 */
const calc = ( a, b, c, d ) => {

	// Generate the unique key for the current state (c, d).
	const key = keyStr( c, d );

	// Check if the result for this state has already been computed
	// and stored in the `calcMap`.
	if ( calcMap.has( key ) )
	{
		// If found, return the memoized result directly.
		return calcMap.get( key );
	}

	let ans; // Declare a variable to hold the computed answer.

	// --- Base Cases for the Recursion ---

	// First base case: if `a` is equal to `c`.
	if ( a === c )
	{
		ans = a ** ( d - b ); // Compute `ans` using the first formula.
	}
	// Second base case: if `b` is equal to `d`.
	else if ( b === d )
	{
		ans = b ** ( c - a ); // Compute `ans` using the second formula.
	}
	// --- Recursive Step ---
	// If neither base case is met, proceed with the recursive formula.
	else
	{
		// The main recursive relation, involving three sub-problems.
		// Each sub-problem's result is multiplied by specific parameters
		// and then combined according to the problem's definition.
		ans = calc( a, b, c - 1n, d ) * d +
		      calc( a, b, c, d - 1n ) * c -
		      calc( a, b, c - 1n, d - 1n ) * ( c - 1n ) * ( d - 1n );
	}

	// Store the newly computed result in the `calcMap`
	// before returning it, so it can be reused later.
	calcMap.set( keyStr( c, d ), ans );

	// Return the final computed answer for the current state.
	return ans;
};


/*
 * The `main` function serves as the entry point of the program.
 * It handles input parsing, calls the `calc` function,
 * and outputs the final result.
 *
 * @param {string} input - The raw string input read from standard input.
 */
const main = ( input ) => {

	// Split the entire input string into an array of lines.
	const inputs = input.split( "\n" );

	// The first line of input (`inputs[0]`) contains four space-separated numbers.
	// These are parsed and converted to `BigInt` objects
	// to support large number arithmetic.
	const [ a, b, c, d ] = inputs[ 0 ].split( " " ).map( num => BigInt( num ) );

	// Call the `calc` function with the parsed BigInt inputs.
	// The result is then taken modulo `998244353n` (a common prime modulus).
	// Finally, the BigInt result is converted to a standard JavaScript `Number`
	// for printing to the console, assuming it fits within number limits after modulo.
	console.log( Number( calc( a, b, c, d ) % 998244353n ) );
};


// This line executes the `main` function.
// It reads the entire content of `/dev/stdin` (standard input) as a UTF-8 string
// using Node.js's `fs` module, and passes it to `main`.
main( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );