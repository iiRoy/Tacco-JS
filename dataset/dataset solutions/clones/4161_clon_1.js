/*
 * This file contains the main logic for processing input data.
 * The 'Main' function is the entry point, receiving all input as a single string.
 */
function     Main ( input ) {
	// Splitting the input string by newline characters to get individual lines.
	var line = input . split ( "\r\n" ) ;

	// The first line contains the 's' string.
	var s = line [ 0 ] ;

	// The second line contains space-separated temporary values.
	var tmp = line [ 1 ] . split ( " " ) ;


	/*
	 * Processing the 's' string to determine forward movements.
	 * It's split by 'T' to get segments of 'F' characters.
	 */
	var forward = s . split ( "T" ) ;


	// The length of the first segment (before the first 'T') represents the initial step.
	var firstStep = forward [ 0 ] . length ;


	/*
	 * Calculating the target destination coordinates.
	 * These are derived from the 'tmp' values and the 'firstStep'.
	 * Math.abs ensures positive distances.
	 */
	var dest = [ Math . abs ( Number ( tmp [ 0 ] ) - firstStep ) , Math . abs ( Number ( tmp [ 1 ] ) ) ] ;


	// Arrays to store lengths of movements along X and Y axes.
	var dx = [ ] ;
	var dy = [ ] ;

	// Accumulators for the total possible movement along X and Y axes.
	var sumx = 0 ;
	var sumy = 0 ;


	// Iterating through the 'forward' segments starting from the second one.
	for ( var i = 1 ; i < forward . length ; i ++ ) {

		// Even-indexed segments (after the first) contribute to X-axis movement.
		if ( i % 2 === 0 ) {
			dx . push ( forward [ i ] . length ) ;
			sumx += forward [ i ] . length ;
		}
		// Odd-indexed segments contribute to Y-axis movement.
		else {
			dy . push ( forward [ i ] . length ) ;
			sumy += forward [ i ] . length ;
		}
	}


	// Sorting the movement lengths for X-axis in ascending order.
	dx . sort ( function ( a , b ) {
		return a - b ;
	} ) ;

	// Sorting the movement lengths for Y-axis in ascending order.
	dy . sort ( function ( a , b ) {
		return a - b ;
	} ) ;


	/*
	 * Helper function to determine if a specific destination 'dest'
	 * can be reached given a set of movement options 'd' and their total 'sum'.
	 * This involves a dynamic programming-like approach to check combinations.
	 */
	var canReach = function ( d , dest , sum ) {

		// If the target destination is less than the total possible movement.
		if ( dest < sum ) {
			// If the difference is odd, it's impossible to reach.
			if ( ( sum - dest ) % 2 === 1 ) {
				console . log ( "No" ) ;
				return false ;
			}
			// If the difference is even, we need to find if 'backStep' can be formed.
			else {
				var backStep = ( sum - dest ) / 2 ;
				var dd = [ ] ; // Stores reachable sums using 'd' elements.

				// Iterate through the sorted movement options.
				for ( var j = 0 ; j < d . length && d [ j ] <= backStep ; j ++ ) {
					var l = dd . length ; // Current number of reachable sums.

					dd . push ( d [ j ] ) ; // Add the current movement option.

					if ( d [ j ] === backStep ) {
						return true ; // Found an exact match for backStep.
					}

					// Combine current movement option with previously reachable sums.
					for ( var k = 0 ; k < l ; k ++ ) {
						dd . push ( d [ j ] + dd [ k ] ) ;
						if ( d [ j ] + dd [ k ] === backStep ) {
							return true ; // Found an exact match.
						}
					}
				}
				return false ; // No combination found to form 'backStep'.
			}
		}
		// If the target destination is exactly the total possible movement.
		else if ( dest === sum ) {
			return true ; // Perfectly reachable.
		}
		// If the target destination is greater than the total possible movement.
		else {
			return false ; // Impossible to reach.
		}
	} ;



	/*
	 * Final decision logic based on calculated destinations and movement sums.
	 * Calls the 'canReach' function for both X and Y dimensions.
	 */
	if ( dest [ 0 ] > sumx || dest [ 1 ] > sumy ) {
		// If either target coordinate is beyond the total possible movement in that dimension.
		console . log ( "No" ) ;
		return false ;
	} else if ( dest [ 0 ] === sumx && dest [ 1 ] === sumy ) {
		// If both target coordinates exactly match the total possible movement.
		console . log ( "Yes" ) ;
		return false ;
	} else {
		// Otherwise, check if each dimension can independently reach its target.
		if ( canReach ( dx , dest [ 0 ] , sumx ) && canReach ( dy , dest [ 1 ] , sumy ) ) {
			console . log ( "Yes" ) ;
			return false ;
		} else {
			console . log ( "No" ) ;
			return false ;
		}
	}

} /* End of Main function definition */


/*
 * This section is for handling standard input/output.
 * DO NOT EDIT THIS PART OF THE CODE.
 * It reads the entire input from stdin and passes it to the Main function.
 */
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;