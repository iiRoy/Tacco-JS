function Main ( input ) {
	// This function serves as the primary entry point for processing the given input string.
	// The 'input' parameter is expected to be a multi-line string.
	// After splitting, 'input[0]' will contain the first line, 'input[1]' the second, and so forth.

	input = input.split( "\n" ) .filter( Boolean ) ; // First, split the input string into an array of lines using the newline character.
	                                                // Then, filter out any empty strings that might result from trailing newlines.

	const n = + input[0] ; // The first element of the processed input array (input[0]) represents the total number of points 'n'.
	                       // The unary plus operator (+) converts this string representation to a numeric type.

	// This conditional block handles edge cases where the number of points 'n' is very small.
	// If 'n' is 1 or 2, there are not enough distinct points to form any meaningful vectors or patterns.
	// In such scenarios, the problem statement implies a fixed result of 1.
	if ( n <= 2 ) {
		console.log( 1 ) ; // Output the specific result '1' for these small 'n' values.
		return ;           // Terminate the function execution immediately as the result is determined.
	}


	// Process the remaining lines of the input to extract coordinate pairs.
	// 'input.slice(1)' creates a new array containing all lines *after* the first one (which held 'n').
	// The first '.map' transforms each line string (e.g., "10 20") into an array of strings (e.g., ["10", "20"]).
	// The nested '.map' then converts each string in these inner arrays into a number (e.g., [10, 20]).
	const xy = input .slice( 1 ) .map( s => s.split( ' ' ) .map( n => +n ) ) ;


	// Initialize an empty JavaScript object to act as a frequency map (hash map).
	// This 'map' will store string representations of vectors as keys and their occurrences as values.
	const map = {} ;

	// Begin a nested iteration to compare every point with every other point.
	// This is necessary to calculate all possible vectors between distinct points.
	xy .forEach( a => { // Outer loop: 'a' represents the starting point of a vector.
		xy .forEach( b => { // Inner loop: 'b' represents the ending point of a vector.

			// Prevent calculating a vector from a point to itself.
			// This check ensures 'a' and 'b' are distinct point objects.
			if ( a === b ) return ; // If 'a' and 'b' refer to the same object, skip this iteration.

			// Calculate the components of the vector from point 'a' to point 'b'.
			// 'vec[0]' is the difference in x-coordinates (delta_x), 'vec[1]' is the difference in y-coordinates (delta_y).
			const vec = [ b[0] - a[0] , b[1] - a[1] ] ;

			// Create a unique string key for the vector to use in the 'map'.
			// This joins the x and y components with an underscore, e.g., "3_-5".
			const m = vec.join( '_' ) ;

			// Update the frequency count for this specific vector 'm' in the 'map'.
			// If 'map[m]' is currently null or undefined (meaning the vector hasn't been seen before),
			// initialize its count to 1; otherwise, increment its existing count.
			map[m] = map[m] == null ? 1 : map[m] + 1 ;

		} ) ; // End of inner forEach loop.
	} ) ; // End of outer forEach loop.


	// Use the 'reduce' method to find the vector string with the highest frequency count in the 'map'.
	// 'Object.keys(map)' retrieves an array of all unique vector strings (keys) from the 'map'.
	// The 'reduce' function iterates through these keys, maintaining an accumulator 'r'.
	// 'r' is an array: [maximum_count_found_so_far, vector_string_associated_with_that_count].
	const res = Object.keys( map ) .reduce( ( r , xystr ) => {
		const count = map[xystr] ; // Get the frequency count for the current vector string 'xystr'.

		// Compare the current vector's count with the maximum count recorded in 'r[0]'.
		// If the current count is greater, update 'r' with the new maximum count and its corresponding vector string.
		// Otherwise, retain the existing maximum count and vector string.
		return count > r[0] ? [ count , xystr ] : [ r[0] , r[1] ] ;
	} , [ 1 , '' ] ) ; // The initial value for 'r' is [1, ''], assuming a minimum count of 1 and an empty string for the vector.


	// The following line is commented out as it's not directly used in the final calculation,
	// but it could be used for debugging or if the most frequent vector string itself were needed.
	// const pq = res[1]; // 'pq' would hold the string representation of the most frequent vector.


	// Finally, calculate and output the result.
	// The problem asks for 'n' (total points) minus the count of the most frequent vector (res[0]).
	// This essentially represents the minimum number of points that must be removed
	// such that no remaining pair of points forms the most frequent vector pattern.
	console.log( n - res[0] ) ;
}


// ***************************************************************************************************
// * This section of the code is a standard boilerplate for competitive programming environments. *
// * It handles reading input from standard input and invoking the 'Main' function.             *
// * Do not modify any code below this line to ensure proper execution against test cases.       *
// ***************************************************************************************************
Main( require( "fs" ) .readFileSync( "/dev/stdin" , "utf8" ) ) ; // Reads the entire content of standard input as a UTF-8 string,
                                                                 // then passes it to the 'Main' function for processing.