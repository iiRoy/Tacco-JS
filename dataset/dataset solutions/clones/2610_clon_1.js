var GET = ( function ( ) { /* This IIFE (Immediately Invoked Function Expression) sets up a parser utility.
                                 * It provides methods to conveniently read various data types from a string input.
                                 * The primary goal is to simplify input processing for competitive programming.
                                 */

    // Function 'f' serves as the public constructor/factory for the parser.
    function f ( s ) {

        // Returns a new instance of the internal parser class 'g'.
        return new g ( s ) ;

    }


    // Internal class 'g' is the actual parser object.
    function g ( s ) {
        // The input string 's' is trimmed, then split into an array of lines.
        this._s = s . trim ( ) . split ( "\n" ) ;

        // '_y' acts as a line pointer, keeping track of the current line being processed.
        this._y = 0 ;
    }


    // Method 'a': Reads a single value (number or string) from the current line.
    // It treats each line as a stack, popping values from the end.
    g . prototype . a = function ( f ) {
        var s = this._s , // Reference to the array of input lines.
            y = this._y , // Current line index.
            r ;             // Variable to hold the result.

        // If the current line hasn't been processed into an array of tokens yet,
        // split it by spaces and reverse it to simulate a stack (pop from end).
        if ( typeof s [ y ] === "string" ) {
            s [ y ] = s [ y ] . split ( " " ) . reverse ( ) ;
        }

        // Pop the last element from the current line (which is the next token).
        r = s [ y ] . pop ( ) ;

        // If the current line is now empty after popping, advance to the next line.
        if ( ! s [ y ] . length ) {
            this._y ++ ;
        }

        // If 'f' is truthy, return the raw string 'r'. Otherwise, convert 'r' to a number.
        return f ? r : + r ;
    } ;


    // Method 'l': Reads an entire line and returns it as an array of values.
    g . prototype . l = function ( f ) {
        // Get the current line, split it by spaces, and then increment the line pointer.
        var s = this._s [ this._y ++ ] . split ( " " ) ;

        // If 'f' is truthy, return the array of strings. Otherwise, convert each element to a number.
        return f ? s : s . map ( a => + a ) ;
    } ;


    // Method 'm': Reads 'n' lines, treating them as a matrix, and returns a 2D array.
    g . prototype . m = function ( n , f ) {
        // Slice 'n' lines starting from the current line, and for each line, split it into tokens.
        // The line pointer '_y' is advanced by 'n'.
        var r = this._s . slice ( this._y , this._y += n ) . map ( a => a . split ( " " ) ) ;

        // If 'f' is truthy, return the matrix of strings. Otherwise, convert all elements to numbers.
        return f ? r : r . map ( a => a . map ( a => + a ) ) ;
    } ;


    // Method 'r': Reads 'n' lines, each expected to contain a single value.
    g . prototype . r = function ( n , f ) {
        // Slice 'n' lines starting from the current line.
        // The line pointer '_y' is advanced by 'n'.
        var r = this._s . slice ( this._y , this._y += n ) ;

        // If 'f' is truthy, return the array of strings. Otherwise, convert each element to a number.
        return f ? r : r . map ( a => + a ) ;
    } ;


    // The IIFE returns the factory function 'f', which becomes the value of 'GET'.
    return f ;

} ) ( ) ;


// Initialize the input parser 'o' by reading the entire content of /dev/stdin.
var o = GET ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;


/*
 * Function 'xArray': Dynamically creates multi-dimensional arrays.
 * This function is present in the original code but is not used in the main logic.
 * It builds a string representing nested array initializations and then evaluates it.
 */
function xArray ( v ) {

    var a = arguments , // Access the arguments object to get array dimensions.
        l = a . length ,  // Number of dimensions specified.
        // Start building the string for the innermost array.
        r = "Array(a[" + --l + "]).fill(0).map(x=>{return " + v + ";})" ;

    // Loop to construct the nested array expressions from inner to outer dimensions.
    while ( --l ) {
        r = "Array(a[" + l + "]).fill(0).map(x=>" + r + ")" ;
    }

    // Evaluate the constructed string to create the actual multi-dimensional array.
    return eval ( r ) ;

}


