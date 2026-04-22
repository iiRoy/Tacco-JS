// --- Start of Input Processing Utility ---
var GET = (
    // This is an Immediately Invoked Function Expression (IIFE)
    // It creates a closure for the input parsing utility functions.
    function ( ) {

        /**
         * The main entry point for the GET utility.
         * Creates a new instance of the input parser.
         *
         * @param   {string} s - The raw string input, typically from stdin.
         * @returns {g}        An instance of the input parser.
         */
        function f ( s ) {
            return new g ( s ) ;
        }

        /**
         * Constructor for the input parser.
         * Initializes the internal state by splitting the input string into lines
         * and setting the current line pointer.
         *
         * @param {string} s - The raw input string.
         */
        function g ( s ) {
            // Trim leading/trailing whitespace from the entire input string
            // and then split it into an array of lines based on newline characters.
            this._s = s . trim ( ) . split ( "\n" ) ;
            // Initialize the current line index to 0, pointing to the first line.
            this._y = 0 ;
        }

        /**
         * Reads a single item from the current line.
         * If the current line is a string, it's processed (split and reversed) once.
         * The last item is popped, and the line pointer advances if the line becomes empty.
         *
         * @param   {boolean} f - If true, returns the item as a string; otherwise, attempts to convert to a number.
         * @returns {string|number} The read item.
         */
        g . prototype . a = function ( f ) {
            var s = this._s , // Reference to the array of lines.
                y = this._y , // Current line index.
                r ;            // Variable to hold the result.

            // Check if the current line at index 'y' is still a raw string.
            // If it is, it means it hasn't been processed into an array of items yet.
            if ( typeof s [ y ] === "string" ) {
                // Split the line by spaces, then reverse the array.
                // Reversing allows efficient `pop()` from the end to get items in original order.
                s [ y ] = s [ y ] . split ( " " ) . reverse ( ) ;
            }

            // Pop the last element from the (reversed) current line array.
            // This effectively retrieves the next item in its original order.
            r = s [ y ] . pop ( ) ;

            // If the current line array becomes empty after popping,
            // increment the line pointer to move to the next line for subsequent reads.
            if ( ! s [ y ] . length ) {
                this._y ++ ;
            }

            // Return the item. If 'f' (format as string) is true, return 'r' as is.
            // Otherwise, use the unary plus operator `+` to convert 'r' to a number.
            return f ? r : + r ;
        } ;

        /**
         * Reads an entire line as a list of items and advances the line pointer.
         *
         * @param   {boolean} f - If true, returns items as strings; otherwise, converts to numbers.
         * @returns {string[]|number[]} An array of items from the line.
         */
        g . prototype . l = function ( f ) {
            // Get the current line using `this._y++` (post-increment to advance the pointer),
            // then split it by spaces to get an array of string items.
            var s = this._s [ this._y ++ ] . split ( " " ) ;

            // Return the array. If 'f' is true, return the strings.
            // Otherwise, map each string item to its numeric equivalent using `+a`.
            return f ? s : s . map ( a => + a ) ;
        } ;

        /**
         * Reads 'n' lines as a matrix (array of arrays) and advances the line pointer by 'n'.
         * Each line is split into items.
         *
         * @param   {number}  n - The number of lines to read.
         * @param   {boolean} f - If true, returns items as strings; otherwise, converts to numbers.
         * @returns {string[][]|number[][]} A 2D array of items.
         */
        g . prototype . m = function ( n , f ) {
            // Slice 'n' lines from the input array, starting from the current position.
            // `this._y += n` advances the line pointer by 'n' after slicing.
            // Then, map each sliced line string to an array of its split items.
            var r = this._s . slice ( this._y , this._y += n ) . map ( a => a . split ( " " ) ) ;

            // Return the matrix. If 'f' is true, return the string arrays.
            // Otherwise, map each inner array, and then map each item within to a number.
            return f ? r : r . map ( a => a . map ( a => + a ) ) ;
        } ;

        /**
         * Reads 'n' lines as a simple array of lines (either strings or numbers)
         * and advances the line pointer by 'n'.
         *
         * @param   {number}  n - The number of lines to read.
         * @param   {boolean} f - If true, returns lines as strings; otherwise, converts to numbers.
         * @returns {string[]|number[]} An array of lines.
         */
        g . prototype . r = function ( n , f ) {
            // Slice 'n' lines from the input array, starting from the current position.
            // `this._y += n` advances the line pointer by 'n' after slicing.
            var r = this._s . slice ( this._y , this._y += n ) ;

            // Return the array of lines. If 'f' is true, return the string lines.
            // Otherwise, map each line string to its numeric equivalent.
            return f ? r : r . map ( a => + a ) ;
        } ;

        // The IIFE returns the 'f' function, which is the public API for GET,
        // allowing creation of new input parser instances.
        return f ;

    } ) ( ) ;
