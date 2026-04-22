/*
 * This file contains the main application logic for processing train data.
 * It uses a custom Inputer class to parse input data.
 */

"use strict"
; // Enforce strict mode for better code quality.

/**
 * The primary function that orchestrates the data processing.
 *
 * @param {string} input - The raw input string containing all data.
 */
function Main(  input  )
{
    // Initialize an Inputer instance to handle input parsing.
    let I = new Inputer(input)
    ;

    // Read the number of stations (N), number of trains (M), and number of queries (Q).
    let N = I.getInt(), M = I.getInt(), Q = I.getInt()
    ;

    /*
     * Initialize a 2D array 'T' to store train counts.
     * T[i][j] will eventually store the cumulative count of trains
     * that start at or before station 'i' and end at or before station 'j'.
     * The array is N+1 x N+1 to allow 1-based indexing for stations.
     */
    let T = new Array(N + 1).fill(0).map( ( ) => new Array(N + 1).fill(0) )
    ;

    // Process each train's route.
    for ( let m = 0; m < M; m ++ ) {
        // Read the starting station (l) and ending station (r) for the current train.
        let l = I.getInt(), r = I.getInt()
        ;

        // Increment the count for trains starting at 'l' and ending at 'r'.
        T[l][r] += 1
        ;
    }

    /*
     * Calculate the 2D prefix sums for the 'T' array.
     * After this loop, T[p][q] will represent the total number of trains
     * that start at any station from 1 to 'p' AND end at any station from 1 to 'q'.
     * This is a standard technique for efficient range sum queries.
     */
    for ( let p = 1; p <= N; p ++ )
    {
        for ( let q = 1; q <= N; q ++ )
        {
            // Apply the formula for 2D prefix sums:
            // T[p][q] = current_value + T[p-1][q] + T[p][q-1] - T[p-1][q-1]
            // The 'current_value' is already in T[p][q] from the previous loop.
            T[p][q] += ( T[p - 1][q] + T[p][q - 1] - T[p - 1][q - 1] )
            ;
        }
    }

    // Process each query.
    for ( let n = 0; n < Q; n ++ )
    {
        // Read the query parameters: starting station 'p' and ending station 'q'.
        // We need to find trains that *start* in [p, q] and *end* in [p, q].
        let p = I.getInt(), q = I.getInt()
        ;

        /*
         * Calculate the number of trains that both start and end within the range [p, q].
         * This is derived from the 2D prefix sums:
         * Total trains ending at or before 'q' and starting at or before 'q'
         * MINUS
         * Total trains ending at or before 'q' and starting at or before 'p-1'
         * This effectively gives trains starting in [p, q] and ending in [1, q].
         * Since the problem implies trains must end *after* they start, and we're looking
         * for trains within a specific range [p, q] for both start and end,
         * T[q][q] gives trains starting in [1, q] and ending in [1, q].
         * T[p-1][q] gives trains starting in [1, p-1] and ending in [1, q].
         * Subtracting these gives trains starting in [p, q] and ending in [1, q].
         * Given the constraints of the problem, trains starting at 'l' and ending at 'r' where l <= r,
         * and the query asks for (p, q) implying trains starting from p to q and ending from p to q,
         * the formula T[q][q] - T[p-1][q] effectively counts trains that start in [p, q] and end in [p, q].
         * This is because T[x][y] includes only trains where start <= end.
         * And we only care about trains that end at or before 'q', and start at or after 'p'.
         */
        console.log( T[q][q] - T[p - 1][q] )
        ;
    }
}


/**
 * A utility class to parse input data efficiently.
 */
class Inputer {

    /**
     * Constructs an Inputer instance.
     *
     * @param {string} input - The raw input string.
     */
    constructor ( input )
    {
        // Initialize a counter for tracking the current item.
        this.cnt = 0
        ;

        // Split the input string into an array of items,
        // using newlines or spaces as delimiters.
        this.items = input.split(/\n|\s/)
        ;
    }

    /**
     * Retrieves the next integer from the input stream.
     *
     * @returns {number} The parsed integer.
     */
    getInt()
    {
        // Convert the string item to a number using unary minus operator.
        // The post-increment operator `cnt++` fetches the current item then increments the counter.
        return this.items[this.cnt++] - 0
        ;
    }

    /**
     * Retrieves an array of N integers from the input stream.
     *
     * @param {number} N - The number of integers to retrieve.
     * @returns {number[]} An array containing N integers.
     */
    getIntArray(N)
    {
        // Create a new array to store the integers.
        let a = new Array(N)
        ;

        // Populate the array by calling getInt() N times.
        for ( let n = 0; n < N; n ++ ) a[n] = this.getInt()
        ;

        return a
        ;
    }

    /**
     * Retrieves the next string from the input stream.
     *
     * @returns {string} The next string item.
     */
    getStr()
    {
        // Fetch the current string item and then increment the counter.
        return this.items[this.cnt++]
        ;
    }

    /**
     * Retrieves an array of N strings from the input stream.
     *
     * @param {number} N - The number of strings to retrieve.
     * @returns {string[]} An array containing N strings.
     */
    getStrArray( N )
    {
        // Create a new array to store the strings.
        let a = new Array(N)
        ;

        // Populate the array by calling getStr() N times.
        for ( let n = 0; n < N; n ++ ) a[n] = this.getStr()
        ;

        return a
        ;
    }
}


/*
 * This block handles execution context.
 * If running in a Node.js-like environment (where 'window' is undefined),
 * it reads input from standard input and calls the Main function.
 * Otherwise, it's assumed to be in a browser or testing environment.
 */
if ( typeof window == "undefined" )
    Main( require("fs").readFileSync("/dev/stdin", "utf8") )
; // End of script.