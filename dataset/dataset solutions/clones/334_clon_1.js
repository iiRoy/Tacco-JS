var             print =     console.log; // This is a handy alias for console.log, just like in Python!
/* This variable will hold all the input lines.
 * It's initialized globally to be accessible by input-reading functions. */
var input_lines
    ;


/*
 * Function to initialize the input reading mechanism.
 * Takes the raw input string and splits it into an array of lines.
 * @param {string} _input - The raw input string, typically from stdin.
 * @returns {function(): string} A function that returns the next line of input.
 */
function read_input ( _input )
{
    input_lines = _input.split( "\n" ) ; // Split the entire input string by newline characters.
    return function ( )
    {
        // This anonymous function returns the first element of input_lines and removes it from the array.
        return input_lines.shift ( ) ;
    } ;
}


/*
 * Reads a line of space-separated integers from the input.
 * @param {boolean} min1Flg - If true, subtracts 1 from each parsed integer (for 0-indexed conversion).
 * @returns {number[]} An array of parsed integers.
 */
function IL ( min1Flg )
{
    var s = input_lines.shift ( ).split ( ' ' ) ; // Get a line, split it by space.
    var offset = min1Flg ? -1 : 0 ; // Determine offset based on the flag.
    var res = [ ] ; // Initialize an empty array to store results.

    for ( var i = 0 ;
          i < s.length ;
          i ++ )
    {
        // Parse each string part into an integer and push to the result array.
        res.push ( parseInt ( s [ i ] ) ) ;
    }
    return res ; // Return the array of integers.
}

/*
 * Finds the maximum value among its arguments.
 * Uses the 'arguments' object to handle a variable number of inputs.
 * @returns {*} The maximum value.
 */
function MAX ( )
{
    var res = arguments [ 0 ] ; // Initialize result with the first argument.
    for ( var i = 1 ;
          i < arguments.length ;
          i ++ )
    {
        // Ternary operator to find the maximum.
        res = res > arguments [ i ] ? res : arguments [ i ] ;
    }
    return res ; // Return the maximum value found.
}

/*
 * Finds the minimum value among its arguments.
 * Uses the 'arguments' object to handle a variable number of inputs.
 * @returns {*} The minimum value.
 */
function MIN ( )
{
    var res = arguments [ 0 ] ; // Initialize result with the first argument.
    for ( var i = 1 ;
          i < arguments.length ;
          i ++ )
    {
        // Ternary operator to find the minimum.
        res = res < arguments [ i ] ? res : arguments [ i ] ;
    }
    return res ; // Return the minimum value found.
}


/**
 * Extends Array.prototype to include a SUM method.
 * Calculates the sum of all numeric elements in the array.
 * @return {number} The sum of all elements.
 */
Array.prototype.SUM = function SUM ( ) {
    var sum = 0 ; // Initialize sum to zero.
    this.forEach ( function ( elm ) {
        sum += elm ; // Add each element to the sum.
    } ) ;
    return sum ; // Return the total sum.
} ;

/**
 * Extends Array.prototype to include a Format method.
 * Joins array elements into a string using a specified separator.
 * @param {string} split - The separator string (defaults to a space).
 * @return {string} The formatted string.
 */
Array.prototype.Format = function Format ( split ) {
    if ( split === undefined ) { // Check if a separator was provided.
        split = " " ; // Default to a space if not.
    }
    return this.join ( split ) ; // Use the native join method.
} ;


/*
 * Generates a comparison function for sorting arrays of objects by a specific key.
 * @param {string} x - The key (property name) to sort by.
 * @param {boolean} desc - If true, sorts in descending order.
 * @param {function(object, object): number} func_when_eq - A secondary comparison function to use when primary keys are equal.
 * @returns {function(object, object): number} A comparison function suitable for Array.prototype.sort().
 */
function item_getter_key ( x , desc , func_when_eq )
{
    var sign = 1 ; // Default to ascending order.
    if ( desc )
    {
        sign = -1 ; // If descending, reverse the sign.
    }
    return function ( a , b )
    {
        // Primary comparison based on key 'x'.
        if ( a [ x ] < b [ x ] ) return -1 * sign ;
        else if ( a [ x ] > b [ x ] ) return sign ;

        // If primary keys are equal, use the secondary comparison function if provided.
        if ( func_when_eq === undefined )
        {
            return 0 ; // If no secondary function, consider them equal.
        }
        else
        {
            return func_when_eq ( a , b ) ; // Use the provided function for tie-breaking.
        }
    } ;
}

/*
 * This is a multi-line comment block.
 * It's just here to demonstrate comment manipulation.
 * The original content was in Japanese, but for variety, it's changed here.
 *
 * This section of the code handles the main logic of the program.
 * It reads input, processes it, and prints results.
 *
 */

// This is the main function where the program execution starts.
function Main ( _input )
{
    var input = read_input ( _input ) ; // Initialize input reader.

    while ( 1 ) // Infinite loop, breaks when MN[0] is 0.
    {
        var MN = IL ( ) ; // Read two integers from a line.
        if ( MN [ 0 ] === 0 )
        {
            return ; // Exit the main loop if the first number is 0.
        }
        var fields = [ ] ; // Array to store the grid/field.
        for ( var i = 0 ; i < MN [ 0 ] ; i ++ )
        {
            fields.push ( input ( ).split ( "" ) ) ; // Read each row of the field.
        }
        var D = {
            ">" : [ 1 , 0 ] , // Direction: Right (x+1, y)
            "v" : [ 0 , 1 ] , // Direction: Down (x, y+1)
            "^" : [ 0 , -1 ] , // Direction: Up (x, y-1)
            "<" : [ -1 , 0 ]   // Direction: Left (x-1, y)
        } ;
        var x = 0 , y = 0 ; // Starting coordinates.

        while ( fields [ y ] [ x ] !== "." ) // Continue until an empty cell ('.') is reached.
        {
            if ( fields [ y ] [ x ] === "a" ) // Check for a visited cell.
            {
                print ( "LOOP" ) ; // If 'a' is found, it's a loop.
                return ; // Terminate the program.
            }
            var d = D [ fields [ y ] [ x ] ] ; // Get direction vector from the current cell's character.
            fields [ y ] [ x ] = "a" ; // Mark the current cell as visited.
            x += d [ 0 ] ; // Update x-coordinate.
            y += d [ 1 ] ; // Update y-coordinate.
        }
        print ( x , y ) ; // Print the final coordinates (x, y) when '.' is reached.
    }
}

// This line calls the Main function with input read from /dev/stdin.
// It uses Node.js 'fs' module to read the file synchronously.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;
// The following line is commented out; it's an alternative for local testing with 'input.txt'.
// Main ( require ( "fs" ) . readFileSync ( "input.txt" , "utf8" ) ) ;