// This script reads input from stdin, processes it, and prints the result.
// It's designed to solve a specific algorithmic problem related to selecting books.

// Import the 'fs' (file system) module to read from the file system.
const input = require( "fs" ) . readFileSync( "/dev/stdin" , "utf8" ) ;

// --- Start of Immediately Invoked Function Expression (IIFE) ---
// This pattern encapsulates the main logic of the script.
; ( ( input_data_string ) => {

    // Split the entire input string into an array of lines.
    const lines = input_data_string . split( "\n" ) ;

    // Parse the first line to get N (number of books), M (number of understanding levels), and X (target understanding level).
    // The values are space-separated and converted to numbers.
    const [ N , M , X ] = lines[ 0 ] . split( " " ) . map( Number ) ;

    // Initialize an array `C` to store the costs of each book.
    const C = [ ] ;

    // Initialize an array `A` to store the understanding levels provided by each book for each skill.
    const A = [ ] ;

    // Loop through the remaining lines (from the second line onwards) to populate C and A.
    for ( let i = 0 ; i < N ; i ++ ) {

        // Split each line into numbers representing book cost and skill understanding levels.
        const row = lines[ i + 1 ] . split( " " ) . map( Number ) ;

        // The first element of the row is the cost of the book.
        C[ i ] = row[ 0 ] ;

        // The rest of the elements are the understanding levels for each skill.
        // `splice(1)` extracts elements from index 1 onwards and modifies the original `row` array.
        A[ i ] = row . splice( 1 ) ;
    }

    // --- Combination Generation Logic ---
    // `ss` will store all possible combinations (subsets) of book indices.
    var ss = [ ] ;

    // Iterate `n` from 1 to N to generate combinations of `n` books.
    for ( var n = 1 ; n <= N ; n ++ ) {

        // `s` represents the current combination being built (stores book indices).
        let s = [ ] ;

        // `d` is the current depth (number of elements in `s`).
        let d = 0 ;

        // `v` is the last added book index, initialized to -1.
        let v = -1 ;

        // This `while` loop implements a non-recursive combination generation algorithm.
        while ( v !== undefined ) {

            // If the current combination `s` has `n` elements, it's a complete combination.
            if ( d === n ) {

                // Add a copy of the current combination `s` to the `ss` array.
                ss . push( [ ... s ] ) ;

                // Backtrack: remove the last element from `s`.
                s . pop ( ) ;

                // Decrease the depth.
                d -- ;

            } else if ( v >= N - 1 ) { // If `v` has reached the maximum possible index (N-1), or gone past it,

                // It means we can't increment `v` further for the current depth, so backtrack.
                v = s . pop ( ) ;

                // Decrease the depth.
                d -- ;

            } else { // Otherwise, increment `v` and add it to the current combination.

                // Increment `v` to consider the next book index.
                v ++ ;

                // Add the new book index to the current combination.
                s . push ( v ) ;

                // Increase the depth.
                d ++ ;
            }
        }
    }

    // --- Processing Combinations ---

    // `t` will store the minimum cost found, initialized to a very large number (Infinity).
    let t = Infinity ;

    // `books` will temporarily hold a combination popped from `ss`.
    let books = null ;

    // Process each combination of books generated earlier.
    // The `while` loop continues as long as `ss.pop()` returns a valid combination (not `null` or `undefined`).
    while ( ( books = ss . pop ( ) ) ) {

        // `c` stores the total cost for the current combination of books.
        let c = 0 ;

        // `s` stores the total understanding levels for each skill for the current combination.
        // It's initialized to an array of `M` zeros.
        let s = Array ( M ) . fill ( 0 ) ;

        // Iterate over each book index in the current `books` combination.
        books . forEach ( book_index => {

            // For each skill (from 0 to M-1), add the understanding level from the current book.
            for ( let i = 0 ; i < M ; i ++ ) {

                s[ i ] += A[ book_index ][ i ] ;
            }

            // Add the cost of the current book to the total cost `c`.
            c += C[ book_index ] ;
        } ) ;

        // Check if all skill understanding levels in `s` meet or exceed the target `X`.
        // `Math.min(...s)` finds the minimum understanding level across all skills.
        if ( Math . min ( ... s ) >= X ) {

            // If the condition is met, update `t` with the minimum of its current value and `c`.
            t = Math . min ( t , c ) ;
        }
    }

    // --- Output Result ---

    // If `t` is still Infinity, it means no combination of books met the criteria, so output -1.
    // Otherwise, output the minimum cost `t`.
    console . log ( t === Infinity ? -1 : t ) ;

} ) ( input ) ; // Pass the input string to the IIFE.
// --- End of Immediately Invoked Function Expression (IIFE) ---