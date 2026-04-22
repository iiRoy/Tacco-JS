/*
 * This is a Type I clone of the original JavaScript code.
 * All identifiers, variable names, function names, operators, and expressions
 * are preserved exactly as they were in the source.
 * Only whitespace and comments have been altered significantly
 * to create a visually distinct, yet functionally identical, copy.
 */

function main( input )
{
	// Process the input string: split by newline, then parse each line.
	// Each line is split by space, and values are converted to integers.
	var data = input . split ( "\n" ) . map ( function ( line ) {
		return line . split ( " " ) . map ( function ( value ) {
			return parseInt ( value )
		} )
	} )


	// Extract 'k' from the first line of input data.
	var k = data[0][1] ;

	// The array to be processed is on the second line.
	var array = data[1] ;


	// Find the maximum value within the 'array'.
	var maxA = max ( array ) ;

	// Calculate an upper bound for 'maxG' based on 'maxA' and 'k',
	// and also considering the result of a custom 'findMax' function.
	var maxG = Math . min ( maxA + k , findMax ( array ) ) ;

	/*
	 * Iterate downwards from 'maxG' to 2.
	 * The goal is to find the largest 'i' that satisfies the 'isG' condition.
	 */
	for ( var i = maxG ; i > 1 ; i -- )
	{
		if ( isG ( i , array , k ) )
		{
			// If 'isG' returns true, we've found our answer.
			return console . log ( i ) ;
		}
	}

	// If no such 'i' is found, the default answer is 1.
	return console . log ( 1 ) ;
}


function findMax( array )
{
	// Create a sorted copy of the input array.
	var sortedArray = array . sort ( ) ;

	var sumLeft = 0 ;
	var sumRight = 0 ;

	// Initialize 'j' to the last index of the sorted array.
	var j = sortedArray . length - 1 ;

	// The initial 'sumRight' is the largest element.
	sumRight = sortedArray [ j ] ;

	// Iterate from the beginning of the array up to 'j'.
	for ( var i = 0 ; i < j ; i ++ )
	{
		sumLeft += i ; // Accumulate 'i' into 'sumLeft'.

		if ( sumLeft <= sumRight )
		{
			// If sumLeft is still less than or equal to sumRight, continue with the next 'i'.
			continue
		}
		else
		{
			// If sumLeft exceeds sumRight, we need to balance them.
			j -- ; // Move 'j' inwards.
			/*
			 * While sumRight is less than sumLeft and 'j' is still ahead of 'i',
			 * add elements from the right side to 'sumRight'.
			 */
			while ( sumRight < sumLeft && j > i )
			{
				sumRight += sortedArray [ j ] ;
				j -- ;
			}
		}
	}

	// Return the minimum of the final sumLeft and sumRight.
	return Math . min ( sumLeft , sumRight )
}


function max( array )
{
	// Use the reduce method to find the maximum value in the array.
	return array . reduce ( function ( a , b ) {
		return Math . max ( a , b )
	} )
}


function sum( array )
{
	// Calculate the sum of all elements in the array, starting with an initial value of 0.
	return array . reduce ( function ( current , value ) {
		return current + value
	} , 0 )
}


/*
 * Checks a specific condition related to a given number 'g', an array, and a budget 'k'.
 * It determines if the array elements can be adjusted to be multiples of 'g'
 * within the constraints of 'k'.
 */
function isG( g , array , k )
{
	var newArray = [ ] ; // This will store pairs of (mod1, mod2) for each element.
	var tempK = 2 * k ; // Initialize a temporary budget.

	for ( var i = 0 ; i < array . length ; i ++ )
	{
		var mod1 = array [ i ] % g ; // Remainder when array[i] is divided by 'g'.

		if ( mod1 == 0 )
			continue ; // If it's already a multiple, no cost incurred.

		var mod2 = g - mod1 ; // Cost to make it the next multiple of 'g'.

		// If the minimum cost to adjust is greater than 'k', it's impossible.
		if ( k < Math . min ( mod1 , mod2 ) )
			return false ;

		tempK -= Math . min ( mod1 , mod2 ) ; // Deduct the minimum cost from the budget.

		// If the temporary budget falls below zero, it's impossible.
		if ( tempK < 0 )
			return false ;

		// Store the two possible costs for this element.
		newArray . push ( [ mod1 , mod2 ] ) ;
	}

	// Now, use a recursive traversal function to check if the remaining budget 'k'
	// can cover the costs stored in 'newArray' such that leftCost == rightCost.
	return traver ( newArray , 0 , 0 , 0 , k )
}


/*
 * Recursive function to explore paths for balancing costs.
 * 'array': The array of [mod1, mod2] pairs.
 * 'level': Current index in 'array'.
 * 'leftCost': Accumulated cost for 'mod1' choices.
 * 'rightCost': Accumulated cost for 'mod2' choices.
 * 'budget': The maximum allowed cost for either 'leftCost' or 'rightCost'.
 */
function traver( array , level , leftCost , rightCost , budget )
{
	// Base cases for pruning: if either cost exceeds the budget, this path is invalid.
	if ( leftCost > budget ) return false ;
	if ( rightCost > budget ) return false ;

	// Base case for recursion: if all elements have been processed.
	if ( level == array . length )
		return leftCost == rightCost ; // Success if both costs are equal.

	// Prioritize exploring the path that keeps costs more balanced.
	if ( leftCost < rightCost )
	{
		// Try adding to leftCost first, then to rightCost if the first fails.
		return testLeftPath ( array , level , leftCost , rightCost , budget ) ||
		       testRightPath ( array , level , leftCost , rightCost , budget ) ;
	}
	else
	{
		// Try adding to rightCost first, then to leftCost if the first fails.
		return testRightPath ( array , level , leftCost , rightCost , budget ) ||
		       testLeftPath ( array , level , leftCost , rightCost , budget )
	}

	// This line should theoretically be unreachable if the logic is sound.
	return false ;
}


// Helper function to explore the path where the current element's 'mod1' is added to 'leftCost'.
function testLeftPath( array , level , leftCost , rightCost , budget )
{
	return traver ( array , level + 1 , leftCost + array[level][0] , rightCost , budget ) ;
}


// Helper function to explore the path where the current element's 'mod2' is added to 'rightCost'.
function testRightPath( array , level , leftCost , rightCost , budget )
{
	return traver ( array , level + 1 , leftCost , rightCost + array[level][1] , budget ) ;
}


/*
 * Execute the main function with input from standard input.
 * This reads the entire file content as a string using Node.js's 'fs' module.
 */
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;