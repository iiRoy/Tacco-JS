/*
 * This JavaScript module processes two strings, 's' and 't',
 * read from standard input. It effectively simulates a matching
 * process where characters from 't' are found in a doubled
 * version of 's'.
 */
console.log(
    ( args => { // Define an immediately invoked function expression (IIFE)
        // Extract the two input strings, 's' and 't', from the arguments.
        // The input is trimmed and split by newline characters.
        const [ s , t ] = args .trim() .split`\n`;

        // Initialize a 2D array 'c' to store indices of each character
        // from 's'. There are 26 sub-arrays, one for each lowercase English letter.
        const c = Array .from( { length : 26 } , _ => [ ] );

        // Get the lengths of string 's' and string 't' for loop boundaries.
        const sl = s .length , tl = t .length;

        // Populate 'c' with indices of each character in 's'.
        // Each character's index is stored in the sub-array corresponding
        // to its ASCII value (minus 97 for 'a').
        for ( let i = 0 ; i < sl ; i ++ )
            c[ s .charCodeAt( i ) - 97 ] .push( i );

        // Duplicate the indices in 'c' to simulate a doubled string 's'.
        // This allows for seamless wrapping around when searching.
        for ( let i = 0 ; i < sl ; i ++ )
            c[ s .charCodeAt( i ) - 97 ] .push( i + sl );

        // Initialize an array 'o' to keep track of the current search
        // offset for each character type in 'c'.
        const o = Array( 26 ) .fill( 0 );

        // Initialize 'i' as the current position in the simulated doubled string,
        // and 'cyc' to count full cycles through the original string 's'.
        let i = -1 , cyc = 0;

        // Iterate through each character of string 't'.
        for ( let j = 0 ; j < tl ; j ++ )
        {
            // Calculate the character code for the current character in 't'.
            // This is used as an index for the 'c' and 'o' arrays.
            const x = t .charCodeAt( j ) - 97;

            // Get the total number of occurrences (indices) for character 'x'
            // stored in the array 'c'.
            const l = c[ x ] .length;

            // If the character 't[j]' does not exist in 's' (i.e., its
            // corresponding array in 'c' is empty), then a match is impossible.
            // Return '-1' as per problem specification.
            if ( ! l )
                return '-1';

            // Find the next available index for character 'x' that is greater
            // than the current position 'i'.
            // The inner loop advances 'o[x]' until a suitable index is found
            // or all indices for 'x' have been checked.
            for ( ; o[ x ] < l ; o[ x ] ++ )
                if ( i < c[ x ][ o[ x ] ] )
                    break;

            // If we've exhausted all available indices for 'x' that are greater
            // than 'i' in the current cycle, it means we need to wrap around.
            // This condition is implicitly handled by the next block after this.
            // Assign the found index to 'i'.
            i = c[ x ][ o[ x ] ];

            // Check if the current position 'i' has exceeded the length of
            // the original string 's'. This indicates a new cycle.
            if ( i >= sl )
            {
                // Increment the cycle counter.
                cyc ++;

                // Adjust 'i' back to be relative to the original string length.
                i -= sl;

                // Reset all character offsets in 'o' to 0 for the new cycle.
                // This ensures we start searching from the beginning of 's'
                // for subsequent characters in 't'.
                o .fill( 0 );
            }
            // End of conditional block for new cycle detection.
        } // End of main loop over 't' characters.

        // Calculate the final result: total cycles * length of 's' +
        // the final position in the current cycle (plus one for 1-based indexing).
        return `${ cyc * sl + i + 1 }`;

    } ) (
        // Read the input from '/dev/stdin' synchronously using 'fs' module.
        // The input is read as UTF-8 encoded text.
        require( 'fs' ) .readFileSync( '/dev/stdin' , 'utf8' )
    ) // End of IIFE invocation.
); // End of console.log call.

// This entire script calculates the minimum length of a string that can be
// formed by concatenating 's' multiple times, such that 't' is a subsequence
// of this concatenated string.