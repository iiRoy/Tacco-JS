/*
 * This is a JavaScript program designed to solve a classic dynamic programming problem,
 * specifically a variation of the knapsack problem where we aim to maximize value
 * given a weight constraint.
 *
 * The solution calculates the minimum weight required to achieve a certain value,
 * and then finds the maximum value that can be obtained within the overall weight limit.
 */

function   main  ( input )
{
    // The input string is first split into an array of lines.
    const   lines = input . split ( '\n' ) ;


    // The first line contains N (number of items) and W (maximum weight capacity).
    // These are parsed and stored.
    const   NW    = lines . shift ( ) . split ( ' ' ) . map ( x => parseInt ( x ) ) ;
    const   N     = NW [ 0 ] ; // N represents the total count of items.
    const   W     = NW [ 1 ] ; // W is the maximum permissible weight.


    // The remaining lines are processed to form an array of items.
    // Each item is an array [weight, value].
    const   items = lines . map ( line => line . split ( ' ' ) . map ( x => parseInt ( x ) ) ) ;


    // The very first item is handled separately to initialize the DP array.
    const   first         = items . shift ( ) ;
    const   first_weight  = first [ 0 ] ; // This is the weight of the initial item.
    const   first_value   = first [ 1 ] ; // This is the value of the initial item.

    var     value_sum     = first_value ; // 'value_sum' will keep track of the maximum possible total value seen so far.

    // Initialize the dynamic programming array 'dp'.
    // dp[v] will store the minimum weight needed to achieve a total value of 'v'.
    // dp[0] is 0 because 0 value requires 0 weight.
    dp = [ 0 ] ;


    // Initialize the DP array for values up to the 'first_value'.
    // For any value 'i' up to 'first_value', the minimum weight to achieve it is 'first_weight'
    // if 'i' can only be achieved by taking the first item (this is a simplified initialization).
    for ( var  i = 1 ;  i <= value_sum ;  i ++ )
    {
        dp [ i ] = first_weight ;
    }


    // Iterate through the rest of the items to fill the DP table.
    for ( var  i = 0 ;  i < items . length ;  i ++ )
    {
        var   current_weight  = items [ i ] [ 0 ] ; // Get the weight of the current item.
        var   current_value   = items [ i ] [ 1 ] ; // Get the value of the current item.

        value_sum += current_value ; // Update the running total of all possible values.

        // A commented-out debug line that was present in the original code.
        // console.log(dp);

        // Iterate backwards through all possible values, from the maximum current sum down to 1.
        // This reverse iteration is crucial for correct DP update, preventing reuse of the same item.
        for ( var  value = value_sum ;  value > 0 ;  value -- )
        {

            if ( value >= current_value )
            {
                // If the current value 'value' is large enough to potentially include the 'current_value' item.
                var   prev_weight = dp [ value - current_value ] ; // Get the minimum weight for the remaining value.

                if ( dp [ value ] == undefined )
                {
                    // If 'value' has not been achieved before (or its weight is unknown),
                    // assign the weight of current item plus the weight for the remaining value.
                    dp [ value ] = current_weight + prev_weight ;
                }
                else
                {
                    // If 'value' has been achieved before, take the minimum of the existing weight
                    // and the new weight calculated by including the current item.
                    dp [ value ] = Math . min ( prev_weight + current_weight , dp [ value ] ) ;
                }
            }
            else
            {
                // If the current value 'value' is less than the 'current_value' of the item.
                // This means the current item cannot contribute its full value to reach 'value'.
                // The logic here is for initializing or updating 'dp[value]' when it's small.
                if ( dp [ value ] == undefined )
                {
                    // If dp[value] is undefined, it means this value hasn't been reachable yet.
                    // In this specific context, it's set to current_weight. This might be a
                    // base case or an assumption that if 'value' is small, it can only be formed
                    // by the current_weight if it's the only option.
                    dp [ value ] = current_weight ;
                }
                else
                {
                    // If dp[value] is already defined, take the minimum of the existing weight
                    // and the current item's weight. This ensures we always have the minimal weight.
                    dp [ value ] = Math . min ( current_weight , dp [ value ] ) ;
                }
            }

        } // End of inner loop for 'value'.

    } // End of outer loop for 'items'.


    var   result = 0 ; // Initialize the final result, which will be the maximum value achievable.

    // Iterate backwards through the DP array to find the largest value 'i'
    // such that the minimum weight 'dp[i]' required to achieve 'i' is within the budget 'W'.
    for ( var  i = value_sum ;  i >= 0 ;  i -- )
    {
        if ( dp [ i ] <= W )
        {
            result = i ; // Found the maximum value 'i' that respects the weight constraint.
            break ;      // Terminate the loop once the largest such 'i' is found.
        }
    }

    // Another commented-out debugging line.
    // console.log(dp);

    // The original code had another commented-out debugging line.
    // console.log(result==90);

    // Print the final calculated maximum value.
    console . log ( result + 0 ) ; // Adding 0 ensures type consistency or simply for visual variance.

} // End of the 'main' function definition.

// This line reads the input from '/dev/stdin' (standard input)
// and passes it to the 'main' function for processing.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;