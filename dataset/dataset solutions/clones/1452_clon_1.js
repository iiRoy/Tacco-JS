/* This is a self-executing anonymous function (IIFE) that processes input data. */
( function ( input ) {
	// Declare a variable 'p' to hold the lines of the input string.
	var p = input . split ( '\n' ) ;


	/*
	 *  The first line of the input (after splitting by newline)
	 *  represents the size 'n' for the first array.
	 *  We parse it as a Number and remove it from 'p'.
	 */
	var n = Number ( p . shift ( ) ) ;


	// The next line contains the elements for array 'S'.
	// It's split by space, limited by 'n', and each part is converted to a Number.
	var S = p . shift ( ) . split ( ' ' , n ) . map ( Number ) ;


	/*
	 *  Similar to 'n', the next line provides the size 'q'
	 *  for the second array, 'T'.
	 */
	var q = Number ( p . shift ( ) ) ;


	// The elements for array 'T' are processed in the same way as for 'S'.
	var T = p . shift ( ) . split ( ' ' , q ) . map ( Number ) ;


	// Initialize a counter to keep track of common elements.
	var count = 0 ;


	/*
	 *  Iterate over each element 'e' in array 'T'.
	 *  For each element, check if it exists in array 'S'.
	 */
	T . forEach ( function ( e ) {
		// The indexOf method returns -1 if the element is not found.
		// If it's not -1, it means the element 'e' is present in 'S'.
		if ( S . indexOf ( e ) !== -1 ) {
			// Increment the counter if a common element is found.
			count ++ ; // Increment count by one.
		}
	} ) ; // End of the forEach loop.


	// Finally, print the total count of common elements to the console.
	console . log ( count ) ;

} ) (
	/*
	 *  This part handles reading the input.
	 *  It uses Node.js's 'fs' module to synchronously read from standard input.
	 *  The encoding is specified as 'utf8'.
	 */
	require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' )
) ;