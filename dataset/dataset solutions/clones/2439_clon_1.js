function Main ( input ) {
  // This function serves as the primary entry point for processing the input.
  // It takes a single string 'input' which contains all the necessary data.

  input = input . trim ( ) . split ( "\n" ) . map ( function ( x ) { return x . split ( " " ) } ) ;
  // The raw input string is first trimmed to remove leading/trailing whitespace.
  // Then, it's split into lines based on newline characters.
  // Each line is further split by spaces, resulting in a 2D array of strings.

  var N = parseInt ( input [ 0 ] [ 0 ] , 10 ) ; // N represents the total number of available items.
  var T = parseInt ( input [ 0 ] [ 1 ] , 10 ) ; // T represents the maximum capacity or time limit.

  var arr_AB = [ ] ; // Initialize an array to store pairs of (A, B) values for each item.

  for ( var i = 0 ; i < N ; i ++ ) {
    // This loop iterates N times to populate the arr_AB array.
    // For each iteration, it takes a line from the processed input
    // (starting from the second line, hence i + 1) and converts its elements to integers.
    arr_AB . push ( input [ i + 1 ] . map ( e => parseInt ( e , 10 ) ) ) ;
  }

  arr_AB . sort ( ( a , b ) => a [ 1 ] - b [ 1 ] ) ;
  // The arr_AB array is sorted based on the second element (B value) of each pair in ascending order.
  // This sorting is crucial for the subsequent dynamic programming approach.

  var dp = [ ] ; // Initialize the dynamic programming table.
  var Ai , Bi ; // Declare variables to hold the current item's A and B values.

  dp . push ( Array . from ( { length : T + 1 } , ( ) => 0 ) ) ;
  // The first row of the DP table is initialized.
  // It represents the base case (no items considered), where all values are 0.
  // The length is T + 1 to account for capacities from 0 to T.

  for ( var i = 0 ; i < N ; i ++ ) {
    // This outer loop iterates through each item, from the first (index 0) to the N-th (index N-1).
    // 'i' here represents the index of the item currently being considered.

    dp . push ( [ ] ) ; // Add a new empty row to the DP table for the current item (i+1).

    Ai = arr_AB [ i ] [ 0 ] ; // Get the 'A' value (e.g., weight, time cost) of the current item.
    Bi = arr_AB [ i ] [ 1 ] ; // Get the 'B' value (e.g., value, benefit) of the current item.

    for ( var j = 0 ; j < T + 1 ; j ++ ) {
      // This inner loop iterates through all possible capacities or time limits, from 0 to T.
      // 'j' represents the current capacity being evaluated.

      if ( Ai <= j ) {
        // If the current item's 'A' value is less than or equal to the current capacity 'j',
        // then we have two choices:
        // 1. Exclude the current item. The maximum value would be dp[i][j].
        // 2. Include the current item. The maximum value would be dp[i][j - Ai] (value with remaining capacity) + Bi (value of current item).

        if ( dp [ i ] [ j ] >= dp [ i ] [ j - Ai ] + Bi ) {
          // If excluding the current item yields a greater or equal value,
          // then we choose to exclude it for this specific capacity.
          dp [ i + 1 ] [ j ] = dp [ i ] [ j ] ;
        } else {
          // Otherwise, including the current item yields a greater value,
          // so we choose to include it.
          dp [ i + 1 ] [ j ] = dp [ i ] [ j - Ai ] + Bi ;
        }

      } else {
        // If the current item's 'A' value is greater than the current capacity 'j',
        // it means the item cannot be included.
        // Therefore, the maximum value remains the same as without considering this item.
        dp [ i + 1 ] [ j ] = dp [ i ] [ j ] ;
      }
    }
  }

  var currentOrderList = [ ] ; // Initialize an array to store indices of selected items.
  var tmp = N ; // 'tmp' is used as a temporary index for tracking items in the DP table.
  var j = T - 1 ; // 'j' is the remaining capacity, starting from T-1 (as per problem constraints).

  whole_loop: // Label for the outer while loop, used for breaking out of nested loops.
  while ( j > 0 ) {
    // This loop reconstructs the set of items that achieve the maximum value within the capacity T-1.

    while ( true ) {
      // Inner loop to find the item that caused a change in the DP table.
      if ( tmp === 0 ) break whole_loop ; // If no more items to check, exit the whole reconstruction.

      if ( dp [ tmp ] [ j ] === dp [ tmp - 1 ] [ j ] ) {
        // If the value at dp[tmp][j] is the same as dp[tmp-1][j],
        // it means the 'tmp'-th item was NOT included for this capacity.
        // Move to consider the previous item.
        tmp -- ;
      } else {
        // If the values are different, it means the 'tmp'-th item WAS included.
        currentOrderList . push ( tmp - 1 ) ; // Add the index of the included item to the list.
        j -= arr_AB [ tmp - 1 ] [ 0 ] ; // Reduce the remaining capacity by the 'A' value of the included item.
        tmp -- ; // Move to consider the previous item.
        continue whole_loop ; // Continue the outer loop with the updated capacity and item index.
      }
    }
  }

  // After identifying items contributing to the dp[N][T-1] value,
  // these items need to be removed from the original arr_AB.
  for ( var x of currentOrderList ) {
    arr_AB . splice ( x , 1 ) ; // Remove the item at index 'x'.
  }

  var lastOrder = 0 ; // Initialize a variable to store the value of the last item, if any remain.
  if ( arr_AB . length > 0 ) {
    // If there are still items left in arr_AB after removing selected ones,
    // it implies that the problem might be considering an additional item for capacity T.
    // The value of this last item (arr_AB.length - 1, which was the last after sorting)
    // is added to the maximum value achievable with capacity T-1.
    lastOrder = dp [ N ] [ T - 1 ] + arr_AB [ arr_AB . length - 1 ] [ 1 ] ;
  }

  // Finally, print the maximum of two scenarios:
  // 1. The maximum value achievable with capacity T (dp[N][T]).
  // 2. The maximum value achievable with capacity T-1 plus the 'B' value of the last remaining item (lastOrder).
  console . log ( Math . max ( dp [ N ] [ T ] , lastOrder ) ) ;
}

// Invoke the Main function with input read from standard input.
// This standard boilerplate reads the entire content of /dev/stdin as a UTF-8 string.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;