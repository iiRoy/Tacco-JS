/*
 * This JavaScript file processes input from stdin to count letter frequencies.
 * It's a self-executing anonymous function to encapsulate its scope.
 */
'use strict'; // Enforce strict mode for cleaner code and fewer errors.
( function  ( stdin )
{
	// Convert the input buffer to a string.
	var lines = stdin . toString ( ) ;

	/*
	 * Define the main processing logic as another immediately-invoked function expression (IIFE).
	 * This IIFE takes an array of characters as its 'data' argument.
	 */
	var result = ( function ( data )
	{

		// Initialize a hashmap to store character counts.
		// It filters for alphabetic characters, converts them to lowercase,
		// and then counts their occurrences using a reduce operation.
		var hashmap = data
			. filter ( function ( v )
			{
				// Keep only characters that are letters (A-Z or a-z).
				return /[A-Za-z]/.test(v) ;
			} )
			. map ( function ( v )
			{
				// Convert each filtered character to lowercase for consistent counting.
				return v . toLowerCase ( ) ;
			} )
			. reduce (
				function ( map , key )
				{
					// Increment the count for the current character in the map.
					map [ key ] ++ ;
					return map ; // Return the updated map for the next iteration.
				} ,
				// Initial state of the hashmap, with all 26 lowercase letters initialized to 0.
				{
					a : 0 , b : 0 , c : 0 , d : 0 , e : 0 , f : 0 , g : 0 , h : 0 , i : 0 , j : 0 ,
					k : 0 , l : 0 , m : 0 , n : 0 , o : 0 , p : 0 , q : 0 , r : 0 , s : 0 , t : 0 ,
					u : 0 , v : 0 , w : 0 , x : 0 , y : 0 , z : 0
				}
			) ;

		// Get an array of keys (letters) from the populated hashmap.
		var keys = Object . keys ( hashmap ) ;

		// Map each key to a string "key : count" and join them with newlines.
		return keys . map ( function ( key )
		{
			return key + ' : ' + hashmap [ key ] ;
		} ) . join ( '\n' ) ;

	} ( lines . split ( '' ) ) ) ; // Call the inner IIFE with the input string split into an array of characters.

	// Output the final result to the console.
	console . log ( result ) ;

} ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ) ; // Read content from /dev/stdin synchronously and pass it to the outer IIFE.