// --- End of Input Processing Utility ---


// Initialize the input reader 'o' by reading the entire content
// of standard input (`/dev/stdin`) as a UTF-8 string.
var o = GET ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;


/**
 * Creates a multi-dimensional array initialized with a specific value.
 * The dimensions are provided as additional arguments after the initial value.
 *
 * Example: `xArray(0, 2, 3)` creates a 2x3 array filled with zeros.
 * `xArray(null, 1, 2, 3)` creates a 1x2x3 array filled with nulls.
 *
 * @param   {*} v - The initial value for array elements.
 * @returns {Array} The initialized multi-dimensional array.
 */
function xArray ( v ) {
    var a = arguments , // Access all arguments, where a[0] is 'v' and subsequent are dimensions.
        l = a . length , // Total number of arguments.
        // Construct the string for the innermost array:
        // `Array(a[last_dimension_index]).fill(0).map(x=>{return v;})`
        r = "Array(a[" + -- l + "]).fill(0).map(x=>{return " + v + ";})" ;

    // Loop backwards from the second-to-last dimension down to the first.
    while ( -- l ) {
        // Wrap the current 'r' string with another `Array.map` call for the next dimension.
        // This builds the nested array creation dynamically.
        r = "Array(a[" + l + "]).fill(0).map(x=>" + r + ")" ;
    }

    // Evaluate the constructed string to create the multi-dimensional array.
    // This uses `eval`, which should be used with caution as it executes arbitrary code.
    return eval ( r ) ;
}


/**
 * Performs a binary search (lower bound) on a sorted array.
 * Finds the index of the first element in the range `[a, b)` that is not less than the target value `e`.
 * If all elements in the range are less than `e`, it returns `b`.
 *
 * @param   {Array<number>} d - The sorted array to search within.
 * @param   {number}        a - The starting index of the search range (inclusive).
 * @param   {number}        b - The ending index of the search range (exclusive).
 * @param   {number}        e - The target value to find.
 * @returns {number}          The index of the lower bound.
 */
function lower_bound ( d , a , b , e ) {
    var c ; // Variable to store the middle index.

    // Binary search loop: continues as long as there are at least two elements in the search range.
    // The range is defined by `b - a`.
    for ( ; 1 < b - a ; ) {
        // Calculate the middle index. `0|` performs a bitwise OR with 0, effectively truncating to an integer.
        c = 0 | ( a + b ) / 2 ;

        // If the element at the middle index `d[c]` is less than the target value `e`,
        // it means the lower bound must be in the right half (elements after `c`).
        if ( d [ c ] < e ) {
            a = c ; // Adjust the lower bound of the search range to `c`.
        }
        // Otherwise (if `d[c]` is greater than or equal to `e`),
        // the lower bound must be in the left half (including `c`).
        else {
            b = c ; // Adjust the upper bound of the search range to `c`.
        }
    }
    // After the loop terminates, `a` and `b` will be adjacent indices,
    // and `b - a` will be 1. The lower bound is either `a` or `b`.
    // Check `d[a] < e`: if true, it means `d[a]` is too small, so `b` is the lower bound.
    // Otherwise, `d[a]` is the first element not less than `e`, so `a` is the lower bound.
    return d [ a ] < e ? b : a ;
}


// Immediately call the main function to start program execution.
main ( ) ;


/**
 * The main function orchestrates the problem-solving logic.
 * It reads input, processes data to find patterns of removable elements,
 * and prints the final result.
 */
