( /* This is an Immediately Invoked Async Function Expression (IIAFE) */ async () => {

        // Initialize an empty string to accumulate standard input chunks.
        let input = '';

        /*
         * Asynchronously read all data from standard input.
         * Each 'chunk' is appended to the 'input' string.
         */
        for await ( const chunk of process.stdin )
                input += chunk ; // Concatenate the current chunk to the input string.


        // Split the accumulated input string into an array of lines.
        const lines = input . split ( /\n/ ) ;


        // Parse the first line to get 'n' and 'q'.
        // The values are expected to be space-separated integers.
        const [ n , q ] = lines [ 0 ] . split ( /\s/ ) . map ( v => +v ) ;

        // Parse subsequent lines to get query details.
        // Each query line is also space-separated integers.
        const querys = lines . slice ( 1 , q + 1 ) . map ( line => line . split ( /\s/ ) . map ( v => +v ) ) ;


        // Initialize an array 's' of size 'n', filled with the value 1.
        let s = new Array ( n ) . fill ( 1 ) ;


        // Define a modulus constant for calculations.
        const mod = 998244353 ;

        /**
         * Defines a function 'print' that calculates and logs
         * the numerical value represented by the array 's'
         * modulo 'mod'.
         */
        const print = ( ) => {
                let num = 0 ; // Initialize accumulator for the number.

                // Iterate through the array 's' to form the number.
                for ( let i = 0 ; i < n ; i ++ ) {
                        // Calculate (num * 10 + s[i]) % mod to build the number digit by digit.
                        num = ( num * 10 + s [ i ] ) % mod ;
                }

                // Output the final calculated number to the console.
                console . log ( num ) ;
        } ;


        // Process each query from the 'querys' array.
        for ( const query of querys ) {
                // Destructure the query array into l, r, and d.
                // Adjust l and r to be 0-indexed.
                const [ l , r , d ] = [ query [ 0 ] - 1 , query [ 1 ] - 1 , query [ 2 ] ] ;

                // Update the elements of array 's' within the range [l, r] (inclusive) to 'd'.
                for ( let i = l ; i <= r ; i ++ ) {
                        s [ i ] = d ; // Assign the new value 'd' to s[i].
                }

                // After each query, print the current state of 's' as a number.
                print ( ) ;
        }

} ) ( ) // End of the IIAFE.