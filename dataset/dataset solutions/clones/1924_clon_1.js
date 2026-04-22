/*
 * This is a JavaScript code file.
 * It defines a Scanner class and a Main function.
 * The Scanner class is used for parsing input strings.
 * The Main function contains the core logic of the program.
 */

// Define the Scanner constructor function
function   Scanner( input ) {
	
	// Store a reference to the current instance
	var self = this;
	
	/*
	 * Initialize itemNo to 0.
	 * This variable keeps track of the current item index in the parsed string array.
	 */
	self.itemNo = 0;
	
	// Store the original input string
	self.orgStr = input;
	
	/*
	 * Process the input string to split it into an array of strings.
	 * This is an immediately invoked function expression (IIFE).
	 */
	self.splitedStrs = ( function( target ) {
		
		// Initialize an empty array to store the results.
		var result = [];
		
		// Replace multiple newlines, spaces, and tabs with a single space.
		var target = target.replace( /[\n \t]+/g, " " );
		
		// Split the modified target string by spaces.
		var strs = target.split( " " );
		
		// Iterate through the split strings and push them into the result array.
		for ( var i = 0, len = strs.length; i < len; i++ ) {
			
			result.push( strs[i] );
			
		}
		
		// Return the array of split strings.
		return result;
		
	}( input ) ); // Pass the original input to the IIFE.

	// Define a method to get the next string from the parsed input.
	self.next = function() {
		
		var result = self.splitedStrs[ self.itemNo ]; // Get the string at the current index.
		
		self.itemNo++; // Increment the item number for the next call.
		
		// Return the result if it's not null, otherwise return null.
		return ( result != null ) ? result : null;
		
	}; // End of next() method.

	// Define a method to get the next integer from the parsed input.
	self.nextInt = function() {
		
		var result = self.splitedStrs[ self.itemNo ]; // Fetch the string.
		self.itemNo++; // Advance the item pointer.
		
		// Parse the string to an integer if it exists, otherwise return null.
		return ( result != null ) ? parseInt( result ) : null;
		
	}; // End of nextInt() method.

	// Define a method to get the next floating-point number (BigDecimal equivalent) from the parsed input.
	self.nextBigDecimal = function() {
		
		var result = self.splitedStrs[ self.itemNo ]; // Retrieve the string.
		
		self.itemNo++; // Move to the next item.
		
		// Parse the string to a float if available, else null.
		return ( result != null ) ? parseFloat( result ) : null;
		
	}; // End of nextBigDecimal() method.
	
	/*
	 * Define a method to get the next byte (Int8Array) from the parsed input.
	 * Note: This implementation might not be standard for "nextByte" in competitive programming contexts,
	 * as it creates an Int8Array from the string directly.
	 */
	self.nextByte = function() {
		
		var result = self.splitedStrs[ self.itemNo ];
		
		self.itemNo++;
		
		return ( result != null ) ? new Int8Array( result ) : null;
		
	}; // End of nextByte() method.

} // End of Scanner function.

// Main function where the primary program logic resides.
function     Main( sc ) {

	// Read three integers: N, M, and Q using the Scanner.
	var N = sc.nextInt();
	var M = sc.nextInt();
	var Q = sc.nextInt();
	
	// Initialize an array to store query details (a, b, c, d).
	var abcds = [];
	
	// Initialize variables to track points.
	var point = 0; // Stores the maximum points found so far.
	var wkPoint = 0; // Stores points for the current combination.
	
	// Loop Q times to read the query details.
	for ( var i = 0; i < Q; i++ ) {
		
		// Create an object for each query (abcd).
		var abcd = {
				a:sc.nextInt(),
				b:sc.nextInt(),
				c:sc.nextInt(),
				d:sc.nextInt(),
		};
		// Add the abcd object to the abcds array.
		abcds.push( abcd );
		
	} // End of loop for reading queries.
	
	// Initialize an array of size N, filled with 1s.
	// This array will represent the sequence being generated.
	var array = [];
	for ( var i = 0; i < N; i++ ) {
		
		array.push( 1 );
		
	} // End of array initialization loop.
	
	// Flag to indicate when to stop the main generation loop.
	var doEnd = false;
	
	/*
	 * This loop generates all possible sequences of length N,
	 * where each element is between 1 and M (inclusive),
	 * and the sequence is non-decreasing.
	 * The loop runs Math.pow(M, N) times in the worst case,
	 * but the `doEnd` flag handles early termination for non-decreasing constraint.
	 */
	for ( var a = 0; a < Math.pow( M, N ); a++ ) {
		
		// Increment the last element of the array.
		array[ N - 1 ]++;
		
		// Propagate carries from right to left to maintain the non-decreasing property.
		for ( var b = N - 1; b >= 0; b-- ) {
			
			// If the current element exceeds M, a carry is needed.
			if ( array[ b ] > M ) {
				
				// If it's the first element and it exceeds M, all combinations have been generated.
				if ( b == 0 ) {
					
					doEnd = true; // Set the flag to terminate the outer loop.
					break; // Exit the inner loop.
					
				}
				
				// Increment the previous element.
				array[ b - 1 ]++;
				
				// The new minimum value for subsequent elements will be the value of the previous element.
				var newMin = array[ b - 1 ];
				
				// Reset all elements from the current position 'b' to the end of the array to 'newMin'.
				// This ensures the non-decreasing property (array[c] >= array[c-1]).
				for ( var c = b; c < array.length; c++ ) {
					
					array[ c ] = newMin;
					
				} // End of inner loop for resetting elements.
				
			} // End of if (array[b] > M) block.
			
		} // End of carry propagation loop.
		
		// If doEnd is true, break out of the main generation loop.
		if ( doEnd ) break;
		
		// Reset working points for the current sequence.
		wkPoint = 0;
		
		// Calculate points for the current generated sequence against all queries.
		for ( var i = 0; i < abcds.length; i++ ) {
			
			// Check the condition: abcds[i].c == array[abcds[i].b - 1] - array[abcds[i].a - 1]
			// Note: Array indices are 0-based, so a-1 and b-1 are used.
			if ( abcds[ i ].c == array[ abcds[ i ].b - 1 ] - array[ abcds[ i ].a - 1 ] ) {
				
				// If the condition is met, add the points (d value) to wkPoint.
				wkPoint += abcds[ i ].d;
				
			} // End of if condition for query.
			
		} // End of loop through queries.
		
		// Update the maximum points found so far.
		if ( point < wkPoint ) point = wkPoint;
		
	} // End of main sequence generation loop.
	
	// Output the final maximum point to the console.
	console.log( point );
	
} // End of Main function.

// Execute the Main function with a new Scanner instance.
// The Scanner reads input from standard input (stdin).
Main( new Scanner( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) ) );

// Example usage of Scanner for testing purposes (commented out):
// Main( new Scanner( "33" ) );

/*
 * Additional Scanner methods and their typical uses (commented out):
 * var str1 = sc.next();          // Reads the next string token.
 * var int1 = sc.nextInt();        // Reads the next integer token.
 * var bd1 = sc.nextBigDecimal();  // Reads the next floating-point token.
 * var byte1 = sc.nextByte();      // Reads the next byte token (as Int8Array).
 */