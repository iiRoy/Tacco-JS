var GET = ( function () {

    /*
     * This is the factory function for creating input stream readers.
     * It takes the raw input string 's' and returns an instance.
     */
    function f ( s ) {
        return new g ( s ) ;
    }

    /*
     * The constructor for the input stream reader object.
     * It initializes the internal state for parsing.
     * @param {string} s - The raw input string.
     */
    function g ( s ) {
        // Trim whitespace from the input and split it into an array of lines.
        this._s = s . trim () . split ( "\n" ) ;
        // Initialize the current line index to 0.
        this._y = 0 ;
    }

    // Prototype method 'a': Reads an item from the current line.
    // It processes the current line to extract individual values.
    // @param {boolean} f - If true, returns the item as a string; otherwise, as a number.
    g . prototype . a = function ( f ) {
        var s = this._s ,
            y = this._y ,
            r ;
        // If the current line at index 'y' is still a single string,
        // split it by space and reverse the order. This allows popping from the end.
        if ( typeof s [ y ] === "string" ) {
            s [ y ] = s [ y ] . split ( " " ) . reverse () ;
        }
        // Pop the last element (which is the first after reversing).
        r = s [ y ] . pop () ;
        // If the current line becomes empty after popping, advance to the next line.
        if ( ! s [ y ] . length ) {
            this._y ++ ;
        }
        // Return the extracted item, optionally converting it to a number.
        return f ? r : + r ;
    } ;

    // Prototype method 'l': Reads an entire line of space-separated items.
    // It advances the line pointer after reading.
    // @param {boolean} f - If true, returns items as strings; otherwise, as numbers.
    g . prototype . l = function ( f ) {
        // Get the current line, split it by space, and then increment the line index.
        var s = this._s [ this._y ++ ] . split ( " " ) ;
        // Return the array of items, optionally converting them to numbers.
        return f ? s : s . map ( a => + a ) ;
    } ;

    // Prototype method 'm': Reads 'n' lines as a matrix (2D array).
    // It processes each of the 'n' lines to form rows of the matrix.
    // @param {number} n - The number of lines to read.
    // @param {boolean} f - If true, returns items as strings; otherwise, as numbers.
    g . prototype . m = function ( n , f ) {
        // Slice 'n' lines from the input, then map each line to an array of space-separated items.
        var r = this._s . slice ( this._y , this._y += n ) . map ( a => a . split ( " " ) ) ;
        // Return the matrix, optionally converting all items to numbers.
        return f ? r : r . map ( a => a . map ( a => + a ) ) ;
    } ;

    // Prototype method 'r': Reads 'n' lines as a flat list.
    // It treats each line as a single item.
    // @param {number} n - The number of lines to read.
    // @param {boolean} f - If true, returns items as strings; otherwise, as numbers.
    g . prototype . r = function ( n , f ) {
        // Slice 'n' lines from the input.
        var r = this._s . slice ( this._y , this._y += n ) ;
        // Return the list, optionally converting items to numbers.
        return f ? r : r . map ( a => + a ) ;
    } ;

    // The IIFE returns the factory function 'f', which is used to create GET instances.
    return f ;

} ) ( ) ;


// Initialize the input reader 'o' by reading standard input.
// This uses the 'fs' module to read from /dev/stdin with 'utf8' encoding.
var o = GET ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;


/*
 * Creates a multi-dimensional array initialized with a specific value.
 * The dimensions are provided as subsequent arguments.
 * @param {*} v - The initial value for the innermost elements.
 * @param {...number} dimensions - The sizes of each dimension.
 * @returns {Array} - The multi-dimensional array.
 */
function xArray ( v ) {
    var a = arguments ,
        l = a . length ,
        // Construct the innermost array creation string.
        r = "Array(a[" + --l + "]).fill(0).map(x=>{return " + v + ";})" ;
    // Loop to build up the outer array creation strings.
    while ( --l ) {
        r = "Array(a[" + l + "]).fill(0).map(x=>" + r + ")" ;
    }
    // Evaluate the constructed string to create the array dynamically.
    return eval ( r ) ;
}


// Execute the main function and print its return value to the console.
console . log ( main () ) ;


/*
 * The main logic of the program.
 * It solves a problem involving matching pairs based on input data.
 * @returns {number} The final answer or -1 if no solution is found.
 */
function main () {

    // Read the number of elements 'n' from the input.
    var n = o . a () ;

    // Read an n x n matrix 'a' from the input.
    var a = o . m ( n ) ;

    // Convert all elements in matrix 'a' from 1-indexed to 0-indexed.
    a = a . map ( a => a . map ( a => a - 1 ) ) ;

    // Initialize 'ai', an array to keep track of the current index for each element.
    // It's a 1D array of size 'n', initialized with zeros.
    var ai = xArray ( 0 , n ) ;

    // Initialize 'q', a queue containing all elements from 0 to n-1.
    // This represents the initial set of active elements.
    var q = Array ( n ) . fill () . map ( ( a , i ) => i ) ;

    // Initialize 'ans', the counter for the number of iterations/steps.
    var ans = 0 ;

    // Main loop: continues as long as there are elements in the queue 'q'.
    while ( q . length ) {

        // Increment the answer for each full iteration of the matching process.
        ans ++ ;

        // Initialize 'q2', a new queue to store elements that will be active in the next iteration.
        var q2 = [ ] ;

        // Initialize 'set', a Set to keep track of elements already processed within this iteration,
        // preventing redundant processing and ensuring each pair is handled once per step.
        var set = new Set () ;

        // Iterate through each element currently in the queue 'q'.
        for ( var i = 0 ; i < q . length ; i ++ ) {

            // Get the current element 't' from the queue.
            var t = q [ i ] ;

            // Check if 't' has already been processed in this iteration (via 'set')
            // or if its 'ai' index has reached the maximum (n-1), meaning it's fully processed.
            if ( set . has ( t ) || ai [ t ] === n - 1 ) {
                continue ; // Skip to the next element if already processed or complete.
            }

            // Determine the 'pair' element for 't' based on its current 'ai' index.
            var pair = a [ t ] [ ai [ t ] ] ;

            // Check for a mutual relationship: if 't' is 'pair's current match, and 'pair' is 't's current match.
            if ( t === a [ pair ] [ ai [ pair ] ] ) {

                // If a mutual pair is found, increment the 'ai' indices for both 't' and 'pair'.
                ai [ t ] ++ ;
                ai [ pair ] ++ ;

                // Add both 't' and 'pair' to the next queue 'q2' for further processing.
                q2 . push ( t , pair ) ;

                // Add 'pair' to the 'set' to mark it as processed in this iteration.
                // This ensures that 'pair' is not processed again if it appears later in 'q'.
                set . add ( pair ) ;
            }
        }
        // Update the current queue 'q' with the elements from 'q2' for the next iteration.
        q = q2 ;
    }

    // After the main loop, check if all elements have been fully processed.
    // An element is fully processed if its 'ai' index has reached 'n-1'.
    for ( var i = 0 ; i < n ; i ++ ) {
        if ( ai [ i ] !== n - 1 ) {
            // If any element has not been fully processed, return -1, indicating an issue or no complete solution.
            return -1 ;
        }
    }

    // If all elements are fully processed, return the total number of iterations/steps.
    return ans ;
}