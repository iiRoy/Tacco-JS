var GET = (

    // This is an Immediately Invoked Function Expression (IIFE)
    // It creates a closure for the GET utility.
    function (
    )
    {
        // Helper function 'f' acts as the public interface for GET.
        function f ( s )
        {
            // Returns a new instance of the internal 'g' class.
            return new g ( s ) ;
        }


        // Internal class 'g' handles the parsing of input strings.
        function g (
            s
        )
        {
            // Stores the processed input string as an array of lines.
            // .trim() removes leading/trailing whitespace, .split("\n") separates lines.
            this._s = s . trim ( ) . split ( "\n" ) ;

            // _y is a pointer to the current line being processed.
            this._y = 0 ;
        }


        // Prototype method 'a' for retrieving an "atom" (single value).
        g . prototype . a = function ( f )
        {
            // Local variables for easier access.
            var s = this._s ,
                y = this._y ,
                r ;

            // If the current line hasn't been split into words yet, do it and reverse.
            if ( typeof s[y] === "string" )
            {
                s[y] = s[y] . split ( " " ) . reverse ( ) ;
            }

            // Pop the last element (which is the first word due to reverse).
            r = s[y] . pop ( ) ;

            // If the current line is now empty, advance to the next line.
            if ( ! s[y] . length )
            {
                this._y ++ ;
            }

            // Return as string if 'f' is true, otherwise convert to number.
            return f
                   ? r
                   : +r ;
        } ;


        // Prototype method 'l' for retrieving a "line" of values.
        g . prototype . l = function ( f )
        {
            // Get the current line, split by spaces, and advance the line pointer.
            var s = this._s[ this._y ++ ] . split ( " " ) ;

            // Return as array of strings if 'f' is true, otherwise convert all elements to numbers.
            return f
                   ? s
                   : s . map ( a => +a ) ;
        } ;


        // Prototype method 'm' for retrieving a "matrix" (multiple lines, multiple values per line).
        g . prototype . m = function ( n , f )
        {
            // Slice 'n' lines, advance pointer, and map each line to an array of words.
            var r = this._s . slice ( this._y , this._y += n ) . map ( a => a . split ( " " ) ) ;

            // Return as matrix of strings if 'f' is true, otherwise convert all nested elements to numbers.
            return f
                   ? r
                   : r . map ( a => a . map ( a => +a ) ) ;
        } ;


        // Prototype method 'r' for retrieving a "raw" block (multiple lines, single value per line).
        g . prototype . r = function ( n , f )
        {
            // Slice 'n' lines and advance the line pointer.
            var r = this._s . slice ( this._y , this._y += n ) ;

            // Return as array of strings if 'f' is true, otherwise convert all elements to numbers.
            return f
                   ? r
                   : r . map ( a => +a ) ;
        } ;


        // The IIFE returns the public 'f' function.
        return f ;

    }
) ( ) ; // End of IIFE


// Initialize the 'o' object by reading from standard input.
var o = GET ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;


// Call the main function and print its result to the console.
console . log ( main ( ) ) ;


// Main application logic function.
function main ( )
{
    // Read input values using the 'o' parser.
    var n = o . a ( ) ; // First value: total count.
    var a = o . a ( ) ; // Second value: threshold 'a'.
    var b = o . a ( ) ; // Third value: threshold 'b'.
    var p = o . l ( ) ; // Fourth value: an array of numbers.


    // Initialize counters for conditions.
    var x = 0 , // Count for p[i] <= a
        y = 0 ; // Count for p[i] > b


    // Loop through the 'p' array.
    for ( var i = 0 ; i < n ; i ++ )
    {
        // Check the conditions for each element in 'p'.
        if ( p[i] <= a )
        {
            x ++ ; // Increment 'x' if p[i] is less than or equal to 'a'.
        }
        else if ( p[i] > b )
        {
            y ++ ; // Increment 'y' if p[i] is greater than 'b'.
        }
    }


    // Return the minimum of the three counts: x, y, and the remaining category.
    return Math . min ( x , y , n - x - y ) ;
}