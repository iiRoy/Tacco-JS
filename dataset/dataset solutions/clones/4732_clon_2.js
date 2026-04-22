// This module handles processing a single line of numeric input.
function processEntry(   inputLine   ) {
	/*
	 * First, the incoming inputLine string is fragmented by spaces.
	 * Each fragment is then converted into an integer.
	 * The resulting array of numbers is assigned back to 'inputLine',
	 * transforming its effective data type for subsequent operations.
	 * The comparison then relies on JavaScript's implicit type coercion
	 * of the array to a primitive value for numerical comparison.
	 */
	( 1200 <= ( inputLine = convertStringsToIntegers( inputLine .split( " " ) ) ) )
		? console .log( "ARC" )  // Output for the 'Advanced' category.
		: console .log( "ABC" ) ; // Output for the 'Basic' category.
}


// This auxiliary function transforms an array of strings into an array of integers.
function convertStringsToIntegers(   stringFragments   ) {
	// The 'map' method is utilized to apply a conversion function to each element.
	// 'parseInt' with radix 10 ensures proper decimal integer conversion.
	return stringFragments .map(  function( currentFragment )  {
		return parseInt( currentFragment,  10  );
	} );
}


// Entry point of the script.
// It asynchronously reads data from standard input, then initiates the main processing.
processEntry( require( "fs" ) .readFileSync( "/dev/stdin",  "utf8" ) );