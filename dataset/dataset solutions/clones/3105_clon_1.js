function   Main  ( input )
{
    'use strict' ; // Enforce strict parsing and error handling for better code quality and fewer silent errors.


    const n = parseInt ( input . split ( "\n" ) . shift ( ) ) ; // Extract the first line of input, which is expected to be an integer 'N', and parse it.

    const charList = [ "A" , "T" , "G" , "C" ] ; // Define the set of allowed characters (nucleotides) for sequence generation.

    const div = 1000000007 ; // Define a large prime number for modulo operations to prevent integer overflow in counts.

    let obj = [ ] ; // Initialize a dynamic array (used as a hash map) to store valid 3-character suffixes and their current counts.

    const tmpObj = [ ] ; // Initialize a temporary array (also used as a hash map) to hold zero counts for resetting 'obj' in iterations.

    // This Immediately Invoked Function Expression (IIFE) pre-populates the 'obj' map
    // with all valid 3-character sequences that do not contain "ACG", "AGC", or "GAC".
    ( function addChar ( init ) {
        const queue = [ init ] ; // Start with an empty string in a queue for breadth-first generation.

        while ( queue . length !== 0 ) // Continue as long as there are strings to process in the queue.
        {
            const str = queue . shift ( ) ; // Dequeue the next string to process.

            if ( str . length !== 3 ) // If the string has not yet reached the target length of 3.
            {
                // Append each character from charList to the current string and enqueue the new strings.
                charList . forEach ( char => queue . push ( str + char ) ) ;
            }
            else // If the string has reached exactly 3 characters.
            {
                // Check if the 3-character string contains any of the forbidden patterns.
                // Forbidden patterns for 3-char sequences: ACG, AGC, GAC.
                if ( ! str . match ( /ACG|AGC|GAC/ ) )
                {
                    obj [ str ] = 1 ; // If valid, initialize its count to 1 in 'obj'.
                    tmpObj [ str ] = 0 ; // And initialize its count to 0 in 'tmpObj' for later use.
                }
            }
        }
    } ) ( "" ) ; // Invoke the function immediately with an empty string to start the generation.


    // Handle the base case where N is 3.
    // In this scenario, we simply need to count the number of distinct valid 3-character sequences found.
    if ( n === 3 )
        console . log ( Object . keys ( obj ) . length ) ; // Output the total count of unique valid 3-char sequences.
    else // For N > 3, we need to iteratively build up the sequences.
    {
        // Loop N - 3 times because we start with 3-character sequences and add one character per iteration.
        for ( let i = 0 ; i < n - 3 ; i ++ )
        {
            // Create a new object for this iteration, initialized with zero counts for all valid 3-char suffixes.
            const newObj = Object . assign ( [ ] , tmpObj ) ;

            // Iterate over each valid 3-character suffix currently stored in 'obj'.
            Object . keys ( obj ) . forEach ( key =>
            {
                const val = obj [ key ] ; // Retrieve the count for the current 3-character suffix.

                // For each character in our allowed list, attempt to append it to the current 'key'.
                charList . forEach ( char =>
                {
                    const newStr = key + char ; // Form a new 4-character string by appending 'char'.

                    // Check for forbidden patterns in the newly formed string.
                    // Forbidden patterns: ACG, AGC, GAC (within the 4-char string),
                    //                     AG.C (e.g., AGTC), A.GC (e.g., ATGC).
                    // This check considers patterns that might span across the 3-char suffix and the new char.
                    if ( ! newStr . match ( /ACG|AGC|GAC|AG.C|A.GC/ ) )
                    {
                        // If the new 4-character string is valid, update the count for its last 3 characters (suffix).
                        // Add the value (modulo div) to the corresponding suffix in 'newObj'.
                        newObj [ newStr . slice ( -3 ) ] += val % div ;
                    }
                } ) ;
            } ) ;
            obj = newObj ; // After processing all extensions, update 'obj' with the new counts for the next iteration.
        }

        // After all iterations, sum up the counts of all valid 3-character suffixes in the final 'obj'.
        // The result is taken modulo 'div'.
        console . log ( Object . keys ( obj ) . reduce ( ( acc , curr ) => acc + obj [ curr ] , 0 ) % div ) ;
    }
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;