function Main( input )
{
    // Process input string: split by newline character
    input = input.split( "\n" );

    /*
     * Parse the first line to get H (height), W (width), and D (step distance).
     * H is initially the entire parsed array, then reassigned to H[0].
     */
    var   H = input[0].split(" ").map(a => parseInt(a));

    var W = H[1] ; // Width of the grid
    var D = H[2]; // Step distance for calculations

    H = H[0] ; // Height of the grid

    var A; // Temporary array to store row data

    // Initialize 'x' array: stores coordinates [row, col] for each number from 1 to H*W.
    // The size is H*W+1 because numbers are 1-indexed.
    var x = new Array(H*W+1) .fill (0) .map(a => new Array(2));

    // Loop through each row of the grid to populate the 'x' array
    for ( var i = 0 ; i < H ; i++ )
    {
        // Parse the current row of numbers
        A = input[i+1].split(" ").map(a => parseInt(a));

        // Loop through each column in the current row
        for ( var j = 0 ; j < W ; j++ ) {
            // Store the row index 'i' for the number A[j]
            x[A[j]][0] = i;
            // Store the column index 'j' for the number A[j]
            x[A[j]][1] = j;
        }
    }
    // Finished populating the coordinate map 'x'

    // Get the number of queries (Q) from the input
    var Q = parseInt(input[H+1]) ;
    // Initialize an array to store answers for each query, filled with zeros
    var ans = new Array(Q).fill(0) ;

    // Iterate through each query
    for ( i = 0 ; i < Q ; i++ ) {
        // Parse the L and R values for the current query
        var L = input[H+2+i].split(" ").map(a => parseInt(a));

        var R = L[1] ; // Right boundary for the current query
        L = L[0] ; // Left boundary for the current query

        // Perform calculations until L reaches R
        while ( L !== R )
        {
            // Calculate Manhattan distance between L and L+D, and add to the current query's answer
            ans[i] += Math.abs(x[L][0] - x[L+D][0]) + Math.abs(x[L][1] - x[L+D][1]);
            // Increment L by D for the next step
            L += D;
        }
    }

    // Output the answers, each on a new line
    console.log( ans .join("\n") );
}

// Read input from stdin and pass it to the Main function
Main( require("fs").readFileSync("/dev/stdin", "utf8") );