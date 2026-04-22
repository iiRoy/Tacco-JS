/*
 * This JavaScript file contains logic for calculating the number of valid DNA sequences.
 * It uses dynamic programming (memoization) to efficiently compute results.
 * The problem involves counting sequences of length N that do not contain certain 'AGC' permutations.
 */

const main = ( input ) =>
{
    // Convert the input string to a numerical value, representing the target sequence length N.
    const N = Number( input );


    // Call the recursive calculation function starting with an empty last-4-chars string
    // and a count of 0, then print the final result to the console.
    console.log( calc( N, "", 0 ) );
} // End of the main program entry point.


/*
 * Global map for memoization:
 * Stores previously computed results to avoid redundant calculations.
 * The key is a concatenation of the last 4 characters and the current sequence length (e.g., "AGCT_5").
 */
var map = { };

// Array of allowed nucleotide bases: Adenine, Cytosine, Guanine, Thymine.
var w = [ 'A', 'C', 'G', 'T' ];

/*
 * Recursive function to calculate the number of valid sequences of length N.
 *
 * @param {number} N    The target length of the sequence.
 * @param {string} lst4 The last 4 characters of the current sequence being built.
 *                      This is used to check for forbidden 'AGC' patterns efficiently.
 * @param {number} cnt  The current length of the sequence built so far.
 * @returns {number} The count of valid sequences that can be formed from this state.
 */
function calc( N, lst4, cnt )
{
    // Construct a unique key for the current state to check against the memoization map.
    var key = lst4 + "_" + cnt;

    // If the result for this specific state (last 4 chars and current count) is already computed,
    // return the cached value directly. This is the core of dynamic programming.
    if ( map[ key ] )
    {
        return map[ key ];
    }

    // Base case: If the current sequence length 'cnt' has reached the target length 'N',
    // then this path represents one valid sequence.
    if ( cnt == N )
    {
        // This specific sequence path contributes 1 to the total count.
        return 1;
    }

    // Initialize the accumulator for valid sequences from this state.
    var ans = 0;

    // Iterate through all possible characters ('A', 'C', 'G', 'T') to extend the current sequence.
    for ( var i = 0; i < 4; i++ )
    {
        // Form the next sequence segment by appending the current character 'w[i]'.
        var next = lst4 + w[ i ];

        // Extract the last 3 characters of the 'next' sequence.
        // This is crucial for checking the 'AGC' permutation rules.
        var next3 = ( next ).slice( -3 );

        // Extract the last 4 characters of the 'next' sequence.
        // This is used for additional 'AGC' permutation checks with an 'A' at the beginning.
        var next4 = ( next ).slice( -4 );

        // Check if the newly formed 'next' sequence, specifically its last 3 or 4 characters,
        // contains any forbidden 'AGC' permutations.
        // The conditions ensure that no 'AGC' pattern appears in any order or with a single character in between.
        if (
              next3[ 0 ] + next3[ 1 ] + next3[ 2 ] != 'AGC' && // Standard 'AGC' pattern
              next3[ 0 ] + next3[ 2 ] + next3[ 1 ] != 'AGC' && // 'ACG' pattern (A, C, G in different order)
              next3[ 1 ] + next3[ 0 ] + next3[ 2 ] != 'AGC' && // 'GAC' pattern (G, A, C in different order)

              // Additional checks for 'AGC' with an 'A' at the beginning of a 4-char suffix.
              // These capture cases like A?GC or A?CG.
              next4[ 0 ] + next4[ 1 ] + next4[ 3 ] != 'AGC' && // e.g., A_GC
              next4[ 0 ] + next4[ 2 ] + next4[ 3 ] != 'AGC'    // e.g., A_CG
        )
        {
            // If the sequence extension is valid (does not form a forbidden pattern),
            // recursively call 'calc' for the next state.
            // We pass only the last 4 characters of 'next' to keep 'lst4' bounded for memoization.
            ans += calc( N, next.slice( -4 ), cnt + 1 );
            // Apply modulo operation to the answer to prevent integer overflow.
            // The modulus used is 10^9 + 7, a common prime in competitive programming.
            ans %= 1000000007;
        }
    }

    // Store the computed answer for the current state in the memoization map
    // before returning it, so it can be reused if this state is encountered again.
    map[ key ] = ans;
    return ans; // Return the total count of valid sequences for this state.
} // End of the calc function definition.


// The program execution starts here.
// It reads the input from '/dev/stdin' (standard input), decodes it as UTF-8,
// and then passes it to the 'main' function for processing.
main( require( 'fs' ).readFileSync( '/dev/stdin', 'UTF-8' ) );
// End of the JavaScript program.