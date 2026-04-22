/* This file contains a JavaScript program designed to solve a dynamic programming problem.
 * It uses a custom input parsing utility to read data from standard input.
 * The core logic calculates probabilities based on a sequence of events.
 */

// Define a self-executing anonymous function (IIFE) to create a factory for input parsing.
var GET = (function () {

    /*
     * This is the public factory function returned by the IIFE.
     * It takes a string 's' (the raw input) and returns a new instance of the 'g' parser.
     */
    function f( s ) {

        return new g(s);

    }

    // Constructor function for the input parser.
    function g( s ) {

        // Store the processed input string as an array of lines.
        // It trims the input and splits it by newline characters.
        this._s = s . trim() . split( "\n" ) ;

        // Initialize the current line index to 0.
        this._y = 0 ;
    }

    // Prototype method 'a' for reading a single item from the current line.
    g.prototype.a = function ( f ) {

        // Get references to the internal string array and current line index.
        var s = this._s,
            y = this._y,
            r ;

        // If the current line hasn't been split into items yet, do so and reverse it.
        // Reversing allows efficient popping from the end.
        if ( typeof s[y] === "string" )
        {
            s[y] = s[y].split( " " ).reverse() ;
        }

        // Pop the last item (which was originally the first) from the current line.
        r = s[y] . pop() ;

        // If the current line is now empty, advance to the next line.
        if ( !s[y].length ) {
            this._y ++ ;
        }

        // Return the item. If 'f' (format as string) is true, return as string; otherwise, convert to number.
        return f ? r : +r ;
    } ;


    // Prototype method 'l' for reading an entire line of items.
    g.prototype.l = function ( f ) {

        // Get the current line, split it by spaces, and then advance to the next line.
        var s = this._s[ this._y ++ ] . split( " " ) ;

        // Return the array of items. If 'f' is true, return as strings; otherwise, convert all to numbers.
        return f ? s : s . map( a => +a ) ;
    } ;

    // Prototype method 'm' for reading a matrix (multiple lines, each split into items).
    g.prototype.m = function ( n, f ) {

        // Slice 'n' lines from the input, split each line by spaces, and advance the line index.
        var r = this._s . slice( this._y, this._y += n ) . map( a => a . split( " " ) ) ;

        // Return the matrix. If 'f' is true, return as strings; otherwise, convert all elements to numbers.
        return f ? r : r . map( a => a . map( a => +a ) ; ) ;

    } ;

    // Prototype method 'r' for reading raw lines (no splitting by spaces).
    g.prototype.r = function ( n, f ) {

        // Slice 'n' lines from the input and advance the line index.
        var r = this._s . slice( this._y, this._y += n ) ;

        // Return the array of lines. If 'f' is true, return as strings; otherwise, convert all to numbers.
        return f ? r : r . map( a => +a ) ;

    } ;

    // The IIFE returns the factory function 'f'.
    return f ;

})() ; // End of the input parsing utility definition.


// Instantiate the input parser 'o' by reading content from /dev/stdin.
// 'fs.readFileSync' is used to get the file content, and 'utf8' specifies the encoding.
var o = GET(require("fs").readFileSync("/dev/stdin","utf8"));

// Call the main function and print its return value to the console.
console . log( main() ) ;


/**
 * Main function containing the core logic of the program.
 * It calculates probabilities using dynamic programming.
 * @returns {number} The final calculated probability.
 */
function main() {

    // Read the integer 'n' from the input using the parser.
    var n = o . a() ;

    // Read an array of probabilities 'p' from the input.
    var p = o . l() ;

    // Initialize the dynamic programming array 'dp'.
    // dp[0] represents the probability of 0 successes, dp[1] for 1 success after the first event.
    var dp = [ 1 - p[0], p[0] ] ;

    // Loop through the remaining events (from the second event up to 'n').
    for ( var i = 1 ; i < n ; i ++ ) {

        // Calculate the probability of having 'i + 1' successes after the current event 'i'.
        // This is the probability of 'i' successes up to the previous event, multiplied by the success probability of the current event.
        dp[i+1] = dp[i] * p[i] ;

        // Inner loop: Iterate backwards to update dp values for 'j' successes.
        // This is crucial for correct DP calculation as it uses dp[j-1] from the *previous* iteration.
        for ( var j = i ; j > 0 ; j-- ) {

            // DP transition:
            // Probability of 'j' successes = (Probability of 'j-1' successes previously * current event's success probability)
            //                               + (Probability of 'j' successes previously * current event's failure probability)
            dp[j] = dp[j-1] * p[i] + dp[j] * ( 1 - p[i] ) ;

        }

        // Update dp[0]: Probability of 0 successes after the current event.
        // This is the probability of 0 successes previously, multiplied by the current event's failure probability.
        // Note: The 'j' here is 0 from the loop termination, so dp[j] is dp[0] before the update.
        dp[0] = dp[j] * ( 1 - p[i] ) ;

    }

    // Initialize the answer variable.
    var ans = 0 ;

    // Sum up the probabilities for 'i' successes where 'i' is at least (n+1)/2.
    // This represents the condition for the problem being solved (e.g., majority of successes).
    for ( i = ( n + 1 ) / 2 ; i <= n ; i ++ ) {
        ans += dp[i] ;
    }

    // Return the final calculated answer.
    return ans ;

}