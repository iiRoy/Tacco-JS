/*
 * This module defines a custom input parser named GET.
 * It's structured as an Immediately Invoked Function Expression (IIFE)
 * to encapsulate its internal functions and variables.
 */
var GET = ( function ( ) {

    // Function 'f' serves as the entry point for the GET parser.
    // It takes a string 's' (the raw input) and returns a new instance of the 'g' parser class.
    function f ( s ) {
        return new g ( s ) ;
    }

    // The 'g' class is the core parser logic.
    // It processes the input string and provides methods to read various data types.
    function g ( s ) {
        /*
         * _s: This private property stores the input string.
         * It is first trimmed (whitespace removed from ends)
         * and then split into an array of lines based on the newline character.
         */
        this._s = s . trim ( ) . split ( "\n" ) ;
        /*
         * _y: This private property acts as a line pointer.
         * It keeps track of the current line index being processed in the _s array.
         * It starts at 0, indicating the first line.
         */
        this._y = 0 ;
    }

    // Prototype method 'a' (for "atom" or "advance"):
    // Reads a single item (token) from the current line.
    // 'f' is a boolean flag: if true, returns the item as a string; otherwise, converts it to a number.
    g . prototype . a = function ( f ) {
        var s = this._s , // Local reference to the array of input lines.
            y = this._y , // Local reference to the current line index.
            r ;           // Variable to hold the retrieved item.

        // If the current line (s[y]) is still a single string, it means it hasn't been processed yet.
        // In this case, it's split by spaces and then reversed.
        // Reversing allows efficient 'pop()' operations to read items from left to right.
        if ( typeof s [ y ] === "string" ) {
            s [ y ] = s [ y ] . split ( " " ) . reverse ( ) ;
        }

        // 'pop()' removes and returns the last element of the array.
        // Because the array was reversed, this effectively gets the first token of the original line.
        r = s [ y ] . pop ( ) ;

        // After popping, if the current line array becomes empty, it means all tokens on this line
        // have been read. So, we advance the line pointer to the next line.
        if ( ! s [ y ] . length ) {
            this._y ++ ;
        }

        // Conditional return: if 'f' is true, return 'r' as a string;
        // otherwise, use the unary plus operator (+r) to convert 'r' to a number.
        return f ? r : + r ;
    } ;

    // Prototype method 'l' (for "line"):
    // Reads an entire line and returns it as an array of items.
    // 'f' (flag) determines if the items in the array should be strings or numbers.
    g . prototype . l = function ( f ) {
        // Retrieve the current line (using this._y++ to advance the line pointer immediately)
        // and split it by spaces into an array of strings.
        var s = this._s [ this._y ++ ] . split ( " " ) ;

        // Conditional return: if 'f' is true, return the array of strings;
        // otherwise, use 'map' to convert each string item in the array to a number.
        return f ? s : s . map ( a => + a ) ;
    } ;

    // Prototype method 'm' (for "matrix"):
    // Reads 'n' subsequent lines and returns them as a 2D array (matrix).
    // 'f' (flag) determines if the items within the matrix should be strings or numbers.
    g . prototype . m = function ( n , f ) {
        // 'slice' extracts 'n' lines starting from the current line pointer (this._y).
        // this._y += n then advances the pointer by 'n' lines.
        // 'map' is used to iterate over these 'n' lines, splitting each line by spaces
        // to form rows of the matrix.
        var r = this._s . slice ( this._y , this._y += n ) . map ( a => a . split ( " " ) ) ;

        // Conditional return: if 'f' is true, return the 2D array of strings;
        // otherwise, use nested 'map' calls to convert every item in the 2D array to a number.
        return f ? r : r . map ( a => a . map ( a => + a ) ) ;
    } ;

    // Prototype method 'r' (for "rows" or "raw lines"):
    // Reads 'n' subsequent lines and returns them as a 1D array of strings or numbers.
    // This differs from 'm' in that it doesn't split each line into individual tokens.
    g . prototype . r = function ( n , f ) {
        // 'slice' extracts 'n' lines starting from the current line pointer (this._y).
        // this._y += n then advances the pointer by 'n' lines.
        // The lines are kept as full strings for now.
        var r = this._s . slice ( this._y , this._y += n ) ;

        // Conditional return: if 'f' is true, return the array of string lines;
        // otherwise, use 'map' to convert each string line in the array to a number.
        return f ? r : r . map ( a => + a ) ;
    } ;

    // The IIFE returns the 'f' function, which is the main factory function for the GET parser.
    return f ;

} ) ( ) ; // End of the GET IIFE.


// Variable 'o' will hold an instance of the GET parser.
// It initializes the parser by reading the entire content of "/dev/stdin"
// (standard input) as a UTF-8 encoded string.
var o = GET ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;


// Execute the main logic of the program and print its return value to the console.
console . log ( main ( ) ) ;


/**
 * The main function containing the problem's core logic.
 * This function determines if a series of specified movements (time, x, y coordinates)
 * is physically possible given certain constraints.
 *
 * @returns {string} "Yes" if all movements are possible, "No" otherwise.
 */
function main ( ) {

    // Read the total number of movement points ('n') from the input using the parser 'o.a()'.
    var n = o . a ( ) ;

    // Read 'n' lines of input as a 2D array (matrix) 'm'.
    // Each row m[i] represents a target point and contains [target_time, target_x_coordinate, target_y_coordinate].
    var m = o . m ( n ) ;

    // Initialize the current time, x-coordinate, and y-coordinate.
    // The starting point is (0, 0) at time 0.
    var t = 0 ,
        x = 0 ,
        y = 0 ;

    // Iterate through each planned movement point from the input matrix 'm'.
    for ( var i = 0 ; i < n ; i ++ ) {

        // Calculate 'dxy': the Manhattan distance required to reach the target (m[i][1], m[i][2])
        // from the current position (x, y).
        var dxy = Math . abs ( x - m [ i ] [ 1 ] ) ;
        dxy += Math . abs ( y - m [ i ] [ 2 ] ) ;

        // Calculate 'dt': the time difference available to make this movement.
        // This is the target time minus the current time.
        var dt = m [ i ] [ 0 ] - t ;

        // Check two critical conditions for the impossibility of the movement:
        // 1. If the required distance 'dxy' is strictly greater than the available time 'dt'.
        //    It's impossible to travel farther than the time allows.
        // 2. If the parity (even or odd) of 'dxy' and 'dt' do not match.
        //    For example, if you need to move 3 units (odd) but have 2 seconds (even), you can't arrive.
        //    This is because each second allows movement by exactly 1 unit (x or y).
        if ( dxy > dt || ( dxy % 2 !== dt % 2 ) ) {
            // If either condition is true, the movement sequence is impossible.
            return "No" ;
        }

        // If the movement is possible, update the current position and time
        // to match the target point for the next iteration.
        x = m [ i ] [ 1 ] ;
        y = m [ i ] [ 2 ] ;
        t = m [ i ] [ 0 ] ;
    }

    // If the loop completes without returning "No", it means all movements were possible.
    return "Yes" ;
}