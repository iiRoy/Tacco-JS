/*
 * This JavaScript file implements a utility for parsing input data,
 * followed by a main function that processes this data to solve a problem.
 *
 * The 'GET' utility is designed to facilitate reading structured input,
 * such as lines of numbers or matrices, from a source like standard input.
 * It provides methods to extract different data types efficiently.
 */

var GET = (

    // This is an Immediately Invoked Function Expression (IIFE).
    // It creates a private scope for the utility's internal components
    // and returns the main factory function 'f'.
    function (
    ) {

        /**
         * The primary entry point for the GET utility.
         * It constructs and returns a new parser instance based on the provided raw input string.
         *
         * @param {string} s - The complete raw string input to be parsed.
         * @returns {g} A new instance of the parser object.
         */
        function f( s )
        {
            return new g( s ) ;
        }


        /**
         * The internal parser class.
         * Manages the state of the input string and provides methods to consume it line by line.
         *
         * @param {string} s - The raw input string, expected to contain multiple lines.
         */
        function g( s )
        {
            // The input string is first trimmed to remove leading/trailing whitespace,
            // then split into an array of individual lines.
            this ._s = s . trim ( ) . split ( "\n" ) ;

            // '_y' acts as a pointer to the current line index being processed.
            this ._y = 0 ;
        }


        // --- Prototype Methods for the 'g' Parser Class ---
        // These methods define various ways to extract and parse data from the input lines.


        /**
         * Extracts a single element from the current line.
         * It intelligently handles splitting the line and advancing the element pointer.
         * If the line becomes empty after extraction, it advances to the next line.
         *
         * @param {boolean} f - A flag: if true, returns the element as a string;
         *                        otherwise, attempts to convert it to a number.
         * @returns {string | number} The parsed element.
         */
        g . prototype . a = function ( f )
        {
            var s = this ._s , // Shorthand for the lines array.
                y = this ._y , // Shorthand for the current line index.
                r ;            // Variable to hold the extracted result.

            // If the current line has not yet been split into elements (i.e., it's still a single string),
            // split it by spaces and reverse the resulting array. This allows 'pop()' to
            // effectively read elements from the *beginning* of the original line.
            if ( typeof s[ y ] === "string" )
            {
                s[ y ] = s[ y ] . split ( " " ) . reverse ( ) ;
            }

            // Extract the element. Due to the reverse, this gets the first element of the original line.
            r = s[ y ] . pop ( ) ;

            // If the current line array is now empty, it means all elements on this line have been consumed.
            // Therefore, advance the line pointer to the next line.
            if ( ! s[ y ] . length )
            {
                this ._y ++ ;
            }

            // Return the result, either as its original string form or as a number.
            return f ? r : + r ;
        } ;


        /**
         * Reads an entire line, splits it into elements, and returns them as an array.
         * Automatically advances the line pointer to the next line.
         *
         * @param {boolean} f - A flag: if true, returns an array of strings;
         *                        otherwise, maps all elements to numbers.
         * @returns {Array<string | number>} An array containing the parsed elements of the line.
         */
        g . prototype . l = function ( f )
        {
            // Fetch the current line, split it by spaces, and then increment the line pointer.
            var s = this ._s[ this ._y ++ ] . split ( " " ) ;

            // Return the array of strings or an array where each string is converted to a number.
            return f ? s : s . map ( a => + a ) ;
        } ;


        /**
         * Reads 'n' consecutive lines and parses them as a 2D array (matrix).
         * Each line is split into elements, forming a row in the matrix.
         * Advances the line pointer by 'n'.
         *
         * @param {number} n - The number of lines to read and process as matrix rows.
         * @param {boolean} f - A flag: if true, returns a matrix of strings;
         *                        otherwise, maps all elements in the matrix to numbers.
         * @returns {Array<Array<string | number>>} A 2D array representing the parsed matrix.
         */
        g . prototype . m = function ( n , f )
        {
            // Slice 'n' lines from the input array, starting from the current line index.
            // The '_y += n' part updates the line pointer for subsequent reads.
            // Each sliced line (string) is then mapped to an array of its space-separated elements.
            var r = this ._s . slice ( this ._y , this ._y += n ) . map ( a => a . split ( " " ) ) ;

            // Return the matrix of string arrays, or a matrix where all nested elements are numbers.
            return f ? r : r . map ( a => a . map ( a => + a ) ) ;
        } ;


        /**
         * Reads 'n' consecutive lines and returns them as a flat array.
         * Each line is treated as a single element in the resulting array.
         * Advances the line pointer by 'n'.
         *
         * @param {number} n - The number of lines to read.
         * @param {boolean} f - A flag: if true, returns an array of strings;
         *                        otherwise, maps all elements to numbers.
         * @returns {Array<string | number>} An array where each element corresponds to a full line.
         */
        g . prototype . r = function ( n , f )
        {
            // Slice 'n' lines from the input array, updating the line pointer.
            var r = this ._s . slice ( this ._y , this ._y += n ) ;

            // Return the array of line strings, or an array where each line string is converted to a number.
            return f ? r : r . map ( a => + a ) ;
        } ;

        // The IIFE concludes by returning the 'f' factory function,
        // which becomes the value assigned to 'GET'.
        return f ;

    }
) ( ) ;


