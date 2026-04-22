function main ( input ) { // Main entry point for the program
    /*
     * Process input string:
     * 1. Split by newline to get individual lines.
     * 2. For each line, split by space to get string values.
     * 3. Convert each string value to an integer.
     */
    var data = input . split ( "\n" ) . map ( function ( line ) {
        return line . split ( " " ) . map ( function ( value ) {
                return parseInt ( value )
            }
        )
    } )


    // Extract 'k' value from the first line of data
    var k = data [ 0 ] [ 1 ] ;

    // Extract the array of numbers from the second line
    var array = data [ 1 ] ;


    // Find the maximum value in the given array
    var maxA = max ( array ) ;


    // Calculate the upper bound for 'g' based on maxA and k, or sum of array elements
    var maxG = Math . min ( maxA + k , sum ( array ) ) ;

    // Iterate downwards from maxG to 2 to find the largest 'g'
    for ( var i = maxG ; i > 1 ; i -- ) {
        // Check if current 'i' is a valid 'g'
    	if ( isG ( i , array , k ) ) {
    		return console . log ( i ) ; // If valid, print and exit
    	}
    }

    // If no 'g' > 1 is found, then 1 is the answer
    return console . log ( 1 ) ;
}


// Function to find the maximum value in an array
function max ( array ) {
	return array . reduce ( function ( a , b ) {
        return Math . max ( a , b )
    } )
}


// Function to calculate the sum of all elements in an array
function sum ( array ) {
	return array . reduce ( function ( current , value ) {
        return current + value
    } , 0 )
}


// Function to check if a given 'g' is valid for the array and k
function isG ( g , array , k ) {
	var newArray = [ ] ; // Stores pairs of (mod1, mod2)
	var tempK = 2 * k ; // Temporary budget for modifications

    // Iterate through each element in the input array
	for ( var i = 0 ; i < array . length ; i ++ ) {
		var mod1 = array [ i ] % g ; // Remainder when array[i] is divided by g

        // If remainder is 0, no modification needed for this element
		if ( mod1 == 0 ) continue ;

		var mod2 = g - mod1 ; // Complementary remainder to make it a multiple of g

        // If either mod1 or mod2 is greater than k, it's impossible to make array[i] a multiple of g
		if ( k < Math . min ( mod1 , mod2 ) ) return false ;

        // Subtract the minimum cost (mod1 or mod2) from the budget
		tempK -= Math . min ( mod1 , mod2 ) ;

        // If budget goes negative, it's impossible
		if ( tempK < 0 ) return false ;

        // Store the costs for further processing
		newArray . push ( [ mod1 , mod2 ] ) ;
	}

    // If all elements can be adjusted within tempK,
    // then check if the remaining budget can be balanced using traver
	return traver ( newArray , 0 , 0 , 0 , k )
}


// Recursive helper function for balancing costs
function traver ( array , level , leftCost , rightCost , budget ) {
	// Base cases for pruning the search
	if ( leftCost > budget ) return false ; // Left cost exceeds budget
	if ( rightCost > budget ) return false ; // Right cost exceeds budget

	// If all elements in newArray have been processed
	if ( level == array . length ) {
        return leftCost == rightCost ; // Check if total left cost equals total right cost
    }

    // Decision logic based on current costs and element values
	if ( leftCost < rightCost ) {
        // If left cost is less, prioritize trying to increase left cost
		return testLeftPath ( array , level , leftCost , rightCost , budget ) ||
               testRightPath ( array , level , leftCost , rightCost , budget ) ;
	} else if ( leftCost > rightCost ) {
        // If right cost is less, prioritize trying to increase right cost
		return testRightPath ( array , level , leftCost , rightCost , budget ) ||
               testLeftPath ( array , level , leftCost , rightCost , budget )
	} else if ( array [ level ] [ 0 ] > array [ level ] [ 1 ] ) {
        // If costs are equal, and mod1 is greater than mod2, prioritize mod2 (right path)
		return testRightPath ( array , level , leftCost , rightCost , budget ) ||
               testLeftPath ( array , level , leftCost , rightCost , budget )
	} else if ( array [ level ] [ 0 ] < array [ level ] [ 1 ] ) {
        // If costs are equal, and mod1 is less than mod2, prioritize mod1 (left path)
		return testLeftPath ( array , level , leftCost , rightCost , budget ) ||
               testRightPath ( array , level , leftCost , rightCost , budget ) ;
	}

    // Should not reach here if all conditions are covered, but as a fallback
	return false ;
}


// Helper function to explore the path where array[level][0] is added to leftCost
function testLeftPath ( array , level , leftCost , rightCost , budget ) {
	return traver ( array , level + 1 , leftCost + array [ level ] [ 0 ] , rightCost , budget ) ;
}


// Helper function to explore the path where array[level][1] is added to rightCost
function testRightPath ( array , level , leftCost , rightCost , budget ) {
	return traver ( array , level + 1 , leftCost , rightCost + array [ level ] [ 1 ] , budget ) ;
}

// Call the main function with input from stdin
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;