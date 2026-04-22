var GET = (

    // This is an Immediately Invoked Function Expression (IIFE)
    // It creates a closure and returns the 'f' function, which is
    // then assigned to the 'GET' variable.
    function (
    ) {

        // Helper function 'f':
        // This function acts as the main entry point for creating
        // a new instance of the 'g' object, which handles input parsing.
        function f (
            s
        ) {
            // Returns a new instance of the 'g' constructor.
            return new g (s) ;
        }


        // Constructor function 'g':
        // Initializes the input string and a pointer for current line.
        function g (
            s
        ) {
            /*
             * The '_s' property stores the input string,
             * trimmed of leading/trailing whitespace, and then split
             * into an array of lines.
             */
            this._s = s . trim ( ) . split ( "\n" ) ;

            // The '_y' property acts as a line index pointer, initialized to 0.
            this._y = 0 ;
        }


        // Prototype method 'a' for the 'g' object:
        // Reads the next item (either a number or a string token)
        // from the current line, or the next line if the current one is exhausted.
        g . prototype . a = function (
            f
        ) {
            // Get the internal string array and current line index.
            var s = this . _s ,
                y = this . _y ,
                r ; // 'r' will hold the result.

            // Check if the current line (s[y]) is still a string.
            // If it is, it means it hasn't been processed yet.
            if (
                typeof s [ y ] === "string"
            ) {
                /*
                 * Split the line by spaces, reverse the order,
                 * and store it back. Reversing allows efficient 'pop'
                 * from the "start" of the line.
                 */
                s [ y ] = s [ y ] . split ( " " ) . reverse ( ) ;
            }

            // Pop the last element (which was originally the first) from the current line.
            r = s [ y ] . pop ( ) ;

            // If the current line is now empty, advance to the next line.
            if (
                ! s [ y ] . length
            ) {
                this . _y ++ ;
            }

            // Return the result:
            // If 'f' (flag) is true, return as a string.
            // Otherwise, convert to a number using the unary plus operator (+).
            return f ? r : + r ;
        } ;


        // Prototype method 'l' for the 'g' object:
        // Reads an entire line, splits it by spaces, and returns the tokens.
        g . prototype . l = function (
            f
        ) {
            // Get the current line, split it by spaces, and then increment the line pointer.
            var s = this . _s [ this . _y ++ ] . split ( " " ) ;

            // Return the result:
            // If 'f' (flag) is true, return as an array of strings.
            // Otherwise, map each string token to a number.
            return f ? s : s . map ( a => + a ) ;
        } ;


        // Prototype method 'm' for the 'g' object:
        // Reads 'n' lines, splits each by spaces, and returns a 2D array.
        g . prototype . m = function (
            n ,
            f
        ) {
            // Slice 'n' lines from the input, starting from the current pointer.
            // Increment the pointer by 'n'.
            // Map each line to an array of tokens (split by space).
            var r = this . _s . slice ( this . _y , this . _y += n ) . map ( a => a . split ( " " ) ) ;

            // Return the result:
            // If 'f' (flag) is true, return as a 2D array of strings.
            // Otherwise, map each inner array's elements to numbers.
            return f ? r : r . map ( a => a . map ( a => + a ) ) ;
        } ;


        // Prototype method 'r' for the 'g' object:
        // Reads 'n' lines and returns them as an array.
        g . prototype . r = function (
            n ,
            f
        ) {
            // Slice 'n' lines from the input, starting from the current pointer.
            // Increment the pointer by 'n'.
            var r = this . _s . slice ( this . _y , this . _y += n ) ;

            // Return the result:
            // If 'f' (flag) is true, return as an array of strings.
            // Otherwise, map each string line to a number.
            return f ? r : r . map ( a => + a ) ;
        } ;

        // The IIFE returns the 'f' function, making it accessible as 'GET'.
        return f ;

    }
) ( ) ; // IIFE is immediately executed.


// Initialize an input reader 'o' by parsing standard input.
var o = GET (
    require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" )
) ;

// Define a modulo constant, commonly used in competitive programming for large numbers.
var mod = 1e9 + 7 ;


// Execute the main logic and print the result to the console.
console . log ( main ( ) ) ;


/**
 * The main function containing the core logic of the program.
 * It calculates a specific value based on the input data.
 * @returns {number} The final calculated result.
 */
function main (
) {

    // Read an integer 'n' from the input.
    var n = o . a ( ) ;

    // Read 'n' lines of integers into an array 'c'.
    var c = o . r ( n ) ;

    // Initialize a 2D array 'a' with 200,000 empty arrays.
    // This array will store indices based on values from 'c'.
    var a = Array ( 2e5 ) . fill ( 0 ) . map ( a => [ ] ) ;


    // Populate 'a': for each element c[i], push its index 'i'
    // into the array at position (c[i] - 1).
    for (
        var i = 0 ;
        i < n ;
        i ++
    ) {
        a [ c [ i ] - 1 ] . push ( i ) ;
    }


    // Process 'a': reverse each inner array and remove its last element.
    // This effectively removes the smallest index for each category.
    for (
        var i = 0 ;
        i < n ;
        i ++
    ) {
        a [ i ] . reverse ( ) ; // Reverse to make 'pop' remove the "first" element (smallest index).
        a [ i ] . pop ( ) ; // Remove the smallest index.
    }


    // Initialize a dynamic programming array 'dp' of size 'n' with zeros.
    var dp = Array ( n ) . fill ( 0 ) ;

    // Base case for DP: dp[0] is 1.
    dp [ 0 ] = 1 ;

    // Get the next available index 't' for the category of the first element c[0].
    var t = a [ c [ 0 ] - 1 ] . pop ( ) ;

    // If 't' exists and is greater than 1, set dp[t] to 1.
    if (
        t > 1
    ) {
        dp [ t ] = 1 ;
    }


    // Iterate from the second element to 'n-1' to fill the DP array.
    for (
        i = 1 ;
        i < n ;
        i ++
    ) {
        // Accumulate previous DP value.
        dp [ i ] += dp [ i - 1 ] ;

        // Apply modulo to prevent integer overflow.
        dp [ i ] %= mod ;

        // Get the next available index 't' for the category of the current element c[i].
        t = a [ c [ i ] - 1 ] . pop ( ) ;

        // If 't' exists and is greater than i + 1, set dp[t] to dp[i].
        if (
            t > i + 1
        ) {
            dp [ t ] = dp [ i ] ;
        }
    }

    // The final result is the last element of the DP array.
    return dp [ n - 1 ] ;

}