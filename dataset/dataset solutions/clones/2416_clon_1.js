"use strict"; /* This directive enables strict mode, which helps catch common coding errors and "unsafe" actions. */


// Define a module for input processing using an Immediately Invoked Function Expression (IIFE).
var GET = ( function ( ) {

    // The public facing function of the GET module.
    function f ( s ) {
        /*
         * This function takes a raw string input 's'
         * and returns a new instance of the internal parser 'g'.
         */
        return new g ( s ) ;
    }


    // The core parser class 'g'.
    function g ( s ) {
        // Store the input string, first trimming whitespace, then splitting by newline characters.
        this . _s = s . trim ( ) . split ( "\n" ) ;
        // Initialize a counter for the current line being processed.
        this . _y = 0 ;
    }


    // Prototype method 'a' for reading a single "atom" or token.
    g . prototype . a = function ( f ) {
        var s = this . _s , // Reference to the array of input lines.
            y = this . _y , // Current line index.
            r ;             // Variable to hold the extracted token.

        // If the current line is still a string (hasn't been tokenized yet),
        // split it by spaces and reverse the array for efficient `pop()`.
        if ( typeof s [ y ] === "string" ) {
            s [ y ] = s [ y ] . split ( " " ) . reverse ( ) ;
        }

        // Extract the last token from the current line's array.
        r = s [ y ] . pop ( ) ;

        // If the current line is now exhausted (no more tokens), advance to the next line.
        if ( ! s [ y ] . length ) {
            this . _y ++ ;
        }

        // Return the token. If 'f' (format flag) is true, return as string; otherwise, convert to number.
        return f ? r : + r ;
    } ;


    // Prototype method 'l' for reading an entire line of tokens.
    g . prototype . l = function ( f ) {
        // Retrieve the current line, split it into tokens, and then increment the line counter.
        var s = this . _s [ this . _y ++ ] . split ( " " ) ;

        // Return the array of tokens. If 'f' is true, return strings; otherwise, map to numbers.
        return f ? s : s . map ( a => + a ) ;
    } ;


    // Prototype method 'm' for reading a matrix (multiple lines, each split into tokens).
    g . prototype . m = function ( n , f ) {
        // Extract 'n' lines starting from the current position,
        // and for each line, split it into tokens.
        var r = this . _s . slice ( this . _y , this . _y += n ) . map ( a => a . split ( " " ) ) ;

        // Return the matrix. If 'f' is true, return string arrays; otherwise, map all elements to numbers.
        return f ? r : r . map ( a => a . map ( a => + a ) ) ;
    } ;


    // Prototype method 'r' for reading raw lines (multiple lines as strings).
    g . prototype . r = function ( n , f ) {
        // Extract 'n' lines starting from the current position.
        var r = this . _s . slice ( this . _y , this . _y += n ) ;

        // Return the array of lines. If 'f' is true, return strings; otherwise, attempt to convert each line to a number.
        return f ? r : r . map ( a => + a ) ;
    } ;


    // The IIFE returns the public function 'f', making it the `GET` variable.
    return f ;

} ) ( ) ;


// Initialize the input reader 'o' by reading the entire content of standard input.
var o = GET ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;


/**
 * Dynamically creates a multi-dimensional array filled with a specified value.
 * The dimensions are provided as subsequent arguments.
 * @param {*} v - The value to fill the array with.
 * @param {...number} dimensions - The sizes of each dimension.
 * @returns {Array} A multi-dimensional array.
 */
function xArray ( v ) {
    var a = arguments , // Access to all arguments.
        l = a . length ,  // Total number of arguments (value + dimensions).
        r = "Array(a[" + -- l + "]).fill(0).map(x=>{return " + v + ";})" ; // String for the innermost array.

    // Loop backwards through dimensions to build the array creation string.
    while ( -- l ) {
        r = "Array(a[" + l + "]).fill(0).map(x=>" + r + ")" ;
    }

    // Evaluate the constructed string to create the array.
    return eval ( r ) ;
}


// Global variables to store the answer grid and the input grid.
var ans , s ;


// Call the main function and print its return value to the console.
console . log ( main ( ) ) ;


/**
 * The primary function that orchestrates the problem-solving logic.
 * Reads input, initializes data structures, calls the recursive solver, and formats output.
 * @returns {string} The formatted answer grid as a string.
 */
function main ( ) {
    // Read the height (h), width (w), and target count (k) from input.
    var h = o . a ( ) ;
    var w = o . a ( ) ;
    var k = o . a ( ) ;

    // Read the grid 's' (h rows as raw strings, effectively a 2D char array).
    s = o . r ( h , 1 ) ;

    // Initialize the answer grid 'ans' as an h x w matrix, filled with 1s.
    ans = xArray ( 1 , h , w ) ;

    // Start the recursive solve process from the top-left corner (0,0)
    // with the full grid dimensions, initial ID of 1, and the target k.
    solve ( 0 , 0 , h , w , 1 , k ) ;

    // Format the 'ans' grid: join inner arrays with spaces, then join rows with newlines.
    return ans . map ( a => a . join ( " " ) ) . join ( "\n" ) ;
}


/**
 * Recursive function to divide a subgrid and assign IDs based on '#' count.
 * It attempts to split vertically first, then falls back to a horizontal split.
 * @param {number} y    - Starting row index of the current subgrid (absolute).
 * @param {number} x    - Starting column index of the current subgrid (absolute).
 * @param {number} h    - Height of the overall grid (absolute, not subgrid height).
 * @param {number} w    - Width of the overall grid (absolute, not subgrid width).
 * @param {number} id   - The current ID to start assigning from.
 * @param {number} k    - The total count of '#' characters expected in this subgrid.
 */
