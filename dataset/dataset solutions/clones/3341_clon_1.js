/*
 * This is the main function responsible for processing input
 * and calculating the final answer based on a dynamic programming approach.
 * It reads numerical data, initializes DP tables, and computes
 * a result which is then logged to the console.
 */
function Main ( input ) {
    // Split the input string by newline characters to get an array of lines.
    input = input.split ( "\n" ) ;

    // Parse the first line to get the integer N, which usually represents the size of an array or number of items.
    var N = parseInt ( input[0] ) ;

    // Parse the second line: split by space, then map each part to an integer.
    var a = input[1].split ( " " ).map ( i => parseInt ( i ) ) ;

    // Initialize the answer variable.
    var ans = 0 ;

    // Declare and initialize the dynamic programming table (DP table).
    // This will likely store intermediate results for subproblems.
    var dp = new Array ( N ) ;

    // Declare and initialize an array to store prefix sums.
    // This helps in efficient calculation of sums over ranges.
    var sum = new Array ( N ) ;

    // The first element of the sum array is simply the first element of 'a'.
    sum[0] = a[0] ;

    // Initialize the DP table and compute prefix sums.
    // This loop iterates N times to set up the DP matrix rows and fill the sum array.
    for ( var i = 0 ; i < N ; i++ ) {
        // Create a temporary array, initialized with zeros, for the current row of the DP table.
        var tmp = new Array ( N ).fill ( 0 ) ;
        // Assign the temporary array as the i-th row of the DP table.
        dp[i] = tmp ;

        // If 'i' is not the first element, calculate the cumulative sum.
        // sum[i] stores the sum of elements from a[0] to a[i].
        if ( i > 0 ) {
            sum[i] = sum[i - 1] + a[i] ;
        }
    }

    // This section implements the core dynamic programming logic.
    // It iterates through different lengths of subproblems (k).
    for ( var k = 1 ; k < N ; k++ ) {
        // This inner loop iterates through all possible starting points (i) for a subproblem of length k.
        // 'j' represents the end point of the subproblem.
        for ( var i = 0, j = k ; i < N && j < N ; i++, j++ ) {
            // Initialize 'tmp' with a very large number, representing infinity.
            // This will be used to find the minimum cost for the current subproblem.
            var tmp = Math.pow ( 10, 19 ) ;

            // This innermost loop iterates through all possible split points (l) within the current subproblem [i, j].
            for ( var l = i ; l < j ; l++ ) {
                // Check if 'i' is not the first element (i.e., we need to subtract sum[i-1] for range sum).
                if ( i != 0 ) {
                    // Calculate the cost for splitting at 'l' and update 'tmp' if it's a minimum.
                    // The cost involves two subproblems (dp[i][l] and dp[l+1][j]) plus the sum of elements in the range [i, j].
                    tmp = Math.min ( tmp, dp[i][l] + dp[l + 1][j] + sum[j] - sum[i - 1] ) ;
                } else {
                    // If 'i' is the first element, the range sum is simply sum[j].
                    tmp = Math.min ( tmp, dp[i][l] + dp[l + 1][j] + sum[j] ) ;
                }
            }
            // Store the minimum cost found for the subproblem [i, j] in the DP table.
            dp[i][j] = tmp ;
        }
    }

    // The final answer is stored in dp[0][N-1], representing the cost for the entire range [0, N-1].
    ans = dp[0][N - 1] ;

    // Log the calculated answer to the console.
    console.log ( '%s', ans ) ;

    // Return the computed answer.
    return ans ;
}

/*
 * This debug function is intended for local testing and debugging purposes.
 * It reads input from a specific HTML element, calls the Main function,
 * and then displays whether the computed answer matches a predefined output.
 */
function debug ( n ) {
    // Retrieve input value from a specific HTML element.
    var input = document.getElementById ( "input" + n ).value ;

    // Call the main function with the retrieved input.
    var ans = Main ( input ) ;

    // Initialize result status as "WA" (Wrong Answer).
    var result = "WA" ;

    // Compare the computed answer with the expected output from another HTML element.
    // The expected output is taken from the first line of the element's value.
    if ( ans == document.getElementById ( "output" + n ).value.split ( "\n" )[0] ) {
        // If they match, set result status to "AC" (Accepted).
        result = "AC" ;
    }

    // Display the result status in a specific HTML element.
    document.getElementById ( "result" + n ).innerHTML = result ;
}

// Execute the Main function with input read from standard input (e.g., a file).
// This line is typically used in competitive programming environments.
Main ( require ( "fs" ).readFileSync ( "/dev/stdin", "utf8" ) ) ;