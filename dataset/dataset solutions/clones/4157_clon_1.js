function foo ( arr )
{
    // Initialize two arrays and a variable to keep track of the previous element.
    var a = [ ] , b = [ ] , prev ;

    // Sort the input array in ascending order.
    arr . sort ( ) ;

    // Iterate through the sorted array to count occurrences of each unique element.
    for ( var i = 0 ; i < arr . length ; i ++ )
    {
        // Check if the current element is different from the previous one.
        if ( arr [ i ] !== prev )
        {
            // If it's a new element, add it to 'a' and initialize its count in 'b' to 1.
            a . push ( arr [ i ] ) ;
            b . push ( 1 ) ;
        }
        else
        {
            // If it's a duplicate, increment the count of the last element in 'b'.
            b [ b . length - 1 ] ++ ;
        }

        // Update 'prev' to the current element for the next iteration.
        prev = arr [ i ] ;
    }

    // Return the two arrays: 'a' containing unique elements and 'b' containing their counts.
    return [ a , b ] ;
}

function Main ( input )
{
	// Split the input string by newline characters to get individual lines.
	input = input . split ( "\n" ) ;

	// Parse the first line as an integer for N (though N isn't used later in this specific logic).
	var N = parseInt ( input [ 0 ] , 10 ) ;

	// Split the second line by spaces to get an array of strings.
	var array = input [ 1 ] . split ( " " ) ;

	// Convert each string element in 'array' to an integer.
	array . forEach ( ( elem , index , array ) => array [ index ] = parseInt ( elem , 10 ) ) ;

	// Call the 'foo' function to process the array and get unique elements and their counts.
	result = foo ( array ) ;

	// Initialize a counter for the final result.
	var count = 0 ;

	// Iterate through the unique elements and their counts obtained from 'foo'.
	for ( var i = 0 ; i < result [ 0 ] . length ; i ++ )
	{
		// Get the current unique number.
		var num = result [ 0 ] [ i ] ;

		// Get the count of that unique number.
		var countOfNum = result [ 1 ] [ i ] ;

		// Check if the number itself is not equal to its count.
		if ( num != countOfNum )
		{
			// If the count is greater than the number.
			if ( num < countOfNum )
			{
				// We need to reduce the count to match the number.
				// Calculate how many elements need to be removed.
				count += countOfNum - num ;
			}
			// If the count is less than the number.
			if ( num > countOfNum )
			{
				// We need to remove all occurrences of this number.
				// Add its total count to the overall 'count'.
				count += countOfNum ;
			}
		}
	}

	// Output the final calculated count to the console.
	console . log ( count ) ;
}

/* This line and below are for handling standard input/output.
   Do not edit anything from this point onwards.
   It reads the entire input from stdin and calls Main with it. */
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;