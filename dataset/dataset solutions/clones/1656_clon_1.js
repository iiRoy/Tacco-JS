/*
 * This JavaScript file implements a solution for a specific problem.
 * It leverages a custom input parsing utility (GET) to read data
 * from standard input, then processes this data within the 'main' function.
 * The core logic in 'main' appears to simulate some form of transaction
 * or resource management based on an array of values.
 *
 * Author: Expert Code Clone Generator
 * Date: 2023-10-27
 */

// Define a module for input parsing using an Immediately Invoked Function Expression (IIFE).
var GET = ( function ( )
{

    // Private constructor-like function that acts as the entry point for the parser.
    // It takes a raw string input and initializes the parsing process.
    function f( s )
    {
        return new g( s ) ; // Creates and returns a new instance of the actual parser 'g'.
    }

    // The primary constructor for the input parsing utility.
    // Instances of this class hold the processed input.
    function g( s )
    {
        // The raw input string 's' is first trimmed of leading/trailing whitespace,
        // then split into an array of strings based on newline characters.
        // This array is stored internally as '_s'.
        this._s = s .trim( ) .split( "\n" ) ;
    }

    // --- Prototype methods for the 'g' parser class ---

    // Retrieves a single string value from the parsed input array at the specified index.
    // 'n' represents the zero-based index of the line to retrieve.
    g.prototype.getValue = function ( n )
    {
        return this._s [ n ] ;
    } ;

    // Retrieves a line from the parsed input, then converts it into an array of mixed types.
    // The line is expected to contain space-separated values.
    g.prototype.getArray = function ( n )
    {
        return this .stoa( this._s [ n ] ) ; // Delegates to 'stoa' for string-to-array conversion.
    } ;

    // Extracts a slice of the parsed input lines, converting each line to a single value.
    // 's' is the starting index, 'limit' is the number of elements to slice.
    g.prototype.slice = function ( s , limit )
    {
        // The slice method extracts elements from 's' up to 's + limit' (if 'limit' is defined).
        // Each extracted line (v) is then processed by 'stox' to convert it to its appropriate type.
        return this._s .slice( s , +limit + s || undefined ) .map( v => this .stox( v ) ) ;
    } ;

    // Extracts a slice of the parsed input lines, converting each line into an array of values.
    // Similar to 'slice', but uses 'stoa' for conversion.
    g.prototype.sliceArray = function ( s , limit )
    {
        // Extracts a segment of the input lines.
        // Each line (v) in the segment is then transformed into an array using 'stoa'.
        return this._s .slice( s , +limit + s || undefined ) .map( v => this .stoa( v ) ) ;
    } ;

    // Helper function: Converts a space-separated string into an array of parsed values.
    // Each value in the string is processed by 'stox'.
    g.prototype.stoa = function ( s )
    {
        return s .split( " " ) .map( v => this .stox( v ) ) ;
    } ;

    // Helper function: Converts a single string value to a number if possible,
    // otherwise returns the original string.
    g.prototype.stox = function ( v )
    {
        var i = +v ; // Attempt to convert 'v' to a number.
        // Check if the conversion resulted in NaN (Not-a-Number).
        // If 'i' is NaN, 'i === i' will be false. Otherwise, it's a valid number.
        return ( i === i ) ? i : v ;
    } ;

    return f ; // The IIFE returns the 'f' function, which is the public API for the GET parser.

}) ( ) ; // End of the GET IIFE.


// Initialize the input parser 'o' by reading data from standard input.
// The 'require("fs").readFileSync' method is used to synchronously read the file.
// The input is expected to be UTF-8 encoded.
var o = GET( require( "fs" ) .readFileSync( "/dev/stdin" , "utf8" ) ) ;


// Execute the 'main' function and print its return value to the console.
console .log( main( ) ) ;


/**
 * The main function that encapsulates the problem-solving logic.
 * It reads parsed input from the 'o' object and performs calculations.
 *
 * @returns {number} The final computed result of the algorithm.
 */
function main( )
{
        // Retrieve the first line of input, which is expected to be a single number 'N'.
        var N = o .getValue( 0 ) ;

        // Retrieve the second line of input, expected to be an array of numbers 'An'.
        var An = o .getArray( 1 ) ;

        // Initialize a variable 'last', possibly to store an index or a flag.
        var last = 0 ;

        // Loop backward through the 'An' array, starting from N-1 down to 0.
        // The loop condition 'N > j' ensures 'j' goes down to 0.
        for ( var j = N - 1 ; N > j ; j++ )
        {
                // Check if the current element is strictly greater than the preceding element.
                if ( An [ j ] > An [ j - 1 ] )
                {
                        last = j ; // If condition met, store the current index 'j' in 'last'.
                        break ;    // Exit the loop immediately upon finding the first such element.
                }
        }

        // Initialize 'result' with a base value, perhaps representing an initial capital or score.
        var result = 1000 ;
        // Initialize 'num', likely a counter for items or units.
        var num = 0 ;

        // Main processing loop: Iterate through the 'An' array from the beginning to N-1.
        for ( var i = 0 ; N > i ; i++ )
        {
                // Condition 1: Sell accumulated items or handle a specific index 'last'.
                // This block executes if 'i' matches 'last' OR if the current price 'An[i]'
                // is higher than the next price 'An[i+1]' AND we currently hold items ('num > 0').
                if ( last === i || An [ i ] > An [ i + 1 ] && num > 0 )
                {
                        // Add the value of the sold items to the 'result'.
                        // The value is current price 'An[i]' multiplied by 'num' of items.
                        result += An [ i ] * num ;
                        num = 0 ;                  // Reset the number of held items to zero.
                        continue ;                 // Skip remaining checks in this iteration and move to the next.
                }

                // Condition 2: Buy items if advantageous.
                // This block executes if the current price 'An[i]' is lower than the next price 'An[i+1]'
                // AND we have sufficient 'result' (money) to buy at least one item.
                if ( An [ i ] < An [ i + 1 ] && result >= An [ i ] )
                {
                        // Calculate the remainder of money after buying as many items as possible.
                        var temp = result % An [ i ] ;
                        // Calculate the number of items that can be bought with current 'result'.
                        num = ( result - temp ) / An [ i ] ;
                        // Update 'result' to reflect the remaining money after purchases.
                        result = temp ;
                }
        }

        // Return the final calculated result after all operations.
        return result ;
}