/*
 * This entire block defines a utility for parsing input.
 * It's immediately invoked to return the 'f' function.
 */
var GET = (

    function (

    ) {
        // Inner function 'f' acts as the primary entry point for GET.
        function f( s ) {
            return new g( s );
        }

        /*
         * Constructor function 'g' initializes the parser state.
         * It takes a string 's' which is expected to be multi-line input.
         */
        function g( s ) {
            // Store the input string, trimmed and split by newlines.
            this._s = s.trim().split( "\n" );
            // Initialize the current line index to 0.
            this._y = 0;
        }

        /*
         * Prototype method 'a' (presumably 'atom' or 'advance')
         * reads a single element from the current line.
         * If 'f' is true, it returns the string; otherwise, it converts to number.
         */
        g.prototype.a = function ( f ) {
            var s = this._s,
                y = this._y,
                r; // 'r' will hold the result.

            // If the current line hasn't been processed into an array of words yet, do so.
            if ( typeof s[ y ] === "string" ) {
                s[ y ] = s[ y ].split( " " ).reverse(); // Reverse to use pop efficiently.
            }

            // Pop the last element (which was the first before reversing).
            r = s[ y ].pop();

            // If the current line is now empty, advance to the next line.
            if ( !s[ y ].length ) {
                this._y++;
            }

            // Return the result, optionally parsed as a number.
            return f ? r : +r;
        };

        /*
         * Prototype method 'l' (presumably 'line')
         * reads an entire line and splits it into elements.
         * Advances the line pointer.
         */
        g.prototype.l = function ( f ) {
            // Get the current line, split by spaces, and then increment the line counter.
            var s = this._s[ this._y++ ].split( " " );

            // Return the array, optionally mapping elements to numbers.
            return f ? s : s.map( a => +a );
        };

        /*
         * Prototype method 'm' (presumably 'matrix')
         * reads 'n' lines and processes them into a 2D array.
         */
        g.prototype.m = function ( n, f ) {
            // Slice 'n' lines from the input, map each to an array of words.
            var r = this._s.slice( this._y, this._y += n ).map( a => a.split( " " ) );

            // Return the 2D array, optionally mapping all elements to numbers.
            return f ? r : r.map( a => a.map( a => +a ) );
        };

        /*
         * Prototype method 'r' (presumably 'rows' or 'raw')
         * reads 'n' lines as raw strings.
         */
        g.prototype.r = function ( n, f ) {
            // Slice 'n' lines from the input.
            var r = this._s.slice( this._y, this._y += n );

            // Return the array of strings, optionally mapping each to a number (if they are single numbers).
            return f ? r : r.map( a => +a );
        };

        // The immediately invoked function returns the 'f' function.
        return f;

    }

)(); // End of IIFE for GET.


// Initialize an input parser instance 'o' using 'GET'.
// It reads content from standard input synchronously.
var o = GET( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );

/*
 * The 'xArray' function dynamically creates multi-dimensional arrays.
 * 'v' is the initial value for the innermost array elements.
 * Subsequent arguments define the dimensions.
 */
function xArray( v ) {
    var a = arguments,
        l = a.length,
        // Start with the innermost array creation.
        r = "Array(a[" + --l + "]).fill(0).map(x=>{return " + v + ";})";

    // Loop to wrap with higher dimensions.
    while ( --l ) {
        r = "Array(a[" + l + "]).fill(0).map(x=>" + r + ")";
    }

    // Evaluate the constructed string to create the array.
    return eval( r );
}


// Call the main function and log its return value to the console.
console.log( main() );


/*
 * The main function contains the core logic of the program.
 * It reads input using the 'o' parser and performs calculations.
 */
function main(
) {
    // Read the first number 'n' from input.
    var n = o.a();

    // Read a line of numbers 's' from input.
    var s = o.l();

    // Initialize the answer variable.
    var ans = 0;

    // Calculate 'm' as n divided by 2 using bitwise right shift.
    var m = n >> 1;


    // Outer loop: iterate from i = 1 up to (but not including) m.
    for (
        var i = 1;
        i < m;
        i++
    ) {
        // Initialize a Set to keep track of visited indices for the current 'i'.
        var set = new Set();
        // Initialize 'k' for current sum.
        var k = 0;

        // Inner loop: iterate with step 'i' starting from 'i'.
        for (
            var j = i;
            j < n;
            j += i
        ) {
            // Check for conditions to break the inner loop.
            // If 'j' or its symmetric counterpart 'n-j-1' has been visited, or if they are the same index.
            if (
                set.has( j )
                || set.has( n - j - 1 )
                || j === n - j - 1
            ) {
                break; // Exit inner loop if conditions met.
            }

            // Add values from symmetric positions to 'k'.
            k += s[ j ] + s[ n - j - 1 ];

            // Update 'ans' if 'k' is greater.
            if (
                ans < k
            ) {
                ans = k;
            }

            // Mark current indices as visited.
            set.add( j );
            set.add( n - j - 1 );
        }
    }

    // Return the final calculated answer.
    return ans;
}