// --- Input Acquisition and Initialization ---
// This section demonstrates how to use the 'GET' utility to read input.
// It reads the entire content of '/dev/stdin' (standard input) as a UTF-8 string
// and passes it to the 'GET' factory function to create a parser instance.
var o = GET ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;


// --- Main Program Execution ---
// The program's core logic is encapsulated within the 'main' function.
// The result of 'main()' is then printed to the console.
console . log ( main ( ) ) ;


/**
 * The main function contains the problem-solving logic.
 * It utilizes the 'o' parser instance to read specific input data
 * and performs calculations to determine a "Yes" or "No" outcome.
 *
 * This function likely checks for a specific mathematical relationship
 * between elements of a 3x3 matrix.
 *
 * @returns {string} "Yes" if the conditions are met, "No" otherwise.
 */
function main ( )
{
    // Read a 3xN matrix using the 'm' method of the 'o' parser.
    // The '3' indicates that 3 lines of input should be parsed as rows of numbers.
    var c = o . m ( 3 ) ;

    // Calculate the difference between the first element of the second row and the first row.
    // This 'a' value represents a potential offset or common difference.
    var a = c[ 1 ][ 0 ] - c[ 0 ][ 0 ] ;

    // Initialize the default negative answer string.
    var N = "No" ;

    // Check if the calculated 'a' value consistently applies to the other elements
    // when comparing the first and second rows.
    // Specifically, check if (c[0][1] + a) equals c[1][1] AND (c[0][2] + a) equals c[1][2].
    // If either of these conditions is false, the pattern is broken, and we return "No".
    if ( a + c[ 0 ][ 1 ] !== c[ 1 ][ 1 ] ||
         a + c[ 0 ][ 2 ] !== c[ 1 ][ 2 ] )
    {
        return N ;
    }


    // Recalculate 'a' based on the relationship between the third row and the first row.
    a = c[ 2 ][ 0 ] - c[ 0 ][ 0 ] ;

    // Perform a similar check for the third row, using the newly calculated 'a'.
    // Check if (c[0][1] + a) equals c[2][1] AND (c[0][2] + a) equals c[2][2].
    // If this pattern does not hold, return "No".
    if ( a + c[ 0 ][ 1 ] !== c[ 2 ][ 1 ] ||
         a + c[ 0 ][ 2 ] !== c[ 2 ][ 2 ] )
    {
        return N ;
    }

    // If all the above conditions pass, it means the specific pattern or relationship holds true.
    // In this case, return "Yes".
    return "Yes" ;
}