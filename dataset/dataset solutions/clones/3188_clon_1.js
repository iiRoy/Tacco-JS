/*
 * This is a utility module for parsing input.
 * It provides various methods to read different data structures from a string.
 */
var   GET = (

    function (  ) { // Anonymous function wrapper for scope isolation.

        /**
         * Factory function to create a new parser instance.
         * @param {string} s - The input string to parse.
         * @returns {g} A new instance of the parser.
         */
        function f ( s ) {
            return new g ( s ) ;
        }

        /*
         * The core parser class.
         * Initializes with an input string, processing it into an array of lines.
         */
        function   g ( s ) {
            this . _s = s . trim ( ) . split ( "\n" ) ; // Store the lines, trimmed and split.
            this . _y = 0 ;                              // Initialize current line index to 0.
        }

        /**
         * Method 'a': Reads a single value from the current line.
         * If the line is exhausted, it moves to the next.
         * @param {boolean} f - If true, returns the value as a string; otherwise, as a number.
         * @returns {string|number} The parsed value.
         */
        g . prototype . a = function ( f ) {

            var s = this . _s ,  // Reference to the array of lines.
                y = this . _y ,  // Current line pointer.
                r ;              // Variable to hold the result.

            // If the current line is still a raw string, split it and reverse for easy popping.
            if ( typeof s [ y ] === "string" ) {
                s [ y ] = s [ y ] . split ( " " ) . reverse ( ) ;
            }

            r = s [ y ] . pop ( ) ; // Pop the last element (which was the first before reversing).

            // If the current line is now empty, advance to the next line.
            if ( ! s [ y ] . length ) {
                this . _y ++ ;
            }

            // Return the result, either as a string or a number based on the 'f' flag.
            return f ? r : + r ;
        } ;


        /**
         * Method 'l': Reads an entire line as an array of values.
         * @param {boolean} f - If true, returns array of strings; otherwise, array of numbers.
         * @returns {Array<string|number>} An array of parsed values from the line.
         */
        g . prototype . l = function ( f ) {
            var s = this . _s [ this . _y ++ ] . split ( " " ) ; // Get current line, split by space, then increment line index.
            // Map to numbers if 'f' is false, otherwise return as strings.
            return f ? s : s . map ( a => + a ) ;
        } ;


        /**
         * Method 'm': Reads a matrix (multiple lines), where each line is an array of values.
         * @param {number} n - The number of lines to read for the matrix.
         * @param {boolean} f - If true, returns a matrix of strings; otherwise, a matrix of numbers.
         * @returns {Array<Array<string|number>>} A 2D array (matrix).
         */
        g . prototype . m = function ( n , f ) {
            // Slice 'n' lines from the input, then map each line to an array of strings.
            var r = this . _s . slice ( this . _y , this . _y += n ) . map ( a => a . split ( " " ) ) ;
            // If 'f' is false, further map all inner elements to numbers.
            return f ? r : r . map ( a => a . map ( a => + a ) ) ;
        } ;


        /**
         * Method 'r': Reads 'n' raw lines (without splitting values within the line).
         * @param {number} n - The number of lines to read.
         * @param {boolean} f - If true, returns an array of strings; otherwise, an array of numbers.
         * @returns {Array<string|number>} An array of lines.
         */
        g . prototype . r = function ( n , f ) {
            // Slice 'n' lines directly from the input.
            var r = this . _s . slice ( this . _y , this . _y += n ) ;
            // If 'f' is false, map each line to a number.
            return f ? r : r . map ( a => + a ) ;
        } ;


        return f ; // Return the factory function 'f'.

    } ) ( ) ; // Execute the anonymous function immediately.


// Initialize the input parser 'o' by reading data from standard input.
// The 'require("fs")' module is used for file system operations.
var o = GET ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;


/*
 * Main program execution block.
 * Calls the 'main' function and prints its return value to the console.
 */
console . log ( main ( ) ) ;


/**
 * The primary business logic function for the program.
 * It reads input using the 'o' parser, performs calculations, and returns the result.
 *
 * Problem description (inferred):
 * Given N people and M food items.
 * For each person, a list of food items they like is provided.
 * The goal is to find how many food items are liked by ALL N people.
 *
 * @returns {number} The count of food items liked by everyone.
 */
function main ( ) {

    // Read the number of people (N).
    var n = o . a ( ) ;

    // Read the number of food items (M).
    var m = o . a ( ) ;


    // Initialize an array 'x' of size 'm' (number of food items)
    // with all elements set to 0. This array will count how many
    // people like each specific food item.
    var x = Array ( m ) . fill ( 0 ) ;

    // Initialize the answer variable.
    // Note: 'ans' is implicitly global here as it's not declared with 'var', 'let', or 'const'.
    ans = 0 ;


    // Loop through each of the 'n' people.
    for ( var i = 0 ; i < n ; i ++ ) {

        // Read the list of food items liked by the current person.
        // 't[0]' contains the count of items this person likes.
        // 't[1]', 't[2]', ... contain the actual food item indices (1-based).
        var t = o . l ( ) ;

        // Iterate through the specific food items liked by this person.
        // The loop starts from index 1 because t[0] is the count.
        for ( var j = 1 ; j <= t [ 0 ] ; j ++ ) {

            // Increment the counter for the specific food item.
            // We subtract 1 from t[j] to convert the 1-based index to a 0-based array index.
            x [ t [ j ] - 1 ] ++ ;

        }

    }


    // After processing all people, iterate through the food items
    // to find out which ones were liked by everyone.
    for ( i = 0 ; i < m ; i ++ ) {

        // If the count for a food item 'i' is equal to 'n' (total number of people),
        // it means this item was liked by every single person.
        if ( x [ i ] === n ) {

            // Increment the total count of universally liked food items.
            ans ++ ;

        }

    }


    // Return the final answer.
    return ans ;

}