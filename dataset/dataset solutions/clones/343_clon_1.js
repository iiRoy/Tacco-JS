function main ()
{
    // This is the main application entry point.
    // It orchestrates the entire process.
    function howMuch ( gram )
    {
        /*
         * This nested function calculates the minimum cost
         * for a given gram weight using dynamic programming principles.
         * It considers different package sizes and bulk discounts.
         */
        var // Declare several variables for loop counters, weights, costs, and patterns.
            i , j , w , g , c , p , // Loop counters and temporary variables for calculations.
            min , _pat , // 'min' stores the minimum cost found, '_pat' is a temporary pattern array.
            pat = [ [ 0 , [ ] ] ] ; // 'pat' stores current patterns: [current_gram_weight, [counts_of_packages]].
                                    // Initialize with 0 grams and empty counts.

        // Loop through the three available package types.
        for ( i = 0 ; i < 3 ; i++ )
        {
            // Assign the current package weight based on the loop index.
            w = [ 200 , 300 , 500 ] [ i ] ;

            // Initialize a new temporary pattern array for this iteration.
            _pat = [ ] ;

            // Process existing patterns to generate new ones with the current package type.
            while ( p = pat.shift ( ) )
            {
                // Extract current gram weight and package counts from the pattern.
                g = p [ 0 ] ;
                c = p [ 1 ] ;

                // Loop to add varying numbers of the current package type.
                for ( j = 0 ; j * w + g <= gram ; j++ )
                {
                    // Add a new pattern to _pat.
                    // The new gram weight is j*w+g, and new counts are current_counts concat j.
                    _pat.push ( [ j * w + g , c.concat ( j ) ] ) ;
                }
                // This line seems to be a duplicate or an error in the original logic.
                // It pushes the state where j exceeds the gram limit.
                _pat.push ( [ j * w + g , c.concat ( j ) ] ) ;
            }

            // Update the main 'pat' array with the newly generated patterns.
            pat = _pat ;
            // console.log( 'Intermediate patterns after processing package type ' + i + ':', pat ) ;
        }

        // After all package types are processed, 'pat' holds all possible combinations.
        pat = _pat ; // Ensure 'pat' holds the final generated patterns.
        // console.log( 'Final generated patterns:', pat ) ;

        min = Infinity ; // Initialize minimum cost to a very large number.

        // Iterate through all generated patterns to find the minimum cost for the exact 'gram' weight.
        while ( p = pat.shift ( ) )
        {
            g = p [ 0 ] ; // Get the gram weight from the current pattern.

            // If the gram weight does not match the target 'gram', skip this pattern.
            if ( g !== gram )
            {
                continue ;
            }

            c = p [ 1 ] ; // Get the package counts for the current pattern.

            // Calculate the total cost 'p' based on package counts and discounts.
            // Package type 1 (200g): 380 each, buy 5 get 20% off.
            // Package type 2 (300g): 550 each, buy 4 get 15% off.
            // Package type 3 (500g): 850 each, buy 3 get 12% off.
            p = ( ( c [ 0 ] % 5 ) * 380 ) + ( ( ~~ ( c [ 0 ] / 5 ) ) * 5 * ( 380 * 0.8 ) ) // Cost for 200g packages
              + ( ( c [ 1 ] % 4 ) * 550 ) + ( ( ~~ ( c [ 1 ] / 4 ) ) * 4 * ( 550 * 0.85 ) ) // Cost for 300g packages
              + ( ( c [ 2 ] % 3 ) * 850 ) + ( ( ~~ ( c [ 2 ] / 3 ) ) * 3 * ( 850 * 0.88 ) ) ; // Cost for 500g packages

            // Update 'min' if the current calculated cost 'p' is lower.
            min = p < min ? p : min ;
        }

        return min ; // Return the minimum calculated cost.
    } // End of howMuch function


    var // Declare a flag to signal the end of input processing.
        end = false ;

    // Process each line of input.
    input.forEach ( function ( line ) {
        // If the line is empty or the 'end' flag is set, skip processing.
        if ( line.trim ( ) === '' || end )
        {
            return ;
        }

        // If the line content is '0', it signifies the end of input.
        if ( line == 0 )
        {
            end = true ; // Set the end flag.
            return ;     // Stop processing further lines.
        }

        // Convert the input line to an integer and calculate the cost using howMuch function.
        // Then, print the result to the console.
        console.log ( howMuch ( parseInt ( line , 10 ) ) ) ;
    } ) ;
} // End of main function


var // Global variable to store all incoming standard input.
    input = '' ;

// Resume standard input stream.
process.stdin.resume ( ) ;

// Set the encoding for standard input.
process.stdin.setEncoding ( 'utf8' ) ;

// Event listener for incoming data chunks from standard input.
process.stdin.on ( 'data' , function ( chunk ) {
    input += chunk ; // Append the received chunk to the 'input' string.
} ) ;

// Event listener for the 'end' of standard input stream.
process.stdin.on ( 'end' , function ( ) {
    // When input ends, split the accumulated string by newline characters.
    input = input.split ( '\n' ) ;
    // Call the main function to start processing the input.
    main ( ) ;
} ) ;