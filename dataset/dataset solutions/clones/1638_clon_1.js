function Main ( input ) {
    // This is the main function that processes the input data.
    // The 'input' parameter is expected to be a single string containing all input lines.

    input = input.split( "\n" ) ; // First, split the input string into an array of lines.

    // The first line contains N and Q, representing the size of the array and the number of queries.
    // We parse them as integers after splitting by space.
    const [ n , q ] = input.shift().split( " " ).map( ( a ) => parseInt( a , 10 ) ) ;

    // The second line contains the array 'a' itself.
    // We parse each element as an integer.
    const a = input.shift().split( " " ).map( ( a ) => parseInt( a , 10 ) ) ;

    // Initialize an array 'pi' (previous index) to keep track of the last seen position
    // for each number. It's initialized with -1, indicating no previous occurrence.
    const pi = new Array( n + 1 ).fill( -1 ) ;

    // Initialize 'ps' (previous positions) as an array of arrays.
    // ps[l] will store a list of indices 'i' such that a[i] had its previous occurrence at 'l'.
    const ps = new Array( n + 1 ) ;
    for ( let i = 0 ; i < ps.length ; i ++ ) {
        ps[ i ] = [] ; // Each element is an empty array to start.
    }

    /*
     * This loop iterates through the input array 'a' to populate the 'ps' array.
     * For each element a[i], it checks its previous occurrence.
     * If a previous occurrence 'l' exists, it means a[i] is a re-occurrence,
     * and 'i' is added to the list ps[l].
     * Then, 'pi[a[i]]' is updated to the current index 'i'.
     */
    for ( let i = 0 ; i < n ; i ++ ) {
        const l = pi[ a[ i ] ] ; // Get the index of the previous occurrence of a[i].

        if ( l !== -1 ) {
            ps[ l ].push( i ) ; // If it's not the first time seeing a[i], record this current index.
        }
        pi[ a[ i ] ] = i ; // Update the last seen index for a[i] to the current index 'i'.
    }


    // --- Preprocessing Queries ---

    // Initialize 'qs' (queries) as an array of arrays.
    // qs[l] will store all queries that start at index 'l'.
    // Each query is stored as [r, original_query_index].
    const qs = new Array( n + 1 ) ;
    for ( let i = 0 ; i < qs.length ; i ++ ) {
        qs[ i ] = [] ; // Initialize each entry of 'qs' to an empty array.
    }

    // Read and store all 'q' queries.
    for ( let qi = 0 ; qi < q ; qi ++ ) {
        let [ l , r ] = input[ qi ].split( " " ).map( ( a ) => parseInt( a , 10 ) ) ;

        // Convert 1-based input indices to 0-based indices.
        --l ;
        --r ;

        qs[ l ].push( [ r , qi ] ) ; // Store the query: right boundary and its original index.
    }

    // Initialize 'ans' array to store the results for each query.
    // The results will be stored at their original query indices.
    const ans = [] ;


    // --- Fenwick Tree (BIT) for Efficient Query Answering ---

    // Create a Fenwick Tree (BIT) 'd'.
    // The BIT will be used to count elements efficiently within ranges.
    const d = new Array( n + 1 ).fill( 0 ) ;

    // Iterate backwards through the array 'a' from n-1 down to 0.
    // This allows us to process 'ps' entries and 'qs' entries in the correct order
    // for the Fenwick Tree.
    for ( let x = n - 1 ; x >= 0 ; --x ) {
        // Process 'ps' entries for the current index 'x'.
        // These are indices 'di' where a number starting at 'x' re-occurs.
        const psLength = ps[ x ].length ;
        for ( let y = 0 ; y < psLength ; y ++ ) {
            let di = ps[ x ][ y ] ; // 'di' is an index where a number re-appeared.

            // Update the Fenwick Tree at 'di + 1' (BIT is 1-indexed).
            // Incrementing 'd[di+1]' signifies that an element starting at 'x'
            // has a duplicate at 'di'.
            for ( di ++ ; di <= this.n ; di += di & -di ) {
                d[ di ] += 1 ;
            }
        }

        // Process all queries that start at the current index 'x'.
        const qsLength = qs[ x ].length ;
        for ( let y = 0 ; y < qsLength ; y ++ ) {
            const [ r , i ] = qs[ x ][ y ] ; // Extract right boundary and original query index.

            let sum = 0 ; // Initialize sum for the BIT query.
            let ri = r ; // 'ri' is used for BIT query (1-indexed).

            // Query the Fenwick Tree to find the sum of re-occurrences up to 'r'.
            // This sum represents the count of numbers that have duplicates within [x, r].
            for ( ri ++ ; ri ; ri -= ri & -ri ) {
                sum += d[ ri ] ;
            }

            // Calculate the final answer for the current query.
            // The total number of elements in the range [x, r] is (r - x + 1).
            // Subtracting 'sum' (count of re-occurrences) gives the count of unique elements.
            ans[ i ] = ( r - x + 1 ) - sum ;
        }
    }

    // After processing all indices and queries, print the results.
    for ( let i = 0 ; i < q ; i ++ ) {
        console.log( ans[ i ] ) ; // Output each answer on a new line.
    }

    return ; // End of the Main function.
}

// This line reads the input from standard input and calls the Main function.
// It uses Node.js 'fs' module to read the file /dev/stdin.
Main( require( "fs" ).readFileSync( "/dev/stdin" , "utf8" ) ) ;