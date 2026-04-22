/*
 * This is a Type I clone of the original JavaScript code.
 * All identifiers, operators, and expressions are kept exactly the same.
 * Only whitespace and comments have been modified extensively.
 */


'use strict' // Enforces strict mode for cleaner code.


/**
 * Main function to process input and calculate the result.
 * @param {string} input - The raw input string from stdin.
 */
function Main ( input ) {
	// Parse the input string into an array of lines.
	const   inputs   =   input . split ( '\n' ) ;


	/*
	 * The second line of input contains space-separated bar lengths.
	 * We split them, sort in descending order, and store them.
	 */
	const   bars   =   inputs [ 1 ] . split ( ' ' ) . sort ( ) . reverse ( ) ;


	// This array will store the lengths of sides found for a rectangle.
	const   sides   =   [ ] ;


	// Initialize the result, which will be the area of the largest rectangle.
	let   result   =   0 ;


	// A flag to track if a potential side has been found for the current pair.
	let   flag   =   false ;


	// Loop through the sorted bar lengths to find potential rectangle sides.
	for   (   let   i   =   0 ;   i   <   bars . length ;   i ++   )   {

		// Current bar length.
		const   bar1   =   bars [ i ] ;
		// Next three bar lengths, or null if they don't exist.
		const   bar2   =   bars [ i   +   1 ]   ?   bars [ i   +   1 ]   :   null ;
		const   bar3   =   bars [ i   +   2 ]   ?   bars [ i   +   2 ]   :   null ;
		const   bar4   =   bars [ i   +   3 ]   ?   bars [ i   +   3 ]   :   null ;


		// Check for four identical bars, forming a square.
		if   (   bar1   ===   bar2   &&   bar1   ===   bar3   &&   bar1   ===   bar4   )   {
			// If found, this is the largest possible square, calculate area and break.
			result   =   parseInt ( bar1   *   bar4 ,   10 ) ;
			break ; // No need to check further.
		}


		// Check for two identical bars (a potential side of a rectangle).
		if   (   bar1   ===   bar2   &&   ! flag   )   {
			// Add the bar length to 'sides' array.
			sides . push ( bar1 ) ;
			// Set flag to true to indicate a side has been secured.
			flag   =   true ;
		}   else   {
			// Reset flag if no pair was found or if a side was already secured in the previous iteration.
			flag   =   false ;
		}


		// If two sides have been found, calculate the area and break.
		if   (   sides . length   ===   2   )   {
			result   =   parseInt ( sides [ 0 ]   *   sides [ 1 ] ,   10 ) ;
			break ; // We found the two largest sides, so this is the max area.
		}
	}


	// Output the calculated maximum area.
	console . log ( result ) ;
}


// Read input from stdin and pass it to the Main function.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" ,   "utf8" ) ) ;