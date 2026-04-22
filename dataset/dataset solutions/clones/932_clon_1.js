/*
 * This is the main entry point for processing input.
 * It reads the input, parses it, and then orchestrates the dynamic programming solution.
 */
function     Main(   input    )    {

    // Pre-process the raw input string: trim, split by newlines, then split each line by space.
    input  =  input.trim().split(  "\n"  ).map(  function(x) {  return x.split(" "); }  );

    // Parse the first number as 'n' which likely represents the count of items or dimensions.
    var n = parseInt(  input[0][0]  ,  10  )  ;

    // Initialize an array to store values, potentially representing dimensions or weights.
    var v_rc = [];
    // Populate v_rc with parsed integer values from the input.
    for ( var i = 0 ; i < n ; i++ ) {
        v_rc.push(  parseInt(  input[i + 1][0]  ,  10  )  )  ;
    }

    // Add the last required value from the input to v_rc.
    v_rc.push(  parseInt(  input[n][1]  ,  10  )  )  ;

    // Initialize the dynamic programming table (2D array).
    // It's declared globally or implicitly global here, which is a common pattern in competitive programming.
    dp = [];
    // Fill the dp table with default values, e.g., -1 to indicate uncomputed states.
    for ( var i = 0 ; i < n ; i++ ) {
        dp.push(  []  )  ;
        for ( var j = 0 ; j < n ; j++ ) {
            dp[i].push(  [-1]  )  ; // Each cell stores an array, initial value is [-1].
        }
    }

    // A debug print statement, often commented out in final submissions.
    // console.log(dp);

    // Call the core dynamic programming function and print its first result element.
    console.log(  kukanDP(  v_rc  ,  0  ,  n - 1  )  [0]  )  ;

    // Another debug print statement.
    // console.log(  "Final DP state:"  ,  dp  )  ;

} // End of Main function definition.


/**
 * Implements a recursive dynamic programming approach (often called interval DP or section DP).
 * Calculates the minimum cost for a given range [l, r] of items/dimensions.
 *
 * @param {Array<number>} w - The array containing weights or dimensions.
 * @param {number} l - The left boundary of the current interval (inclusive).
 * @param {number} r - The right boundary of the current interval (inclusive).
 * @returns {Array<number>} An array containing:
 *                          [0] - The minimum cost for the interval [l, r].
 *                          [1] - The 'left' dimension/weight for this interval's calculation.
 *                          [2] - The 'right' dimension/weight for this interval's calculation.
 */
function     kukanDP  (  w  ,  l  ,  r  )    {

    // Uncomment for debugging: console.log("Current interval: l=" + l + ", r=" + r);

    // Check if the result for this subproblem [l, r] has already been computed.
    // This is the memoization step of dynamic programming.
    if (  dp  [l]  [r]  [0]  !==  -1  ) {
        return  dp  [l]  [r]  ;
    }

    // Base case 1: If the interval contains a single element (l equals r).
    // The cost is 0, and the dimensions are w[l] and w[l+1].
    if (  l  ===  r  ) {
        return  dp  [l]  [r]  =  [  0  ,  w[l]  ,  w[l + 1]  ]  ;
    }

    // Base case 2: If the interval contains exactly two elements (adjacent).
    // The cost is w[l] * w[r] * w[r+1] (assuming matrix chain multiplication context).
    // The dimensions are w[l] and w[r+1].
    if (  Math.abs(  l  -  r  )  ===  1  ) {
        // Using slice() to ensure a new array is returned, not just a reference.
        return  dp  [l]  [r]  =  [  w[l]  *  w[r]  *  w[Math.max(l, r) + 1]  ,  w[Math.min(l, r)]  ,  w[Math.max(l, r) + 1]  ]  .slice()  ;
    }

    // Initialize 'res' to store the minimum cost found for this interval.
    let     res     =     Infinity    ;
    // Declare temporary variables for subproblem results and current calculation.
    let     tmp    ,    tmpL    ,    tmpR    ;

    // Iterate through all possible split points 'mid' within the current interval [l, r].
    // This loop explores all ways to divide the problem into two smaller subproblems.
    for (  let mid = l  ;  mid <= r - 1  ;  mid++  ) {

        // Recursively solve the left subproblem [l, mid].
        tmpL  =  kukanDP(  w  ,  l  ,  mid  )  ;
        // Recursively solve the right subproblem [mid + 1, r].
        tmpR  =  kukanDP(  w  ,  mid + 1  ,  r  )  ;

        // Debugging line (uncomment to see intermediate results).
        // console.log("Combined results:", tmpL, tmpR, "for interval:", l, r, "split at:", mid);

        // Calculate the cost for the current split:
        // Cost = cost_of_left_subproblem + cost_of_right_subproblem + cost_of_combining_them.
        // The combination cost is typically L_dim * M_dim * R_dim, where M_dim is shared.
        tmp = tmpL[0]  +  tmpR[0]  +  tmpL[1]  *  tmpL[2]  *  tmpR[2]  ;

        // Update 'res' if a smaller cost is found.
        if (  tmp  <  res  ) {
            res  =  tmp  ;
        }

    }

    // Debugging line (uncomment to see DP table state after computing [l,r]).
    // console.log("Computed for [", l, ",", r, "]:", dp);

    // Store the computed minimum cost and associated dimensions in the DP table.
    // The dimensions for the combined interval [l, r] are w[l] and w[r+1].
    return  dp  [l]  [r]  =  [  res  ,  w[l]  ,  w[r + 1]  ]  ;

}  ; // End of kukanDP function.

// Execute the Main function by reading input from standard input.
// This is typical for competitive programming environments.
Main(  require(  "fs"  ).readFileSync(  "/dev/stdin"  ,  "utf8"  )  )  ;