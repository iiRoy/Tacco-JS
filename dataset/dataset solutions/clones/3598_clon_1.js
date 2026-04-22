/*
 * This file contains a custom input reader class 'gets'
 * and a 'main' function that solves a particular problem.
 * The 'gets' class provides methods to read input lines and numbers.
 */

// Define the 'gets' constructor function.
// It initializes the internal state for reading input.
function gets(str)
{
    // The input string is split into an array of lines.
    // Each line is stored in the private '_s' property.
    this._s = str.split("\n") ;

    // '_y' is a pointer to the current line being processed,
    // initialized to the first line (index 0).
    this._y = 0 ;
}
; // Semicolon after function declaration, valid but often omitted.


// Attach methods to the 'gets' prototype object.
// This makes the methods available to all instances of 'gets'.
gets.prototype = {

    /*
     * Method 'a' (presumably for 'atom' or 'argument').
     * Reads a single token (number or string) from the current line.
     *
     * @param {boolean} f - If true, returns the token as a string;
     *                        otherwise, attempts to convert it to a number.
     * @returns {string|number} The next token from the input.
     */
    a: function (f) {
        // Local variables for convenience and readability.
        var s = this._s ,
            y = this._y ,
            r ; // 'r' will hold the result.

        // If the current line (s[y]) is still a string,
        // it means it hasn't been processed yet.
        if (typeof s[y] === "string")
        {
            // Split the line by spaces and reverse the array.
            // Reversing allows efficient 'pop()' operations from the end.
            s[y] = s[y].split(" ").reverse() ;
        }

        // Pop the last element from the (reversed) current line array.
        // This effectively gets the first token from the original line.
        r = s[y].pop() ;

        // If the current line array is now empty,
        // increment the line pointer to move to the next line.
        if (!s[y].length)
        {
            this._y++ ;
        }

        // Return the result based on the 'f' flag.
        // If 'f' is true, return 'r' as is (string).
        // Otherwise, convert 'r' to a number using the unary plus operator.
        return f ? r : +r ;
    } , // End of method 'a'.


    /*
     * Method 'l' (presumably for 'line').
     * Reads an entire line of tokens.
     *
     * @param {boolean} f - If true, returns tokens as strings;
     *                        otherwise, converts them to numbers.
     * @returns {Array<string|number>} An array of tokens from the line.
     */
    l: function (f) {
        // Retrieve the current line, split it by spaces,
        // and then increment the line pointer for the next call.
        var s = this._s[this._y++].split(" ") ;

        // Return the line tokens based on the 'f' flag.
        // If 'f' is true, return the array of strings directly.
        // Otherwise, map each string token to a number.
        return f ? s : s.map(a => +a) ;
    } , // End of method 'l'.


    /*
     * Method 'm' (presumably for 'matrix' or 'multiple lines').
     * Reads 'n' lines of tokens.
     *
     * @param {number} n - The number of lines to read.
     * @param {boolean} f - If true, returns tokens as strings;
     *                        otherwise, converts them to numbers.
     * @returns {Array<Array<string|number>>} A 2D array representing the lines.
     */
    m: function (n, f) {
        // Local variables for input array, current line pointer,
        // result array, and loop counter.
        var s = this._s ,
            y = this._y ,
            r = [] ,
            i = 0 ;

        // Conditional logic based on the 'f' flag.
        if (f)
        {
            // If 'f' is true, read lines and keep tokens as strings.
            for ( ; i < n ; i++ )
            {
                r[i] = s[y + i].split(" ") ;
            }
        }
        else
        {
            // If 'f' is false, read lines and convert tokens to numbers.
            for ( ; i < n ; i++ )
            {
                r[i] = s[y + i].split(" ").map(a => +a) ;
            }
        }

        // Advance the line pointer by 'n' lines.
        this._y += n ;

        // Return the 2D array of processed lines.
        return r ;
    } , // End of method 'm'.

} ; // End of 'gets.prototype' object literal.


// Create a new instance of the 'gets' class.
// It reads the entire content of "/dev/stdin" using Node.js's 'fs' module
// and passes it as the input string to the 'gets' constructor.
var o = new gets(require("fs").readFileSync("/dev/stdin", "utf8")) ;


// Call the 'main' function and print its return value to the console.
console.log(main()) ;


/*
 * The main function where the core logic of the problem resides.
 * It processes input using the 'o' (gets) instance and computes a result.
 */
function main()
{
    // Read the first number, which represents 'n'.
    var n = o.a() ;

    // Read the next line of numbers into array 'a'.
    var a = o.l() ;

    // Initialize an empty array 'b'.
    var b = [] ;

    // Handle small 'n' cases.
    if (n <= 2)
    {
        // If n is 1 or 2, the maximum element in 'a' is the answer.
        return Math.max(...a) ;
    }

    // Populate array 'b' based on 'a'.
    // For each element in 'b', it's the maximum of two adjacent elements in 'a'.
    for (var i = 0 ; i < n - 1 ; i++)
    {
        b[i] = Math.max(a[i], a[i + 1]) ;
    }


    // Branching logic based on 'n' modulo 4.
    if (n % 4 === 1 || n % 4 === 2)
    {
        // If n % 4 is 1 or 2, concatenate 'a' and 'b' and find the middle element.
        return middle(a.concat(b)) ;
    }

    if (n % 4 === 3)
    {
        // If n % 4 is 3, sort 'b' and find the middle of a specific set of values.
        b.sort((a,b) => a - b) ; // Sort 'b' numerically.
        a = middle(a) ; // Find the middle element of 'a'.

        // Return the middle of an array constructed from 'a' (twice)
        // and two middle-ish elements from the sorted 'b'.
        return middle([a, a, b[n - 1 >> 1], b[n - 2 >> 1]]) ;
    }

    // Default case for n % 4 === 0.
    a.sort((a,b) => a - b) ; // Sort 'a' numerically.
    b = middle(b) ; // Find the middle element of 'b'.

    // Return the middle of an array constructed from 'b' (twice)
    // and two middle-ish elements from the sorted 'a'.
    return middle([b, b, a[n >> 1], a[n - 1 >> 1]]) ;


    /*
     * Helper function 'middle'.
     * Finds the middle element of a numerically sorted array.
     * Assumes 'a' is an array of numbers.
     *
     * @param {Array<number>} a - The array to find the middle element from.
     * @returns {number} The middle element.
     */
    function middle(a)
    {
        // Sort the input array numerically in ascending order.
        a.sort((a,b) => a - b) ;

        // Return the element at the middle index.
        // '>> 1' is a bitwise right shift, equivalent to Math.floor(index / 2).
        return a[a.length >> 1] ;
    }

} // End of 'main' function.