"use strict"
// This is the beginning of our JavaScript program.
// It uses strict mode for cleaner code and error handling.




    const main = arg => { // Define the main function that takes 'arg' as input

        // Parse input values from the 'arg' string.
        // N represents the number of elements or rows.
        const N = parseInt(arg.split("\n")[0].split(" ")[0]) ;
        // Q represents the number of queries to process.
        const Q = parseInt(arg.split("\n")[0].split(" ")[1]) ;
        // S is an array of characters, obtained from the second line of input.
        const S = arg.split("\n")[1].split("") ;
        // lr stores the query ranges, sliced from the input.
        const lr = arg.split("\n").slice(2, N + 1) ;

        // Initialize a dynamic programming array 'dp' of size N, filled with zeros.
        let dp = new Array(N).fill(0) ;
        // Initialize a counter 'cnt' to keep track of "AC" occurrences.
        let cnt = 0 ;

        // First loop: Iterate through the dp array to populate it with "AC" counts.
        // The 'in' operator iterates over enumerable property names (indices in this case).
        for ( let i in dp ) {
            // Check if the current character and the next character form "AC".
            if ( S[i] === "A" && S[ parseInt(i) + 1 ] === "C" ) {
                // If "AC" is found, increment the counter.
                cnt ++ ;
            }
            // Store the current count of "AC" occurrences up to the current index.
            // Note: dp[0] will remain 0, dp[1] will store count up to index 0, etc.
            // This is a common pattern for prefix sums/counts.
            dp[ parseInt(i) + 1 ] = cnt ;
        }

        // Second loop: Process each query.
        // Iterate 'Q' times, once for each query.
        for ( let i = 0 ; i < Q ; i ++ ) {
            // Parse the left boundary 'l' for the current query.
            let l = parseInt(lr[i].split(" ")[0]) ;
            // Parse the right boundary 'r' for the current query.
            let r = parseInt(lr[i].split(" ")[1]) ;

            // Calculate and print the count of "AC" occurrences within the range [l, r].
            // This is done using the precomputed prefix sums in the 'dp' array.
            // dp[r-1] gives count up to index r-2. dp[l-1] gives count up to index l-2.
            // The difference gives the count in the desired range (inclusive of l, exclusive of r).
            console.log(dp[r - 1] - dp[l - 1]) ;
        }
    } ; // End of the main function definition.

// Call the main function with input read from standard input.
// This line reads the entire content of '/dev/stdin' as a UTF-8 string and passes it to 'main'.
main(require('fs').readFileSync('/dev/stdin', 'utf8')) ; // Program execution starts here.