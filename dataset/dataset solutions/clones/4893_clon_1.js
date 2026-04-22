/* This is a Type I clone of the original JavaScript code.
 * All identifiers, operators, and expressions are preserved exactly as in the original.
 * Only whitespace (spaces, tabs, blank lines) and comments have been altered significantly. */


function    Main (    input    )

{ // Start of the primary 'Main' function definition.

	// The input string is first processed by splitting it into an array of lines.
	input = input . split ( "\n" ) ;

	// The second line of the input (index 1) is then split by spaces to form a temporary array 'tmp'.
	tmp = input [ 1 ] . split ( " " ) ;


	// Convert the first line of input (at index 0) into an integer.
	// The 'parseInt' function is used here, specifying base 10 for decimal conversion.
	var N = parseInt ( input [ 0 ] , 10 ) ;

    // Declare and initialize an array named 'array_N' with a size derived from N.
    var array_N = new Array ( 2 * N - 1 ) ;

	// Output the parsed value of N and the 'tmp' array to the console for debugging.
	console . log ( N , tmp ) ;


    // A loop to iterate through 'tmp' and populate 'array_N' with integer values.
    for ( var i = 0 ; i < array_N . length ; i ++ )
    {
        array_N [ i ] = parseInt ( tmp [ i ] , 10 ) ; // Convert each string element to an integer.
    }

	// Display the fully populated 'array_N' to the console.
	console . log ( array_N ) ;


    // Define an inner helper function 'getArrayNext' that takes an array as input.
    function getArrayNext ( array_i )
    {
        // Create a new array 'array_i_next' with a length reduced by two from the input array.
        array_i_next = new Array ( array_i . length - 2 ) ;

        // Iterate to fill 'array_i_next' based on calculations from 'array_i'.
        for ( var j = 0 ; j < array_i_next . length ; j ++ )
        {
            // Extract a sub-array of three elements starting from index 'j'.
            var small_array = array_i . slice ( j , j + 3 ) ;

            // Sort the 'small_array' and assign its middle element (index 1 after sorting) to 'array_i_next'.
            // The custom comparator function ensures numerical ascending sort.
            array_i_next [ j ] = small_array . sort (
              function ( a , b ) // Anonymous comparison function for sorting.
              {
                return ( a < b ? -1 : 1 ) ; // Returns -1 if a < b, 1 otherwise (for ascending order).
              }
            ) [ 1 ] ; // Select the element at index 1 (the median of three).
        }
        return array_i_next ; // Return the newly constructed array.
    }

    // Initialize 'array_i' with the initial processed array 'array_N'.
    var array_i = array_N ;

    // Loop continues as long as 'array_i' contains more than one element.
    while ( array_i . length > 1 )
    {

        // Update 'array_i' by applying the 'getArrayNext' function.
        array_i = getArrayNext ( array_i ) ;

		// Log the current state of 'array_i' after each transformation.
		console . log ( array_i ) ;
    }

	// This section handles the final output.
	// The problem's solution is the single remaining element in 'array_i'.
	console . log ( 'the answer is %d' , array_i [ 0 ] ) ;

} // End of the 'Main' function.

// The following line is an example call commented out in the original code, preserved as such.
//Main("4\n1 6 3 7 4 5 2");


// Execute the 'Main' function, reading input from the standard input stream ('/dev/stdin').
// The 'fs' module is used for file system operations, and 'readFileSync' reads the file synchronously.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;