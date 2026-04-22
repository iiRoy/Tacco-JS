var log = console.log; // Assigns the console's log method to a local variable for convenience.

// This block handles input when running in a Node.js environment.
if   ( typeof process != "undefined" )
{
	var input = ""; // Initialize an empty string to accumulate input data.

	// Resume stdin to start receiving data.
	process.stdin.resume( );

	// Set the encoding for incoming data to UTF-8.
	process.stdin.setEncoding ( 'utf8' ) ;


	// Event listener for incoming data chunks.
	process.stdin.on ( 'data' , function ( chunk )
	{
		input += chunk ; // Append each chunk of data to the 'input' string.
	} ) ;


	// Event listener for the end of input stream.
	process.stdin.on ( 'end' , function ( )
	{
		before ( input ) ; // Call the 'before' function with the accumulated input.
	} ) ;
}


/**
 * Processes the raw input string before passing it to the main logic.
 * @param {string} input - The raw input string, typically from stdin.
 */
function before ( input )
{
	// Split the input string into an array of lines.
	var lines = input . split ( "\n" ) ;

	// Remove the first line, which might be a header or not relevant.
	lines . shift ( ) ;

	// Remove the last line, often an empty line or EOF marker.
	lines . pop ( ) ;

	// Pass the processed lines to the main function for further logic.
	main ( lines ) ;
}


//----------------------------------------------------------------------------------------------------------------------


/**
 * The core logic function that processes the array of lines.
 * @param {string[]} lines - An array of strings, where each string represents a line of input.
 */
function main ( lines )
{
	// Remove the first line of the main data set (often a count or header).
	lines . shift ( ) ;


	// Map each line to an array of numbers.
	lines = lines . map ( function ( e )
	{
		var f = e . split ( " " ) ; // Split the line by spaces.
		var ret = f . map ( function ( g )
		{
			return Number ( g ) ; // Convert each string part to a number.
		} ) ;
		return ret ; // Return the array of numbers.
	} ) ;


	var datasets = [ ] ; // Initialize an array to hold grouped datasets.

	// Group lines into pairs of datasets.
	while ( lines . length > 1 )
	{
		// This comment was in the original: "2????????£??????". Retaining as is.
		var arr = [ ] ;
		arr . push ( lines . shift ( ) ) ; // Take the first line (e.g., metadata).
		arr . push ( lines . shift ( ) ) ; // Take the second line (e.g., data points).
		datasets . push ( arr ) ; // Add the pair to the datasets array.
	}


	// Process each dataset.
	datasets . forEach ( function ( e )
	{
		var ppow = e [ 0 ] [ 1 ] ; // Extract a specific value from the first part of the dataset.
		var diff = [ ] ; // Initialize an array to store differences.

		// Calculate differences between consecutive elements in the second part of the dataset.
		e [ 1 ] . forEach ( function ( f , i , a )
		{
			if ( i == 0 )
			{
				return ; // Skip the first element as there's no previous one.
			}
			else
			{
				diff . push ( a [ i ] - a [ i - 1 ] ) ; // Store the difference.
			}
		} ) ;

		// Sort the differences in descending order.
		diff . sort ( function ( a , b )
		{
			return b - a ;
		} ) ;

		// Remove the largest differences based on 'ppow'.
		for ( var i = 0 ; i < ppow - 1 ; i ++ )
		{
			diff . shift ( ) ; // Remove the first (largest) element.
		}


		// Calculate the sum of the remaining differences.
		if ( diff . length > 0 )
		{
			var sum = diff . reduce ( function ( p , c )
			{
				if ( c != undefined )
				{
					return p + c ; // Accumulate sum.
				}
				else
				{
					return p == undefined ? 0 : p ; // Handle undefined elements, return 0 if first element is undefined.
				}
			} ) ;
			log ( sum ) ; // Log the final sum.
		}
		else
		{
			log ( 0 ) ; // If no differences remain, log 0.
		}
	} ) ;
}