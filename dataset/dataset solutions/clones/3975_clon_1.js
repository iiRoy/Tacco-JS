var GET = (

    // This immediately invoked function expression creates a utility for parsing input.
    function () {

        // The main factory function 'f'
        function f( s ) {
            // It returns a new instance of the 'g' class,
            // which handles the actual parsing logic.
            return new g( s ) ;
        }


        // The 'g' class constructor
        function g( s ) {
            // It stores the input string 's' after trimming whitespace
            // and splitting it into an array of lines.
            this._s = s . trim() . split( "\n" ) ;

            // '_y' is an internal pointer, typically indicating the current line index.
            this._y = 0 ;
        }


        // Prototype methods for the 'g' class:

        // 'a' method: Reads a single item from the current line.
        g . prototype . a = function ( f ) {
            // 's' refers to the array of input lines.
            var s = this._s ,
                // 'y' is the current line index.
                y = this._y ,
                // 'r' will store the result.
                r ;

            // If the current line is a string (not yet processed into an array of tokens),
            if ( typeof s[ y ] === "string" ) {
                // Split it by spaces and reverse it, so 'pop()' takes items from left to right.
                s[ y ] = s[ y ] . split( " " ) . reverse() ;
            }

            // Pop the last element (which is the first token due to reversing).
            r = s[ y ] . pop() ;

            // If the current line is now empty, advance the line pointer.
            if ( ! s[ y ] . length ) {
                this._y ++ ;
            }

            // Return the result:
            // If 'f' (a flag) is true, return as a string.
            // Otherwise, convert to a number (unary plus operator).
            return f ? r : + r ;
        };


        // 'l' method: Reads an entire line as an array of items.
        g . prototype . l = function ( f ) {
            // Get the current line, split it by spaces, and then increment the line pointer.
            var s = this._s[ this._y ++ ] . split( " " ) ;

            // Return the result:
            // If 'f' is true, return as an array of strings.
            // Otherwise, map each item to a number.
            return f ? s : s . map( a => + a ) ;
        };


        // 'm' method: Reads a matrix (multiple lines) of numbers/strings.
        g . prototype . m = function ( n , f ) {
            // Slice 'n' lines starting from the current position,
            // then increment the line pointer by 'n'.
            // Each sliced line is then split by spaces to form rows.
            var r = this._s . slice( this._y , this._y += n ) . map( a => a . split( " " ) ) ;

            // Return the result:
            // If 'f' is true, return as a matrix of strings.
            // Otherwise, map each inner array (row) to an array of numbers.
            return f ? r : r . map( a => a . map( a => + a ) ) ;
        };


        // 'r' method: Reads 'n' raw lines (not split by spaces).
        g . prototype . r = function ( n , f ) {
            // Slice 'n' lines starting from the current position,
            // then increment the line pointer by 'n'.
            var r = this._s . slice( this._y , this._y += n ) ;

            // Return the result:
            // If 'f' is true, return as an array of strings.
            // Otherwise, map each line to a number.
            return f ? r : r . map( a => + a ) ;
        };


        // The IIFE returns the factory function 'f',
        // which is then assigned to the 'GET' variable.
        return f ;

    }
)(); // End of GET IIFE


// Initialize 'o' with the GET utility,
// reading input from '/dev/stdin' as UTF-8.
var o = GET( require( "fs" ) . readFileSync( "/dev/stdin" , "utf8" ) ) ;


// This function implements a binary search algorithm (lower_bound).
// It finds the first element in a sorted array 'd' that is not less than 'e'.
function lower_bound( d , a , b , e ) {

    // 'c' will be used for the midpoint index.
    for ( var c ; 1 < b - a ; ) {
        // Calculate the midpoint index.
        c = 0 | ( a + b ) / 2 ;

        // If the element at 'c' is less than 'e',
        // then the target must be in the right half.
        if ( d[ c ] < e ) {
            a = c ;
        }
        // Otherwise, the target is in the left half or at 'c'.
        else {
            b = c ;
        }
    }

    // After the loop, 'a' and 'b' will be adjacent.
    // Return 'b' if d[a] is less than 'e', otherwise return 'a'.
    // This correctly identifies the lower bound.
    return d[ a ] < e ? b : a ;
};


// Execute the main logic and print the result to the console.
console . log( main() ) ;


// The main function where the problem's logic resides.
function main() {
    // Read the number of elements 'n'.
    var n = o . a() ;

    // Read the first array 'a'.
    var a = o . l() ;

    // Read the second array 'b'.
    var b = o . l() ;

    // Initialize the answer variable.
    var ans = 0 ;

    // Loop from bit 28 down to 0, processing each bit position.
    for ( var i = 28 ; i >= 0 ; i -- ) {
        // Calculate powers of 2 and related constants for the current bit.
        var t = 1 << i ,      // Current power of 2 (2^i)
            t2 = t * 2 ,      // 2 * 2^i
            t3 = t * 3 ,      // 3 * 2^i
            c = t - 1 ,       // Mask for bits below 'i'
            x = n * n ;       // Initial count (total pairs possible)

        // Sort array 'b' in ascending order. This is crucial for lower_bound.
        b . sort( ( a , b ) => a - b ) ;

        // Iterate through each element in array 'a'.
        for ( var j = 0 ; j < n ; j ++ ) {
            // Find the lower bound for (2*t - a[j]) in 'b'.
            // This marks the start of elements that satisfy b[k] >= (2*t - a[j]).
            var x2 = lower_bound( b , 0 , n , t2 - a[ j ] ) ;

            // Find the lower bound for (t - a[j]) in 'b' within the range [0, x2).
            // This marks the start of elements that satisfy b[k] >= (t - a[j]).
            var x1 = lower_bound( b , 0 , x2 , t - a[ j ] ) ;

            // Find the lower bound for (3*t - a[j]) in 'b' within the range [x2, n).
            // This marks the start of elements that satisfy b[k] >= (3*t - a[j]).
            var x3 = lower_bound( b , x2 , n , t3 - a[ j ] ) ;

            // Adjust the count 'x' based on the bounds found.
            // This specific calculation seems to be part of an XOR-sum problem.
            x += - x3 + x2 - x1 ;
        }

        // If 'x' is odd, it means the current bit contributes to the answer.
        if ( x % 2 ) {
            ans += t ; // Add 2^i to the answer.
        }

        // Mask elements in 'b' with 'c' (t-1) to keep only bits below 'i'.
        b = b . map( a => a & c ) ;

        // Special handling for iteration 'i < 18'.
        // The inner function 'f' is called to process array 'b'.
        if ( i < 18 ) {
            b = f( b ) ;
        }

        // Mask elements in 'a' with 'c' (t-1) to keep only bits below 'i'.
        a = a . map( a => a & c ) ;
    }

    // Return the final calculated answer.
    return ans ;


    // Inner helper function 'f':
    // This function seems to process an array 'b' to find unique elements
    // that appear an odd number of times (similar to a XOR-based uniqueness check).
    function f( b ) {
        // An object to act as a frequency map or a set.
        var a = {} ;

        // Iterate through each element in 'b'.
        for ( var i = 0 ; i < b . length ; i ++ ) {
            // If the element is already in 'a' (appeared an odd number of times before),
            if ( a[ b[ i ] ] ) {
                delete a[ b[ i ] ] ; // Remove it (it has now appeared an even number of times).
            }
            // Otherwise, add it to 'a' (it has now appeared an odd number of times).
            else {
                a[ b[ i ] ] = 1 ;
            }
        }

        // Return an array of unique elements that appeared an odd number of times,
        // converted back to numbers.
        return Object . keys( a ) . map( a => + a ) ;
    }
}