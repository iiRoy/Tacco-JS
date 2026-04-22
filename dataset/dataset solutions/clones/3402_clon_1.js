var GET = (

    // This is an Immediately Invoked Function Expression (IIFE)
    // It creates and returns a factory function 'f'.
    function (
    ) {

        /**
         * Factory function that creates a new instance of the data parser.
         * @param {string} s - The input string to be parsed.
         * @returns {g} A new parser instance.
         */
        function f( s ) {

            return new g(s);

        }


        /**
         * Constructor for the data parser.
         * Initializes the internal state with the provided string.
         * @param {string} s - The raw input string.
         */
        function g( s ) {

            // Trim whitespace and split the input string into lines.
            // Store them in an internal array `_s`.
            this._s = s.trim( ).split( "\n" );

            // Initialize the line pointer `_y` to the beginning.
            this._y = 0 ;

        }


        /**
         * Prototype method 'a' to read a single value.
         * It reads from the current line, potentially reversing it if it's the first read from that line.
         * @param {boolean} f - If true, returns the value as a string; otherwise, as a number.
         * @returns {string|number} The parsed value.
         */
        g.prototype.a = function ( f ) {

            // Get references to internal state variables for brevity.
            var s = this._s ,
                y = this._y ,
                r ;

            // Check if the current line needs to be split and reversed for 'a' specific parsing.
            if ( typeof s [ y ] === "string" ) {

                s [ y ] = s [ y ].split( " " ).reverse( ) ;

            }

            // Pop the last element from the current line (which is the first after reversal).
            r = s [ y ].pop( ) ;

            // If the current line is now empty, advance to the next line.
            if ( ! s [ y ].length ) {

                this._y ++ ;

            }

            // Return the result, either as a string or converted to a number.
            return f ? r : + r ;

        } ;


        /**
         * Prototype method 'l' to read an entire line of values.
         * Advances the line pointer after reading.
         * @param {boolean} f - If true, returns values as strings; otherwise, as numbers.
         * @returns {string[]|number[]} An array of parsed values from the line.
         */
        g.prototype.l = function ( f ) {

            // Get the current line, split it by spaces, and then increment the line pointer.
            var s = this._s [ this._y ++ ].split( " " ) ;

            // Return the array, either as strings or mapped to numbers.
            return f ? s : s . map ( a => + a ) ;

        } ;


        /**
         * Prototype method 'm' to read a matrix (multiple lines, multiple values per line).
         * @param {number} n - The number of lines to read.
         * @param {boolean} f - If true, returns values as strings; otherwise, as numbers.
         * @returns {string[][]|number[][]} A 2D array (matrix) of parsed values.
         */
        g.prototype.m = function ( n , f ) {

            // Slice 'n' lines from the internal array, then map each line to an array of split values.
            // The line pointer `_y` is advanced by `n`.
            var r = this._s . slice ( this._y , ( this._y += n ) ) . map ( a => a . split ( " " ) ) ;

            // Return the matrix, either as strings or with all elements mapped to numbers.
            return f ? r : r . map ( a => a . map ( a => + a ) ) ;

        } ;


        /**
         * Prototype method 'r' to read a range of lines, treating each line as a single value.
         * @param {number} n - The number of lines to read.
         * @param {boolean} f - If true, returns values as strings; otherwise, as numbers.
         * @returns {string[]|number[]} An array of parsed values from the lines.
         */
        g.prototype.r = function ( n , f ) {

            // Slice 'n' lines from the internal array.
            // The line pointer `_y` is advanced by `n`.
            var r = this._s . slice ( this._y , ( this._y += n ) ) ;

            // Return the array, either as strings or with all elements mapped to numbers.
            return f ? r : r . map ( a => + a ) ;

        } ;

        // The IIFE returns the factory function 'f'.
        return f ;

    }
) ( ) ;


// Initialize a parser instance 'o' by reading input from /dev/stdin.
// 'utf8' encoding is specified for the file read operation.
var o = GET ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;


// Execute the main function and print its return value to the console.
console . log ( main ( ) ) ;


/**
 * The main function where the core logic of the program resides.
 * It reads input using the 'o' parser and performs calculations.
 * @returns {number} The final calculated answer.
 */
function main ( ) {

    // Read height (h), width (w), and number of obstacles (n) from input.
    var h = o . a ( ) ;

    var w = o . a ( ) ;

    var n = o . a ( ) ;

    // Initialize a 2D array (represented as an array of objects) 'b'.
    // It's sized (h+1) and each element is an empty object.
    var b = Array ( h + 1 ) . fill ( 0 ) . map ( a => {

        return { } ;

    } ) ;


    // Loop 'n' times to process each obstacle.
    for ( var i = 0 ; i < n ; i ++ ) {

        // Read obstacle coordinates (t[0] for x, t[1] for y).
        var t = o . l ( ) ;

        // If t[0] (x-coordinate) is less than t[1] (y-coordinate), skip this obstacle.
        if ( t [ 0 ] < t [ 1 ] ) {

            continue ;

        }

        // Mark the obstacle position in the 'b' grid.
        b [ t [ 1 ] ] [ t [ 0 ] ] = 1 ;

    }


    // Fill the rightmost column (w+1) of the grid with obstacles up to height 'h'.
    for ( i = 1 ; i <= h ; i ++ ) {

        b [ i ] [ w + 1 ] = 1 ;

    }


    // Initialize 'ans' with the first obstacle's x-coordinate in the first row, minus 1.
    var ans = Object . keys ( b [ 1 ] ) [ 0 ] - 1 ;

    // Initialize 'x' pointer for column traversal.
    var x = 2 ;


    // Main loop: Iterate from the second row up to 'ans' and 'h'.
    for ( i = 2 ; i <= ans && i <= h ; i ++ ) {

        // Skip columns that are blocked in the current row.
        while ( b [ i ] [ x ] ) {

            x ++ ;

        }

        // Iterate through all obstacles in the current row.
        for ( var j in b [ i ] ) {

            // Convert 'j' (which is a string key) to a number.
            j = + j ;

            // If the current 'x' position is beyond the obstacle 'j', skip it.
            if ( x > j ) {

                continue ;

            }

            // If the obstacle's x-coordinate minus 1 is less than 'ans', update 'ans'.
            if ( j - 1 < ans ) {

                ans = j - 1 ;

            }

            // Break after finding the first relevant obstacle in the row.
            break ;

        }

        // Increment 'x' for the next iteration (move to the next column).
        x ++ ;

        // If 'x' reaches or exceeds 'w', it means we've reached the right boundary, so break.
        if ( x >= w ) {

            break ;

        }

    }

    // Return the final calculated answer.
    return ans ;

}