// Declare global variables used throughout the program.
var n ,           // Stores the count of points.
    x = [ ] ,     // Array to hold x-coordinates of points.
    y = [ ] ,     // Array to hold y-coordinates of points.
    c = [ ] ;     // Array to hold angles (in degrees) for each point.


// Constant 'q' defines the resolution for the angular sweep.
var q = 360000 ;


// Call the 'main' function and print its return value to the console.
console . log ( main ( ) ) ;


/*
 * Function 'main': Contains the primary logic of the application.
 * It reads point data, processes it, and calculates a maximum magnitude.
 */
function main ( ) {

    // Read the total number of points from the input using the parser 'o'.
    n = o . a ( ) ;

    // Loop 'n' times to read each point's coordinates.
    for ( var i = 0 ; i < n ; i ++ ) {
        var a = o . a ( ) , // Read the x-coordinate.
            b = o . a ( ) ; // Read the y-coordinate.

        // If a point is at the origin (0,0), it does not contribute to the vector sum,
        // so we skip it to avoid issues with angle calculation and unnecessary processing.
        if ( a === 0 && b === 0 ) {
            continue ;
        }

        // Store the valid x and y coordinates.
        x . push ( a ) ;
        y . push ( b ) ;

        // Calculate the angle of the point (a,b) and store it.
        c . push ( f ( a , b ) ) ;
    }

    // Update 'n' to reflect the actual number of non-origin points collected.
    n = x . length ;

    var ans = 0 ; // Initialize the maximum squared magnitude found so far.

    // Outer loop for sweeping through 360 degrees with 'q' steps.
    for ( var i = 0 ; i < q ; i ++ ) {

        // Calculate the current sweep angle 'v' in degrees (from 0 to 360).
        var v = i / q * 360 ;

        // Initialize temporary sums for x and y components for the current sweep.
        var tx = 0 ,
            ty = 0 ;

        // Inner loop: Iterate through all collected points.
        for ( var j = 0 ; j < n ; j ++ ) {

            /*
             * Check if the j-th point's angle 'c[j]' falls within a 180-degree arc.
             * This condition identifies points that are "in front" of the current sweep direction 'v'.
             * It handles the angular wrap-around properly (e.g., if v-90 is negative, or v+90 exceeds 360).
             */
            if ( ( v - 90 < c [ j ] && c [ j ] < v + 90 ) || v + 270 < c [ j ] ) {
                tx += x [ j ] ; // Add x-component to the sum.
                ty += y [ j ] ; // Add y-component to the sum.
            }

        }

        // Calculate the squared magnitude of the resultant vector (tx, ty).
        var z = tx * tx + ty * ty ;

        // Update 'ans' if a larger squared magnitude is found.
        if ( ans < z ) {
            ans = z ;
        }

    }

    // Return the square root of the maximum squared magnitude, which is the maximum magnitude.
    return Math . sqrt ( ans ) ;

}


/*
 * Helper function 'f': Calculates the angle of a point (a, b) in degrees.
 * The angle is measured counter-clockwise from the positive x-axis, ranging from 0 to 360 degrees.
 */
function f ( a , b ) {

    // Special case: Point lies on the y-axis (x-coordinate is 0).
    if ( a === 0 ) {
        // If b > 0, it's on the positive y-axis (90 degrees).
        // If b < 0, it's on the negative y-axis (270 degrees).
        return b > 0 ? 90 : 270 ;
    }

    // Special case: Point lies on the x-axis (y-coordinate is 0).
    if ( b === 0 ) {
        // If a > 0, it's on the positive x-axis (0 degrees).
        // If a < 0, it's on the negative x-axis (180 degrees).
        return a > 0 ? 0 : 180 ;
    }

    // Calculate the angle using Math.atan(b/a) and convert radians to degrees.
    // Math.atan returns values in the range (-90, 90) degrees.
    var r = Math . atan ( b / a ) / Math . PI * 180 ;

    // Adjust the angle based on the quadrant:
    // If 'a' is negative, the point is in the second or third quadrant, so add 180 degrees.
    if ( a < 0 ) {
        r += 180 ;
    }

    // Ensure the angle is positive (between 0 and 360).
    // If 'r' is still negative (e.g., from Math.atan in Q4), add 360 degrees.
    if ( r < 0 ) {
        r += 360 ;
    }

    return r ; // Return the final angle in degrees.

}