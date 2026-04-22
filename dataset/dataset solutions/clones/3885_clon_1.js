"use strict" ; /* Enable strict mode for better error handling. */


const main =   arg => {
	//  First, process the input string to extract numbers.
	let    Nums = arg . split ( "\n" ) [0] . split ( " " ) ;
	let aPrice   = Nums [0] * 1 ;
	let bPrice   = Nums [1] * 1 ;
	let abPrice  = Nums [2] * 1 ;
	let aNum     = Nums [3] * 1 ;
	let bNum     = Nums [4] * 1 ;


	let ans = 0 ; // Initialize the answer variable.

	let ave = ( aPrice + bPrice ) / 2 ; // Calculate the average price of individual items.
	let is_half_better = ( ave > abPrice ) ; // Determine if buying a pair is cheaper than buying two individual items.

	/* Determine the smaller quantity among the two items. */
	let smallerNum = aNum > bNum ? bNum : aNum ;

	// Calculate the difference in quantities.
	let oddNum = aNum > bNum ? aNum - bNum : bNum - aNum ;
	// Get the price of the item with the larger quantity.
	let biggerNumPrice = aNum > bNum ? aPrice : bPrice ;

	/*
	 * Calculate the remaining price for the odd number of items.
	 * This checks if it's cheaper to buy the remaining items as pairs (if 'abPrice' is better)
	 * or as individual items.
	 */
	let remPrice = ( biggerNumPrice / 2 ) > abPrice ? abPrice * oddNum * 2 : oddNum * biggerNumPrice ;


	// Main conditional logic to compute the final answer.
	if ( is_half_better ) {
		ans = abPrice * smallerNum * 2 + remPrice ; // If pairs are cheaper, use them for the common quantity.
	} else {
		ans = aPrice * aNum + bPrice * bNum ; // Otherwise, buy all items individually.
	}


	console . log ( ans ) ; // Output the final calculated answer.

} ; // End of the main function definition.


// Read input from stdin and pass it to the main function.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin', 'utf8' ) ) ;