function solve ( y , x , h , w , id , k ) {
    // Base case: If k is 1, fill the entire current subgrid with the current ID.
    if ( k === 1 ) {
        for ( var y3 = y ; y3 < h ; y3 ++ ) {
            for ( var x3 = x ; x3 < w ; x3 ++ ) {
                ans [ y3 ] [ x3 ] = id ;
            }
        }
        return ;
    }

    // Create cumulative count arrays for '#' characters within the current subgrid.
    // y2: counts for each row, x2: counts for each column.
    var y2 = xArray ( 0 , h - y ) ; // Relative row counts.
    var x2 = xArray ( 0 , w - x ) ; // Relative column counts.

    // Iterate through the current subgrid to populate y2 and x2.
    for ( var y3 = y ; y3 < h ; y3 ++ ) {
        for ( var x3 = x ; x3 < w ; x3 ++ ) {
            if ( s [ y3 ] [ x3 ] === "#" ) {
                y2 [ y3 - y ] ++ ; // Increment count for this relative row.
                x2 [ x3 - x ] ++ ; // Increment count for this relative column.
            }
        }
    }

    // Calculate prefix sums for y2 (cumulative counts of '#' up to each row).
    for ( var y3 = y + 1 ; y3 < h ; y3 ++ ) {
        y2 [ y3 - y ] += y2 [ y3 - y - 1 ] ;
    }

    // Calculate prefix sums for x2 (cumulative counts of '#' up to each column).
    for ( var x3 = x + 1 ; x3 < w ; x3 ++ ) {
        x2 [ x3 - x ] += x2 [ x3 - x - 1 ] ;
    }

    // If the current subgrid has only one column, a vertical split is impossible; force a horizontal split.
    if ( x + 1 === w ) {
        // Call helper function 'f' for horizontal splitting.
        return f ( y , x , h , w , id , k , y2 ) ;
    }

    // Attempt to find a suitable vertical split point.
    // Calculate a potential split point 'xf' (relative to the current subgrid's 'x').
    var xf = x + w >> 1 ; // Calculate midpoint.
    xf -= x ;             // Adjust to be relative to the subgrid's starting 'x'.

    // Case 1: If the count of '#'s up to 'xf' is zero.
    if ( x2 [ xf ] === 0 ) {
        // Find the first column (relative to subgrid) where '#'s start appearing.
        while ( ++ xf ) {
            if ( x2 [ xf ] !== 0 ) {
                break ;
            }
        }
        // If this section (up to the new 'xf') contains exactly 'k' '#'s, then split horizontally.
        if ( x2 [ xf ] === k ) {
            return f ( y , x , h , w , id , k , y2 ) ;
        }
    }

    // Case 2: If the count of '#'s up to 'xf' is exactly 'k'.
    if ( x2 [ xf ] === k ) {
        // Find the last column (relative to subgrid) such that '#'s up to it are still 'k'.
        while ( -- xf ) {
            if ( x2 [ xf ] !== k ) {
                break ;
            }
        }
        // If the section before this new 'xf' has 0 or k '#'s, then split horizontally.
        // Note: The original code passes an extra 'k' argument here to 'f', which is ignored.
        if ( x2 [ xf ] === 0 || x2 [ xf ] === k ) {
            return f ( y , x , h , w , id , k , y2 , k ) ;
        }
    }

    // If no special conditions for horizontal split were met, perform a vertical split.
    // Recursively solve the left part of the subgrid.
    solve ( y , x , h , xf + x + 1 , id , x2 [ xf ] ) ;
    // Recursively solve the right part of the subgrid.
    solve ( y , xf + x + 1 , h , w , id + x2 [ xf ] , k - x2 [ xf ] ) ;
}


/**
 * Helper function 'f' specifically for handling horizontal splitting.
 * This is invoked when a vertical split is not feasible or desirable.
 * @param {number} y    - Starting row index of the current subgrid (absolute).
 * @param {number} x    - Starting column index of the current subgrid (absolute).
 * @param {number} h    - Height of the overall grid (absolute, not subgrid height).
 * @param {number} w    - Width of the overall grid (absolute, not subgrid width).
 * @param {number} id   - The current ID to start assigning from.
 * @param {number} k    - The total count of '#' characters expected in this subgrid.
 * @param {Array<number>} y2 - Cumulative row counts for '#' characters within the subgrid.
 */
function f ( y , x , h , w , id , k , y2 ) {
    // Calculate a potential split point 'yf' (relative to the current subgrid's 'y').
    var yf = y + h >> 1 ; // Calculate midpoint.
    yf -= y ;             // Adjust to be relative to the subgrid's starting 'y'.

    // Adjust 'yf' if the cumulative count up to 'yf' is zero.
    if ( y2 [ yf ] === 0 ) {
        // Find the first row (relative to subgrid) where '#'s start appearing.
        while ( ++ yf ) {
            if ( y2 [ yf ] !== 0 ) {
                break ;
            }
        }
    }
    // Adjust 'yf' if the cumulative count up to 'yf' is exactly 'k'.
    else if ( y2 [ yf ] === k ) {
        // Find the last row (relative to subgrid) such that '#'s up to it are still 'k'.
        while ( -- yf ) {
            if ( y2 [ yf ] !== k ) {
                break ;
            }
        }
    }

    // Recursively solve the top part of the subgrid.
    solve ( y , x , yf + y + 1 , w , id , y2 [ yf ] ) ;
    // Recursively solve the bottom part of the subgrid.
    solve ( yf + y + 1 , x , h , w , id + y2 [ yf ] , k - y2 [ yf ] ) ;
}