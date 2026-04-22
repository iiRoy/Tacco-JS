"use strict" ; /* Enable strict mode for cleaner code and error checking */


/*
 * GET module: A utility for parsing input data from standard input.
 * It provides methods to read various data structures like single values,
 * lines of values, and matrices.
 */
var GET = ( function ( ) {
    /**
     * Factory function to create a new G reader instance.
     * @param {string} s - The raw input string.
     * @returns {G} A new G reader object.
     */
    function f ( s ) {
        return new g ( s ) ;
    }

    /**
     * G class constructor.
     * Initializes the reader with the input string, trimmed and split by newlines.
     * @param {string} s - The input string.
     */
    function g ( s ) {
        this . _s = s . trim ( ) . split ( "\n" ) ; // Store lines of input.
        this . _y = 0 ;                              // Current line index.
    }

    /**
     * Reads a single token from the current line.
     * If the current line hasn't been processed, it splits and reverses it.
     * Advances the line index if the current line is exhausted.
     * @param {boolean} f - If true, return as string; otherwise, convert to number.
     * @returns {string|number} The read token.
     */
    g . prototype . a = function ( f ) {
        var s = this . _s ,
            y = this . _y ,
            r ;

        if ( typeof s [ y ] === "string" ) {
            s [ y ] = s [ y ] . split ( " " ) . reverse ( ) ; // Split line into tokens and reverse for easy popping.
        }

        r = s [ y ] . pop ( ) ; // Get the last token.

        if ( ! s [ y ] . length ) {
            this . _y ++ ; // Move to the next line if current line is empty.
        }

        return f ? r : + r ; // Return as string or number.
    } ;

    /**
     * Reads an entire line of tokens.
     * Advances the line index.
     * @param {boolean} f - If true, return array of strings; otherwise, array of numbers.
     * @returns {Array<string|number>} The tokens from the line.
     */
    g . prototype . l = function ( f ) {
        var s = this . _s [ this . _y ++ ] . split ( " " ) ; // Get and split the current line, then advance.
        return f ? s : s . map ( a => + a ) ;               // Return as strings or numbers.
    } ;

    /**
     * Reads a matrix (n lines) of tokens.
     * Advances the line index by n.
     * @param {number} n - Number of lines to read.
     * @param {boolean} f - If true, return matrix of strings; otherwise, matrix of numbers.
     * @returns {Array<Array<string|number>>} The matrix.
     */
    g . prototype . m = function ( n , f ) {
        var r = this . _s . slice ( this . _y , this . _y += n ) . map ( a => a . split ( " " ) ) ; // Slice n lines, split each into tokens.
        return f ? r : r . map ( a => a . map ( a => + a ) ) ;                                     // Return as strings or numbers.
    } ;

    /**
     * Reads n raw lines without splitting into tokens.
     * Advances the line index by n.
     * @param {number} n - Number of lines to read.
     * @param {boolean} f - If true, return array of strings; otherwise, array of numbers.
     * @returns {Array<string|number>} The lines.
     */
    g . prototype . r = function ( n , f ) {
        var r = this . _s . slice ( this . _y , this . _y += n ) ; // Slice n lines.
        return f ? r : r . map ( a => + a ) ;                      // Return as strings or numbers.
    } ;

    return f ; // Expose the factory function.
} ) ( ) ;


// Initialize input reader 'o' by reading from /dev/stdin
var o = GET ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;


/**
 * Helper function to create multi-dimensional arrays.
 * Example: xArray(0, 2, 3) creates Array(2).fill(0).map(() => Array(3).fill(0).map(() => 0));
 * @param {*} v - The initial value for the innermost elements.
 * @param {...number} dimensions - The dimensions of the array.
 * @returns {Array} A multi-dimensional array.
 */
function xArray ( v ) {
    var a = arguments ,
        l = a . length ,
        r = "Array(a[" + -- l + "]).fill(0).map(x=>{return " + v + ";})" ;

    while ( -- l ) {
        r = "Array(a[" + l + "]).fill(0).map(x=>" + r + ")" ;
    }

    return eval ( r ) ; // Execute the generated string as JavaScript code.
}


// Global variables for problem state
var r , rx , ry , xy , n ; // r: radius, rx, ry: center coordinates, xy: points array, n: number of points
var e = 1 - 1e-9 ;       // Epsilon for floating point comparisons, to handle precision issues.
var ans = 1e9 ;          // Stores the minimum enclosing circle radius found so far, initialized to a large value.


// Call the main function and print its result to console.
console . log ( main ( ) ) ;


/**
 * Main function to solve the smallest enclosing circle problem.
 * Reads input, handles base cases, and iterates through combinations of points.
 * @returns {number} The radius of the smallest enclosing circle.
 */
function main ( ) {
    n = o . a ( ) ;      // Read the number of points.
    xy = o . m ( n ) ;   // Read n points (x, y coordinates) into a matrix.

    if ( n === 2 ) {
        return solve2 ( xy ) ; // Special case: if only two points, direct calculation.
    }

    /*
     * Iterate through all combinations of three points (i, j, k)
     * to find potential candidate circles.
     * The smallest enclosing circle is always determined by either
     * two points (as diameter) or three points (circumcircle).
     */
    for ( var i = 0 ; i < n ; i ++ ) {
        for ( var j = i + 1 ; j < n ; j ++ ) {
            for ( var k = j + 1 ; k < n ; k ++ ) {
                // Attempt to find a circle passing through points i, j, k
                if ( solve ( xy [ i ] [ 0 ] , xy [ i ] [ 1 ] ,
                             xy [ j ] [ 0 ] , xy [ j ] [ 1 ] ,
                             xy [ k ] [ 0 ] , xy [ k ] [ 1 ] ) )
                {
                    ans = r ; // If a valid circle is found, update the minimum radius.
                }
            }
        }
    }

    return ans ; // Return the smallest radius found.
}