function main ( ) {

    // Read the total number of elements 'n' from the input.
    var n = o . a ( ) ;
    // Read the value 'k' from the input, which is a key parameter for the problem logic.
    var k = o . a ( ) ;
    // Read an array 'a' of 'n' elements from the input.
    var a = o . l ( ) ;

    // Create a map (object) to store the indices of each unique number in array 'a'.
    // The keys will be the numbers themselves, and the values will be arrays of their indices.
    var map = { } ;

    // Populate the 'map' by iterating through the input array 'a'.
    for ( var i = 0 ; i < n ; i ++ ) {
        // If the current number `a[i]` already exists as a key in 'map',
        // push its current index 'i' to the existing array of indices.
        if ( map [ a [ i ] ] ) {
            map [ a [ i ] ] . push ( i ) ;
        }
        // Otherwise, if the number is encountered for the first time,
        // create a new array with the current index 'i' and assign it to the map.
        else {
            map [ a [ i ] ] = [ i ] ;
        }
    }

    // Declare a variable 'ans' to hold the final answer array.
    var ans ;

    // Call `solve2` starting from the beginning of the array (index 0).
    // `solve2` finds the first element that *cannot* be removed (i.e., has no matching pair later).
    // This value 'u' is crucial for determining if a cycle exists or if the process can complete.
    var u = solve2 ( 0 ) ;

    // Handle base cases for 'k' or if no unremovable element is found.
    // If 'k' is 1, it means we only perform one pass of removal.
    // If 'u' is -1, it means all elements could be removed in the first pass.
    if ( k === 1 || u === -1 ) {
        // In these cases, simply run `solve` from the start (index 0)
        // and print the result.
        printf ( solve ( 0 ) ) ;
        return ; // Exit the main function as the task is complete.
    }

    // Initialize an array 'first' to track the sequence of unique elements
    // encountered at the "start" of each removal pass.
    // The first element is undefined (index 0 is unused), and the first actual unique element is 'u'.
    var first = [ , u ] ;

    // Loop to detect the cycle of unique elements.
    // We try to find up to 'k' unique elements to understand the cycle.
    for ( var i = 1 ; i < k ; i ++ ) {
        // Get the current unique element from the 'first' sequence.
        var t = first [ i ] ;

        // Find the index 'l' in `map[t]` (list of indices for element 't')
        // that is the first index greater than or equal to 0.
        // This effectively finds the first occurrence of 't' in the original array 'a' (or `map[t][0]`).
        var l = lower_bound ( map [ t ] , 0 , map [ t ] . length , 0 ) ;

        // Call `solve2` again, but this time starting from the index *after* the found 't'.
        // `map[t][l]` gives the actual index of 't' in array 'a'.
        var u = solve2 ( map [ t ] [ l ] + 1 ) ;

        // If `solve2` returns -1, it means no unremovable element was found
        // from this starting point, indicating the sequence terminates here.
        if ( u === -1 ) {
            break ; // Exit the loop as the cycle detection has ended.
        }

        // Add the newly found unique element 'u' to the 'first' array.
        first . push ( u ) ;
    }

    // If the loop broke because 'u' became -1, increment 'i' to correctly reflect
    // the count of elements successfully added to 'first' before termination.
    if ( u === -1 ) {
        i ++ ;
    }

    // Calculate the remainder 'q' of 'k' divided by the cycle length 'i'.
    // 'q' determines where in the cycle the final `solve` operation should start.
    var q = k % i ;

    // Handle the case where 'k' is a perfect multiple of the cycle length 'i'.
    if ( q === 0 ) {
        // If 'u' was -1, it means the sequence of removals ended before 'k' steps could be completed.
        // In this specific case, there's nothing left to process, so we just return.
        if ( u === -1 ) {
            return ;
        }
        // If 'u' was not -1, it means a full cycle (or 'i' steps) completed.
        // The starting point for the final `solve` is based on the last element of the cycle `first[i-1]`.
        var t = first [ i - 1 ] ;
        // Find the first index 'l' of 't' in `map[t]` (effectively `map[t][0]`).
        var l = lower_bound ( map [ t ] , 0 , map [ t ] . length , 0 ) ;
        // Call `solve` starting from the index *after* this 't', and print the result.
        printf ( solve ( map [ t ] [ l ] + 1 ) ) ;
        return ; // Exit the main function.
    }

    // Handle the case where 'k' is not a multiple of the cycle length 'i'.
    // The starting index 'l' for the final `solve` depends on the remainder 'q'.
    if ( q === 1 ) {
        // If 'q' is 1, it means the effective starting point for the final `solve` is the beginning of the array (index 0).
        var l = 0 ;
    } else {
        // If 'q' is greater than 1, the starting point is determined by the element `first[q-1]`.
        var t = first [ q - 1 ] ;
        // Find the first index 'l' of 't' in `map[t]` (effectively `map[t][0]`).
        var l = lower_bound ( map [ t ] , 0 , map [ t ] . length , 0 ) ;
        // The actual starting index for `solve` is *after* this found 't'.
        l = map [ t ] [ l ] + 1 ;
    }

    // Finally, call the `solve` function with the determined starting index 'l'
    // and print its result.
    printf ( solve ( l ) ) ;


    /**
     * Solves the problem by greedily removing pairs of identical elements.
     * It iterates through the array 'a' from a given starting index 'i'.
     * If an element `a[j]` has a matching identical element later in the array,
     * both are effectively "removed" by advancing `j` to the index of the matching element.
     * Elements that do not find a match are collected into the 'ans' array.
     *
     * @param   {number} i - The starting index in array 'a' to begin processing.
     * @returns {number[]} An array of elements that could not be removed.
     */
    function solve ( i ) {
        // Initialize the answer array for this specific run of `solve`.
        ans = [ ] ;
        // Iterate through the array 'a' from the provided starting index 'i' up to 'n'.
        for ( var j = i ; j < n ; j ++ ) {
            var t = a [ j ] ; // Get the current element.
            // Use `lower_bound` to find the first index 'l' in `map[t]` (the list of indices for element 't')
            // that is strictly greater than the current processing index 'j'.
            // This searches for an occurrence of 't' *after* the current 'a[j]'.
            var l = lower_bound ( map [ t ] , 0 , map [ t ] . length , j + 1 ) ;

            // If `l` is a valid index within `map[t]` (i.e., not equal to its length),
            // it means a matching element `t` was found later in the array.
            if ( l !== map [ t ] . length ) {
                // If a match is found, we effectively "remove" both `a[j]` and `a[map[t][l]]`.
                // Advance 'j' to the index of the matched element. The `for` loop's `j++` will then
                // move it to the element *after* the pair.
                j = map [ t ] [ l ] ;
            }
            // If `l` is equal to `map[t].length`, it means no matching element 't'
            // was found *after* the current index 'j'.
            else {
                // This element 't' cannot be removed, so add it to the answer array.
                ans . push ( t ) ;
            }
        }
        return ans ; // Return the array of unremovable elements.
    }


    /**
     * Finds the first element in the array 'a' (starting from index 'i')
     * that cannot be removed. An element cannot be removed if it does not
     * have a matching identical element later in the array.
     *
     * @param   {number} i - The starting index in array 'a' to begin searching.
     * @returns {number}   The value of the first unremovable element, or -1 if all can be removed.
     */
    function solve2 ( i ) {
        // Iterate through the array 'a' from the provided starting index 'i' up to 'n'.
        for ( var j = i ; j < n ; j ++ ) {
            var t = a [ j ] ; // Get the current element.
            // Use `lower_bound` to find the first index 'l' in `map[t]` (the list of indices for element 't')
            // that is strictly greater than the current processing index 'j'.
            // This searches for an occurrence of 't' *after* the current 'a[j]'.
            var l = lower_bound ( map [ t ] , 0 , map [ t ] . length , j + 1 ) ;

            // If `l` is a valid index within `map[t]`, it means a matching element `t` was found later.
            if ( l !== map [ t ] . length ) {
                // If a match is found, we effectively "remove" both `a[j]` and `a[map[t][l]]`.
                // Advance 'j' to the index of the matched element. The `for` loop's `j++` will then
                // move it to the element *after* the pair.
                j = map [ t ] [ l ] ;
            }
            // If `l` is equal to `map[t].length`, it means no matching element 't'
            // was found *after* the current index 'j'.
            else {
                // This element 't' cannot be removed, so it is the first unremovable element.
                // Return its value.
                return t ;
            }
        }
        // If the loop completes without returning, it means all elements from 'i' onwards
        // could be removed. In this case, return -1 to indicate no unremovable element was found.
        return -1 ;
    }

}


/**
 * Prints an array of numbers to the console, joined by spaces.
 * If the array is empty (has zero length), nothing is printed.
 *
 * @param {number[]} ar - The array of numbers to print.
 */
function printf ( ar ) {
    // Check if the array has any elements.
    if ( ar . length ) {
        // Join the elements of the array with a single space separator
        // and print the resulting string to the console.
        console . log ( ar . join ( " " ) ) ;
    }
}