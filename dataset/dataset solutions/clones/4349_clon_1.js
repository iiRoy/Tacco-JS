/*
 * This is the main function that processes the input.
 * It calculates optimal sugar-to-water ratio based on given constraints.
 */
function Main ( input )
{
    // Split the input string by spaces to get individual values.
    input = input . split ( " " ) ;

    // Parse integer values from the input array.
    var a = parseInt ( input [ 0 ] , 10 ) ; // Water unit A (grams)
    var b = parseInt ( input [ 1 ] , 10 ) ; // Water unit B (grams)
    var c = parseInt ( input [ 2 ] , 10 ) ; // Sugar unit C (grams)
    var d = parseInt ( input [ 3 ] , 10 ) ; // Sugar unit D (grams)
    var e = parseInt ( input [ 4 ] , 10 ) ; // Max sugar concentration factor (e.g., 0.1 for 10%)
    var f = parseInt ( input [ 5 ] , 10 ) ; // Max total weight (grams)

    // Initialize variables for tracking the best solution.
    var s = 0 ;  // Current maximum sugar concentration percentage
    var s1 = 0 ; // Total weight of the best solution
    var s2 = 0 ; // Total sugar weight of the best solution

    // Check for a special edge case: if only water unit A can be used and it's too much.
    // This condition seems to imply that if the minimum water (100*a)
    // already exceeds the capacity for sugar (c), then only water 100*a is possible.
    if ( f - 100 * a < c )
    {
        // If there's not enough room for even the smallest sugar unit (c)
        // after taking 100*a water, then we just take 100*a water and no sugar.
        s1 = 100 * a ; // Total water weight
        s2 = 0 ;       // No sugar added
    }
    else
    {
        // Otherwise, iterate through all possible combinations of water and sugar units.
        // Loop for water unit A (i times)
        for ( i = 0 ; i * 100 * a <= f ; i ++ )
        {
            // Loop for water unit B (j times)
            for ( j = 0 ; i * 100 * a + j * 100 * b <= f ; j ++ )
            {
                // Loop for sugar unit C (k times)
                for ( k = 0 ; i * 100 * a + j * 100 * b + k * c <= f ; k ++ )
                {
                    // Loop for sugar unit D (l times)
                    for ( l = 0 ; i * 100 * a + j * 100 * b + k * c + l * d <= f ; l ++ )
                    {
                        // Calculate total sugar weight
                        var currentSugarWeight = k * c + l * d ;
                        // Calculate total water weight
                        var currentWaterWeight = a * i + b * j ;

                        // Check if the current sugar concentration is within the allowed limit.
                        // (Sugar weight) <= (Water weight * Max concentration factor)
                        if ( ( currentSugarWeight ) <= ( currentWaterWeight ) * e )
                        {
                            // Calculate current total solution weight
                            var currentTotalWeight = i * 100 * a + j * 100 * b + k * c + l * d ;

                            // Ensure total weight is not zero to avoid division by zero.
                            // If total weight is valid, calculate the concentration percentage.
                            if ( currentTotalWeight > 0 )
                            {
                                var currentConcentration = ( 100 * currentSugarWeight ) / ( currentTotalWeight ) ;

                                // If this concentration is better than the best found so far, update.
                                if ( currentConcentration > s )
                                {
                                    s = currentConcentration ; // Update max concentration
                                    s1 = currentTotalWeight ;  // Update total weight for best solution
                                    s2 = currentSugarWeight ;  // Update sugar weight for best solution
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // Output the total weight and total sugar weight of the best solution found.
    // The format specifiers are used for string and integer output.
    console . log ( '%s %d' , s1 , s2 ) ;

}

// Read the input from standard input and pass it to the Main function.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;