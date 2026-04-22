console.log(
    /*
     * This is an immediately-invoked function expression (IIFE)
     * which takes input from standard input, processes it,
     * and then prints the result to the console.
     */
    function( args )
    {
        // First, we trim the input, split it by newlines,
        // and then split each line by spaces to get a 2D array of strings.
        const tmp = args
            .trim()
            .split( '\n' )
            .map( r => r.split( ' ' ) );

        // Extract 'N' from the first element of the first line, converting it to an integer.
        // The |0 ensures it's treated as an integer.
        const N = tmp.shift()[ 0 ] | 0;

        // The remaining first line contains the probabilities 'p', parsed as floats.
        const p = tmp[ 0 ] .map( parseFloat );

        // Initialize a 2D array 'dp' for dynamic programming.
        // dp[i][j] will store the probability of having 'j' heads after 'i' coin tosses.
        const dp = Array( N )
            .fill( 0 )
            .map( r => Array( N + 1 )
                .fill( .0 )
            );

        // Base cases for the first coin toss (index 0).
        // Probability of 0 heads after 1 toss (i.e., it was a tail).
        dp[ 0 ][ 0 ] = 1.0 - p[ 0 ];

        // Probability of 1 head after 1 toss (i.e., it was a head).
        dp[ 0 ][ 1 ] = p[ 0 ];

        // Iterate through the coins from the second coin (index 1) up to the (N-1)-th coin.
        for ( let i = 0; i < N - 1; i++ )
        {
            // For each coin 'i', iterate through all possible number of heads 'j'
            // accumulated up to this point (from 0 to i+1).
            for ( let j = 0; j <= i + 1; j++ )
            {
                // If the current coin (i+1) is a head:
                // Add the probability of having 'j' heads at coin 'i'
                // multiplied by the probability of coin (i+1) being a head,
                // to the state dp[i+1][j+1] (j+1 heads after i+1 coins).
                dp[ i + 1 ][ j + 1 ] += dp[ i ][ j ] * p[ i + 1 ];

                // If the current coin (i+1) is a tail:
                // Add the probability of having 'j' heads at coin 'i'
                // multiplied by the probability of coin (i+1) being a tail,
                // to the state dp[i+1][j] (j heads after i+1 coins).
                dp[ i + 1 ][ j ] += dp[ i ][ j ] * ( 1.0 - p[ i + 1 ] );
            }
        }

        // The final result is the sum of probabilities for having at least (N+1)/2 heads
        // after N coin tosses (which are stored in dp[N-1]).
        return dp[ N - 1 ]
            .slice( ( N + 1 ) / 2 ) // Get the probabilities for the desired range of heads.
            .reduce( ( a, b ) => a + b ) // Sum these probabilities.
            .toString(); // Convert the final sum to a string for output.
    }(
        // Read the entire content of /dev/stdin as a UTF-8 string.
        require( 'fs' )
            .readFileSync( '/dev/stdin', 'utf8' )
    )
);