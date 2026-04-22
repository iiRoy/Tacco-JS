/*
 * This is an extensively modified Type I clone
 * of the original JavaScript code.
 *
 * Changes are limited to:
 * - Whitespace (indentation, spacing, blank lines)
 * - Comments (additions, modifications, removals)
 *
 * All identifiers, operators, and expressions remain completely unchanged.
 * The logical and structural identity of the code is preserved.
 */

// Define the primary function that orchestrates the data processing.
function main( input ) {

	// Split the entire input string into an array of individual lines,
	// using the newline character as the delimiter.
	var lines = input . split ( "\n" ) ;

	// Parse the first line of the input to determine the total number of data sets.
	var dataSetLength = parseInt ( lines [ 0 ] ) ;

	// Initialize a counter to keep track of the current line being processed.
	// Starts from 1 because line 0 contains the dataSetLength.
	var currentLine = 1 ;

	// Initialize an empty array to store sales totals for the current data set.
	var salesTotals = [ ] ;

	// Begin the main processing loop. This loop continues as long as there are
	// lines remaining to read and data sets still need to be processed.
	while ( currentLine < lines . length && dataSetLength > 0 ) {

		// Process the current line. It's expected to contain sales data.
		// First, split the line by spaces.
		// Then, map each resulting string segment to an integer.
		var sale = lines [ currentLine ]
			. split ( " " )
			. map ( function ( value ) {
				// Convert the string value to an integer.
				return parseInt ( value ) ;
			} ) ;

		// Check the length of the 'sale' array to differentiate between
		// a data set separator (length 1) and an actual sales record (length 3).
		if ( sale . length === 1 ) {

			// This block executes when a single number is encountered on a line,
			// signifying the end of a data set and a prompt to report results.

			// Filter and accumulate valid sales records from the current 'salesTotals'.
			// A sale is considered "valid" if its 'salesTotal' is 1,000,000 or more.
			var validSales = salesTotals . reduce ( function ( result , value ) {
				// Check if the current sales record meets the minimum total.
				if ( value . salesTotal >= 1000000 ) {
					// If it does, add its 'id' to the 'result' array.
					result . push ( value . id ) ;
				}
				// Return the updated array of valid sale IDs.
				return result ;
			} , [ ] ) ; // Start the reduction with an empty array.

			// After processing all sales for the data set, check if any valid sales were found.
			if ( validSales . length <= 0 ) {
				// If no sales met the criteria, output "NA".
				console . log ( "NA" ) ;
			} else {
				// If valid sales exist, iterate through them and print each ID.
				for ( var i = 0 ; i < validSales . length ; i ++ ) {
					// Ensure the ID is a valid number before logging it to the console.
					if ( ! isNaN ( validSales [ i ] ) ) console . log ( validSales [ i ] ) ;
				}
			}

			// Clear the 'salesTotals' array, preparing it for the next data set.
			salesTotals = [ ] ;

		} else { // This 'else' block handles lines that represent actual sales transactions.

			// Initialize an index to search for an existing sales record.
			var saleIndex = 0 ;

			// Loop through the 'salesTotals' array to find a record with a matching ID.
			for ( ; saleIndex < salesTotals . length ; saleIndex ++ ) {
				// If a matching 'id' is found, break out of the loop.
				if ( salesTotals [ saleIndex ] . id === sale [ 0 ] ) break ;
			}

			// Determine the current total for the identified sale.
			// If no existing record was found (saleIndex equals salesTotals.length),
			// default to a new object with 'salesTotal' initialized to 0.
			var currentSalesTotal = ( salesTotals [ saleIndex ] || { salesTotal : 0 } ) . salesTotal ;

			// Update the sales record at 'saleIndex' or create a new one if it didn't exist.
			salesTotals [ saleIndex ] = {
				id : sale [ 0 ] , // The unique identifier for the product/entity.
				salesTotal : currentSalesTotal + ( sale [ 1 ] * sale [ 2 ] ) // Calculate the new total.
				                                                          // sale[1] is quantity, sale[2] is price.
			} ;

		}

		// Increment the line counter to move to the next line in the input.
		currentLine ++ ;

	} // End of the main 'while' loop.

} // End of the 'main' function definition.


// Immediately invoke the 'main' function with input read from standard input.
// 'require('fs').readFileSync('/dev/stdin','utf8')' reads the entire content
// of standard input as a UTF-8 encoded string.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;