/**
 * Solves for the smallest circle enclosing three given points (x1,y1), (x2,y2), (x3,y3).
 * It calculates the circumcircle for non-collinear points or the bounding circle for collinear points.
 * Sets global variables 'r', 'rx', 'ry' for radius and center.
 * @param {number} x1 - X-coordinate of the first point.
 * @param {number} y1 - Y-coordinate of the first point.
 * @param {number} x2 - X-coordinate of the second point.
 * @param {number} y2 - Y-coordinate of the second point.
 * @param {number} x3 - X-coordinate of the third point.
 * @param {number} y3 - Y-coordinate of the third point.
 * @returns {number} 1 if the circle covers all 'n' points, otherwise undefined (implicitly).
 */
function solve ( x1 , y1 , x2 , y2 , x3 , y3 ) {
    // Calculate vectors for determining collinearity and circumcenter.
    var a = x1 - x2 ,
        b = y1 - y2 ,
        c = x2 - x3 ,
        d = y2 - y3 ;

    // Denominator for circumcenter calculation. If zero, points are collinear.
    var k = 2 * ( a * d - b * c ) ;

    if ( k === 0 ) { // Points are collinear.
        var dx3 = x3 - x1 ,
            dy3 = y3 - y1 ;

        // Calculate squared distances between pairs of points.
        var d1 = a * a + b * b ,         // (x1,y1) to (x2,y2)
            d2 = c * c + d * d ,         // (x2,y2) to (x3,y3)
            d3 = dx3 * dx3 + dy3 * dy3 ; // (x1,y1) to (x3,y3)

        // Find the maximum squared distance to determine the longest segment.
        var md = Math . max ( d1 , d2 , d3 ) ;

        // The radius is half the length of the longest segment.
        r = Math . sqrt ( md ) / 2 ;

        // Determine the center (rx, ry) which is the midpoint of the longest segment.
        if ( d1 === md ) {
            rx = ( x1 + x2 ) / 2 ;
            ry = ( y1 + y2 ) / 2 ;
        } else if ( d2 === md ) {
            rx = ( x3 + x2 ) / 2 ;
            ry = ( y3 + y2 ) / 2 ;
        } else {
            rx = ( x1 + x3 ) / 2 ;
            ry = ( y1 + y3 ) / 2 ;
        }

        return f ( ) ; // Check if this circle covers all 'n' points.
    }

    // Points are not collinear, calculate the circumcircle.
    var v1 = x1 * x1 + y1 * y1 , // Squared distance from origin to (x1,y1)
        v2 = x2 * x2 + y2 * y2 , // Squared distance from origin to (x2,y2)
        v3 = x3 * x3 + y3 * y3 ; // Squared distance from origin to (x3,y3)

    k = 1 / k ; // Invert k for direct circumcenter calculation.

    // Calculate circumcenter (rx, ry) using determinants.
    rx = k * ( d * ( v1 - v2 ) - b * ( v2 - v3 ) ) ;
    ry = k * ( a * ( v2 - v3 ) - c * ( v1 - v2 ) ) ;

    // Calculate the radius 'r' of the circumcircle.
    var dx = x1 - rx ,
        dy = y1 - ry ;
    r = Math . sqrt ( dx * dx + dy * dy ) ;

    return f ( ) ; // Check if this circumcircle covers all 'n' points.
}


/**
 * Checks if all 'n' points are contained within the circle defined by (rx, ry) and radius 'r'.
 * Updates the global 'ans' if a smaller valid circle is found.
 * Uses an epsilon 'e' for floating point comparisons to handle small errors.
 * @returns {number|undefined} 1 if all points are within the circle, otherwise undefined.
 */
function f ( ) {
    if ( ans < r ) {
        return ; // Optimization: If current radius 'r' is already larger than 'ans', no need to check further.
    }

    // Iterate through all 'n' points to verify containment.
    for ( var i = 0 ; i < n ; i ++ ) {
        var dx = xy [ i ] [ 0 ] - rx ,
            dy = xy [ i ] [ 1 ] - ry ;

        var rr = Math . sqrt ( dx * dx + dy * dy ) ; // Distance from current point to (rx, ry).

        if ( r < rr * e ) {
            return ; // If any point is outside the circle (considering epsilon), this circle is not valid.
        }
    }

    return 1 ; // All points are within the circle.
}


/**
 * Special solver for the case when there are only two points.
 * The smallest enclosing circle for two points has them as a diameter.
 * @param {Array<Array<number>>} x - An array containing two points, e.g., [[x1,y1], [x2,y2]].
 * @returns {number} The radius of the smallest enclosing circle for two points.
 */
function solve2 ( x ) {
    var dx = x [ 0 ] [ 0 ] - x [ 1 ] [ 0 ] ,
        dy = x [ 0 ] [ 1 ] - x [ 1 ] [ 1 ] ;

    // Radius is half the distance between the two points.
    return Math . sqrt ( dx * dx + dy * dy ) / 2 ;
}