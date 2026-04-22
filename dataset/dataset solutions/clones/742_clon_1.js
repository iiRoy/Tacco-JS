/*
 * This JavaScript program processes textual input from standard input.
 * It's structured to handle multiple test cases, each defined by a leading number.
 * The core logic involves parsing dependency-like relationships and expanding a set
 * of initial items based on these relationships until no further expansion is possible.
 *
 * The input is expected to be line-separated, with specific formatting
 * for defining initial sets and subsequent dependency mappings.
 */


var input = require('fs') . readFileSync ( '/dev/stdin' , 'utf8' ) ; // Reads the entire content of /dev/stdin as a UTF-8 string.

var Arr  = ( input . trim ( ) ) . split ( "\n" ) ; // Trims any leading/trailing whitespace from the input and splits it into an array of lines.


while ( true ) /* This is the main loop that processes each test case provided in the input. */
{
	// Extracts the first element from the `Arr` array, converts it to a number (using `-0`),
	// and assigns it to `n`. This `n` typically indicates the number of subsequent lines
	// or items related to the current test case.
	var n = Arr . shift ( ) - 0 ;


	// Checks if `n` is 0. A value of 0 often serves as a sentinel to indicate
	// the end of input or a specific termination condition for the processing loop.
	if ( n == 0 )
	{
		break ; // If `n` is 0, exit the `while (true)` loop, terminating the program's primary processing.
	}


	/*
	 * Processes the next line from the input array (`Arr`).
	 * This line is expected to define an initial set of items.
	 * It's split by a colon (':'), and then further processed.
	 */
	var first = Arr . shift ( ) . split ( ":" ) ;

	// This line further refines the `first` array. It takes the second part of the
	// colon-split string (`first[1]`), removes the last character (likely a closing bracket),
	// and then splits the resulting string by commas (',') to get the individual items.
	first = first [ 1 ] . slice ( 0 , -1 ) . split ( "," ) ;


	var obj = { } ; /* Initializes an empty object `obj`. This object will be used to store
	                 * dependency mappings, where keys are items that have dependencies,
	                 * and values are arrays of their dependent items. */


	// This loop iterates `n - 1` times to read and process subsequent lines
	// that define additional dependency rules.
	for ( var i = 0 ; i < n - 1 ; i ++ )
	{
		// Reads the next line from `Arr` and splits it by a colon.
		// This line is expected to represent a dependency rule (e.g., "A:B,C").
		var arr = Arr . shift ( ) . split ( ":" ) ;

		// Maps the first part of the split line (`arr[0]`, the item with dependencies)
		// to an array of its dependent items. Similar to the `first` processing,
		// `arr[1]` is sliced to remove the last character and then split by commas.
		obj [ arr [ 0 ] ] = arr [ 1 ] . slice ( 0 , -1 ) . split ( "," ) ;
	}


	var L = 0 ; /* Initializes a variable `L` to 0. This variable will be used to track
	             * the length of the `first` array in successive iterations of the expansion loop,
	             * helping to determine if any new items were added. */


	// This `while (true)` loop continuously expands the `first` array by resolving dependencies
	// until no new items are added in a full iteration.
	while ( true )
	{
		// Checks if the current length of `first` is the same as `L` (its length from the start
		// of the previous iteration). If they are equal, it means no new items were pushed
		// into `first` during the last iteration, indicating that all possible dependencies
		// have been resolved or added.
		if ( L == first . length )
		{
			break ; // Exits the dependency expansion loop.
		}

		L = first . length ; // Updates `L` to the current length of `first` for the next iteration's comparison.

		/*
		 * Iterates over each element (`v`) and its index (`i`) in the `first` array.
		 * This `forEach` loop checks each item to see if it has further dependencies defined in `obj`.
		 */
		first . forEach ( function ( v , i )
		{
			// Checks if the current item `v` exists as a property (key) in the `obj` object.
			// `hasOwnProperty` is used to ensure it's a direct property, not from the prototype chain.
			if ( obj . hasOwnProperty ( v ) )
			{
				first [ i ] = "" ; // If `v` has dependencies, its current position in `first` is marked with an empty string.
				                   // This effectively "removes" it for later filtering, as it will be replaced by its dependencies.

				first . push ( obj [ v ] ) ; /* The array of dependencies associated with `v` (from `obj[v]`)
				                              * is appended to the `first` array. Note that `push` adds the array itself,
				                              * not its individual elements. This usually implies further flattening or processing. */
			}
		} ) ; // End of `forEach` callback function.
	}


	// Filters the `first` array to remove all elements that were marked as empty strings (`""`).
	// This cleans up the array, leaving only the final, expanded set of items.
	first = first . filter ( function ( v ) { return v != "" } ) ;


	var OBJ = { } ; /* Initializes another empty object `OBJ`. This object will be used to
	                 * collect the *unique* final items from the `first` array.
	                 * Using an object's properties ensures uniqueness, as duplicate keys are not allowed. */

	// Iterates over each item (`v`) in the now-filtered `first` array.
	first . forEach ( function ( v ) { OBJ [ v ] = true ; } ) ; /* For each item, a property with the item's value as the key
	                                                            * is added to `OBJ` and set to `true`. The actual value (`true`)
	                                                            * doesn't matter; the existence of the key is what's important for uniqueness. */


	// Finally, `console.log` outputs the number of unique items.
	// `Object.keys(OBJ)` returns an array of all keys (our unique items) in `OBJ`,
	// and `.length` gives the count of these unique items.
	console . log ( Object . keys ( OBJ ) . length ) ;
}

// End of the JavaScript program.