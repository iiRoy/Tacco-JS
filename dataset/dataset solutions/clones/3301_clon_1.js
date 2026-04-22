/*
 * This function serves as the primary entry point for processing input
 * related to a dynamic programming problem, likely a variation of the
 * knapsack problem. It reads input, calculates an optimal value,
 * and then outputs that value.
 */
function main ( input )
{
	// The input string is first split into individual lines
	// to facilitate parsing of different data segments.
	const lines = input . split ( '\n' ) ;

	/*
	 * The first line of the input typically contains two key parameters:
	 * N (the total number of items) and W (the maximum capacity).
	 * This line is extracted, split by spaces, and each part is converted to an integer.
	 */
	const NW = lines . shift ( ) . split ( ' ' ) . map ( x => parseInt ( x ) ) ;

	const N = NW [ 0 ] ; // Assigning the first parsed value to N.
	const W = NW [ 1 ] ; // Assigning the second parsed value to W.


	// The remaining lines represent the items, each with a weight and a value.
	// These lines are mapped to an array of arrays, where each inner array
	// contains the integer weight and value for an item.
	const items = lines . map ( line => line . split ( ' ' ) . map ( x => parseInt ( x ) ) ) ;


	// The following commented lines are for debugging purposes.
	// They would print the parsed N, W, and the full items array to the console.
	// console . log ( N ) ;
	// console . log ( W ) ;
	// console . log ( items ) ;


	// Initialize the dynamic programming table (dp array).
	// This table will store the maximum value obtainable for various capacities
	// and subsets of items. It's declared without 'var', 'let', or 'const',
	// making it a global variable implicitly.
	dp = [ ] ;

	// Populate the dp table. It's dimensioned to W+1 rows (for capacities 0 to W)
	// and N+1 columns (for considering 0 to N items). Each cell is initialized to 0.
	for ( var i = 0 ; i < W + 1 ; i ++ )
	{
		dp . push ( Array ( N + 1 ) . fill ( 0 ) ) ;
	}


	// Initialize a variable to keep track of the maximum result found during computation.
	var result = 0 ;

	// Begin the main dynamic programming loop.
	// The outer loop iterates through each item from the first to the N-th item.
	for ( var i = 0 ; i < N ; i ++ )
	{
		// The inner loop iterates through all possible knapsack capacities,
		// from 0 up to the maximum capacity W.
		for ( var w = 0 ; w <= W ; w ++ )
		{

			var weight = items [ i ] [ 0 ] ; // Get the weight of the current item.
			var value = items [ i ] [ 1 ] ; // Get the value of the current item.

			// Another debugging line, commented out.
			// console . log ( [ weight , value , w , i ] ) ;

			// Check if the current item's weight is less than or equal to the current capacity 'w'.
			if ( weight <= w )
			{
				// If the item can fit, we decide whether to include it or not.
				// We take the maximum of:
				// 1. Not including the current item (dp[w][i+1] value before considering this item).
				// 2. Including the current item (value of current item + max value from remaining capacity 'w-weight' using previous items 'i').
				dp [ w ] [ i + 1 ] = Math . max ( dp [ w ] [ i + 1 ] , dp [ w - weight ] [ i ] + value ) ;
			}
			else
			{
				// If the current item's weight is greater than 'w', it cannot be included.
				// So, the maximum value for this capacity 'w' remains the same as
				// it was without considering the current item.
				dp [ w ] [ i + 1 ] = dp [ w ] [ i ] ;
			}

			// After updating dp[w][i+1], compare it with the current maximum 'result'.
			// If dp[w][i+1] is greater, update 'result'.
			if ( dp [ w ] [ i + 1 ] > result ) { result = dp [ w ] [ i + 1 ] ; }

		} // End of the inner loop (capacity 'w').
	} // End of the outer loop (item 'i').

	// This commented line shows an alternative way to find the maximum value
	// across the entire dp table, which might be relevant for some problem variations.
	// const result = Math.max ( ... dp . map ( arr => Math . max ( ... arr ) ) ) ;

	// Finally, print the calculated maximum result to standard output.
	console . log ( result ) ;

} // End of the 'main' function.


// This is the entry point for executing the script.
// It reads the entire content of standard input synchronously,
// using 'utf8' encoding, and passes it as an argument to the 'main' function.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;