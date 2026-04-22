/*
 * This directive enables strict mode.
 * It helps in writing cleaner code and catching common errors.
 */
"use strict" ;


// Definition of the custom Input Reader class
function I ( s , f ) {

    // Store the input string, split by newlines, into an array
    this . _s = s . split ( "\n" ) ;

    // _c: current column index (token within a line)
    this . _c = 0 ;

    // _l: current line index
    this . _l = 0 ;

    // _f: parsing function, defaults to Number
    this . _f = f || Number ;

} // End of I constructor function


// Prototype method 'a' for reading a single token
I . prototype . a = function ( ) {

    // Get the current line from the stored array
    var l = this . _s [ this . _l ] ;

    // If the line is empty or undefined, return immediately
    if ( ! l ) {

        return ;

    }

    // Trim whitespace from the line and split it into tokens
    var t = l . trim ( ) . split ( " " ) ;

    // Get the token at the current column index
    var a = t [ this . _c ] ;

    // Increment the column index for the next read
    this . _c ++ ;

    // Check if all tokens on the current line have been read
    if ( t . length === this . _c ) {

        // Reset column index and move to the next line
        this . _c = 0 ;
        this . _l ++ ;

    } // End of inner if block

    // Parse and return the token using the specified function
    return this . _f ( a ) ;

} ; // End of I.prototype.a


// Prototype method 'l' for reading an entire line of tokens
I . prototype . l = function ( ) {

    // Retrieve the current line string
    var l = this . _s [ this . _l ] ;

    // If the line is undefined or null, exit early
    if ( ! l ) {

        return ;

    }

    // Reset the column index as we're reading a full line
    this . _c = 0 ;

    // Advance to the next line for subsequent reads
    this . _l ++ ;

    // Split the line into tokens and map them using the parsing function
    return l . split ( " " ) . map ( this . _f ) ;

} ; // End of I.prototype.l method definition


// Export the Input Reader class for use in other modules
module . exports = I ;


/**
 * The main function responsible for processing the input.
 * @param {string} input - The raw input string from stdin.
 */
function main ( input ) {

    // Initialize a new instance of the custom Input Reader
    const o = new I ( input ) ;


    // Read the number of nodes (N) and edges (M)
    const N = o . a ( ) ;
    const M = o . a ( ) ;


    // Initialize an adjacency list for the graph
    const adj = [ ] ;

    // Populate the adjacency list with empty arrays for each node
    for ( let i = 1 ; i <= N ; i ++ ) {

        adj [ i ] = [ ] ;

    } // End of loop for initializing adjacency list


    // Read the edges and build the adjacency list
    for ( let i = 0 ; i < M ; i ++ ) {

        let ai = o . a ( ) ; // First node of the edge
        let bi = o . a ( ) ; // Second node of the edge

        // Add undirected edges
        adj [ ai ] . push ( bi ) ;
        adj [ bi ] . push ( ai ) ;

    } // End of loop for reading edges


    // Initialize flags and counters for graph property checks
    let six = false ; // True if any node has degree >= 6
    let four = 0 ;    // Count of nodes with degree >= 4
    let flag2 = true ; // True if all nodes have even degrees (Eulerian path check)


    // Iterate through all nodes to check their degrees
    for ( let i = 1 ; i <= N ; i ++ ) {

        // Check if the current node's degree is 6 or more
        if ( adj [ i ] . length >= 6 ) {

            six = true ; // Set the 'six' flag

        } // End of if (adj[i].length >= 6)


        /* This block is commented out in the original,
         * but we can reformat its comments.
         *
         * The original check for 'four' was here:
         * if ( adj [ i ] . length >= 4 ) {
         *   four += 1 ;
         * }
         * We are keeping it commented out as per Type I clone rules.
         */


        // Check if the current node's degree is odd
        if ( adj [ i ] . length % 2 !== 0 ) {

            flag2 = false ; // If any degree is odd, flag2 becomes false

        } // End of if (adj[i].length % 2 !== 0)

    } // End of loop for node degree checks


    // Output "Yes" or "No" based on the combined conditions
    console . log ( ( ( six || four >= 2 ) && flag2 ) ? "Yes" : "No" ) ;

} // End of main function


// Call the main function with input read from standard input
main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;