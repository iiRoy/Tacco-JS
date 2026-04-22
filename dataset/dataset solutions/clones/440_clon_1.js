/*
 * This entire file is a JavaScript program designed to calculate
 * the minimum cost of an item, considering its direct price and
 * the potential cost of crafting it from other items.
 *
 * It processes input from standard input, which describes items,
 * their prices, and their recipes.
 */

function howMuch( items , item , s )
{
	try
	{
		// Declare variables needed within this function scope.
		var recipe ,
		    price = items[ item ] . price ,
		    sum ,
		    flag = false ,
		    j ;

		// Initialize 's' if it's not already provided (e.g., in the initial call).
		s = s || [ ] ;

		// The following line was commented out in the original for debugging purposes.
		// console.log(item, s);

		/*
		 * Check if the current item has a recipe.
		 * If it does, we need to calculate the cost of crafting it.
		 */
		if ( ( recipe = items[ item ] . recipe ) )
		{
			// Add the current item to the 'stack' to detect circular dependencies.
			s . push ( item ) ;
			sum = 0 ;
			flag = true ; // Assume crafting is possible until proven otherwise.

			// Iterate through each ingredient required for the recipe.
			for ( j = 0 ; j < recipe . length ; j ++ )
			{
				/*
				 * Check for two conditions that would make crafting impossible:
				 * 1. Circular dependency: The ingredient is already in the current crafting stack.
				 * 2. Unknown ingredient: The ingredient does not exist in the 'items' collection.
				 */
				if ( s . indexOf ( recipe[ j ] ) !== -1 || ! ( recipe[ j ] in items ) )
				{
					flag = false ; // Crafting is not possible or leads to a loop.
					break ;        // No need to check further ingredients.
				}

				// Recursively calculate the cost of the ingredient and add it to the sum.
				sum += howMuch ( items , recipe[ j ] , s ) ;
			}

			// If crafting was successful (no circular dependencies or missing ingredients).
			if ( flag )
			{
				// The price of the item is the minimum of its direct price and its crafting cost.
				price = min ( price , sum ) ;
			}

			// Remove the current item from the 'stack' as we've finished processing its recipe.
			s . pop ( ) ;
		}
	}
	catch ( e )
	{
		// If any error occurs during the calculation, re-throw it with context.
		throw [ e , items , item ] ;
	}

	// Return the determined minimum price for the item.
	return price ;
}


// A simple helper function to determine the minimum of two numbers.
function min( x , y )
{
	return x < y ? x : y ;
}


/**
 * The main function responsible for parsing input,
 * building the item data structure, and then
 * calculating and printing the costs.
 */
function main ( )
{
	var i , n , m , line ,
	    len = input . length , // Total number of lines in the input.
	    items ;                // Object to store all item data.

	// Loop through the input lines. Each iteration processes a new scenario.
	for ( i = 0 ; i < len ; )
	{
		items = { } ; // Initialize items for the current scenario.

		// Read the number of items with direct prices.
		n = parseInt ( input[ i ++ ] , 10 ) + i ;

		// If n is 0, it means no more items/scenarios, so break.
		if ( n === i ) break ;

		// Parse items with their direct prices.
		for ( ; i < n ; i ++ )
		{
			line = input[ i ] . split ( ' ' ) ;
			items[ line[ 0 ] ] = { price : parseInt ( line[ 1 ] , 10 ) } ;
		}

		// Read the number of items with recipes.
		m = parseInt ( input[ i ++ ] , 10 ) + i ;

		// Parse items with their recipes.
		for ( ; i < m ; i ++ )
		{
			line = input[ i ] . split ( ' ' ) ;
			items[ line[ 0 ] ] . recipe = line . slice ( 2 ) ;
		}

		// Debugging line, commented out in the original.
		// console.log(items);

		// Calculate and print the cost of the target item for this scenario.
		console . log ( howMuch ( items , input[ i ++ ] ) ) ;
	}
}


// Global variable to accumulate all standard input data.
var input = '' ;


// Set up standard input processing.
process . stdin . resume ( ) ; // Keep the process alive while waiting for input.
process . stdin . setEncoding ( 'utf8' ) ; // Specify the encoding for input data.

// Event listener for when data chunks are received from stdin.
process . stdin . on ( 'data' , function ( chunk )
{
	input += chunk ; // Append the received chunk to the 'input' string.
} ) ;

// Event listener for when the standard input stream ends.
process . stdin . on ( 'end' , function ( )
{
	input = input . split ( '\n' ) ; // Split the accumulated input into an array of lines.
	main ( ) ;                       // Call the main function to start processing.
} ) ;