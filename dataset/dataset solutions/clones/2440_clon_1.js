/*
 * This JavaScript file contains a solution for a dynamic programming problem.
 * The core logic involves processing input data, sorting, and then
 * populating a DP table to find an optimal value.
 *
 * Author: Code Clone Generator
 * Date: 2023-10-27
 * Version: 1.0
 */

function Main ( input ) {

    // Process the raw input string: trim whitespace, split into lines,
    // then split each line by space and parse as integers where needed.
    input = input . trim ( ) . split ( "\n" ) . map (
        function ( x ) {
            return x . split ( " " )
        }
    ) ;

    // Parse N (number of items) and T (total capacity/time) from the first line of input.
    var N = parseInt ( input [ 0 ] [ 0 ] , 10 ) ;
    var T = parseInt ( input [ 0 ] [ 1 ] , 10 ) ;

    // Initialize an array to store pairs of values (A, B) for each item.
    var arr_AB = [ ] ;

    // Loop through the input lines starting from the second line (index 1)
    // to populate arr_AB with integer pairs.
    for ( var i = 0 ; i < N ; i ++ ) {
        // Each sub-array input[i + 1] contains two string elements,
        // which are then mapped to integers.
        arr_AB . push ( input [ i + 1 ] . map ( e => parseInt ( e , 10 ) ) ) ;
    }

    // Sort the arr_AB array based on the second element (B value) of each pair in ascending order.
    // This sorting step is crucial for the DP approach.
    arr_AB . sort ( ( a , b ) => a [ 1 ] - b [ 1 ] ) ;

    // Initialize the dynamic programming table.
    // 'dp' will store the maximum values achievable at each state.
    var dp = [ ] ;

    // Declare variables for the current item's A and B values, used within the DP loop.
    var Ai , Bi ;

    // Initialize the first row of the DP table.
    // It represents the base case (no items considered yet), so all values are 0.
    // The length of this row is T + 1, covering capacities from 0 to T.
    dp . push ( Array . from ( { length : T + 1 } , ( ) => 0 ) ) ;

    // Main DP loop: iterate through each item from the sorted list.
    // Note: The loop runs up to N - 1, implying the last item is handled separately or implicitly.
    for ( var i = 0 ; i < N - 1 ; i ++ ) {
        // Add a new row for the current item's DP calculations.
        dp . push ( [ ] ) ;

        // Extract the A and B values for the current item.
        Ai = arr_AB [ i ] [ 0 ] ; // 'A' value (e.g., weight, time cost)
        Bi = arr_AB [ i ] [ 1 ] ; // 'B' value (e.g., profit, benefit)

        // Inner loop: iterate through all possible capacities (j) from 0 to T.
        for ( var j = 0 ; j < T + 1 ; j ++ ) {
            // Optional debug print statement, currently commented out.
            // console.log( 'DP state:' , i , j , dp ) ;

            // Check if the current item's 'A' value can fit within the current capacity 'j'.
            if ( Ai <= j ) {
                // If it fits, we have two choices:
                // 1. Don't include the current item: value is dp[i][j] (from previous row, same capacity).
                // 2. Include the current item: value is dp[i][j - Ai] + Bi
                //    (value from previous row with reduced capacity, plus current item's benefit).
                // Take the maximum of these two choices.
                dp [ i + 1 ] [ j ] = Math . max ( dp [ i ] [ j ] , dp [ i ] [ j - Ai ] + Bi ) ;
            } else {
                // If the current item's 'A' value is greater than capacity 'j',
                // we cannot include it. So, the value is simply carried over
                // from the previous row (without considering this item).
                dp [ i + 1 ] [ j ] = dp [ i ] [ j ] ;
            }
            // Another commented-out line, possibly from an alternative DP state definition or debugging.
            // dp[ i + 1 ][ j ][ 1 ] = Math.max( dp[ i ][ j ][ 1 ], dp[ i ][ j ][ 0 ] + Bi ) ;
        }
    }

    // After the main DP loop, calculate the result for the last item.
    // This value considers the benefit of the last item (arr_AB[N-1][1])
    // added to the maximum value achievable with the remaining capacity (T-1)
    // from the previous N-1 items.
    var lastOrder ;
    lastOrder = dp [ N - 1 ] [ T - 1 ] + arr_AB [ N - 1 ] [ 1 ] ;

    // The following block is commented out in the original code.
    // It appears to be an alternative or incomplete approach to handle the last item or a different DP structure.
    /*
    // i = N - 1; // Index for the last item.
    // Ai = arr_AB[i][0]; // 'A' value of the last item.
    // Bi = arr_AB[i][1]; // 'B' value of the last item.
    // for (var j = 0; j < T; j++){
    //     // console.log(i, j, dp);
    //     lastOrder.push([0, 0]); // Pushing an array for some reason.
    //     if (Ai <= j){
    //         lastOrder[j][0] = Math.max(dp[i][j], dp[i][j - Ai] + Bi);
    //     } else {
    //         lastOrder[j][0] = dp[i][j];
    //     }
    //     lastOrder[j][1] = Math.max(dp[i][j][1], dp[i][j][0] + Bi);
    // }
    */

    // Finally, print the maximum of two values:
    // 1. The maximum value achievable considering all N-1 items with capacity T (dp[N-1][T]).
    // 2. The 'lastOrder' value, which potentially incorporates the last item differently.
    console . log ( Math . max ( dp [ N - 1 ] [ T ] , lastOrder ) ) ;
}

// Read input from stdin using Node.js 'fs' module and call the Main function.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;