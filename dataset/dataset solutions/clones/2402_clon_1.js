/*
 * This section contains boilerplate code for input/output handling.
 * It is not directly related to the core problem logic but facilitates
 * reading input and writing output in a specific execution environment.
 * The details within this block are generally for setup.
 */
var   read  =  require('readline') .createInterface( {

    input : process .stdin,

    output : process .stdout

} );

var   obj;

var   inLine = [];


read .on ( 'line' ,   function(input) {
    // Each line read from stdin is pushed into the inLine array.
    inLine .push( input );
} );

read .on ( 'close' ,   function() {

    obj = init(inLine); // Initialize the input object with all collected lines.

    console.error( '\n' ); // Output a newline to stderr for visual separation.

    var   start = Date .now(); // Record the starting time for performance measurement.

    Main(); // Execute the main logic of the program.

    var   end = Date .now() - start; // Calculate the elapsed time.

    myerr( 'time : ' + end + 'ms' ); // Report the execution time.

    myerr( 'memory : ' + Math .round( process .memoryUsage() .heapTotal / 1024 ) + 'KB' ); // Report memory usage.
} );


/**
 * Creates a deep clone of an object or a Set.
 * For Sets, it creates a new Set from the elements.
 * For other objects, it uses JSON stringify/parse for a deep copy (with limitations like functions, undefined, etc.).
 * @param {any} obj The object to be cloned.
 * @returns {any} A deep clone of the input object.
 */
function   makeClone( obj ) {
    return   ( obj   instanceof   Set )   ?   new   Set( Array .from( obj ) )   :   JSON .parse( JSON .stringify( obj ) );
}

function   nextInt() {
    return   myconv( next() ,   1 ); // Reads next token and converts to integer.
}

function   nextStrArray() {
    return   myconv( next() ,   2 ); // Reads next token and splits into string array.
}

function   nextIntArray() {
    return   myconv( next() ,   4 ); // Reads next token, splits, and converts to integer array.
}

function   nextCharArray() {
    return   myconv( next() ,   6 ); // Reads next token and splits into character array.
}

function   next() {
    return   obj .next(); // Retrieves the next available input token.
}

function   hasNext() {
    return   obj .hasNext(); // Checks if there are more input tokens available.
}

/**
 * Initializes an object to manage input lines.
 * It provides methods to check for more input and retrieve the next line.
 * @param {string[]} input An array of strings, where each string is a line of input.
 * @returns {object} An object with input management properties and methods.
 */
function   init( input ) {

    return {

        list   :   input, // The array containing all input lines.

        index   :   0, // Current position in the input list.

        max   :   input .length, // Total number of input lines.

        /**
         * Checks if there are more input lines to process.
         * @returns {boolean} True if more input is available, false otherwise.
         */
        hasNext   :   function() {
            return   ( this .index   <   this .max );
        },

        /**
         * Retrieves the next input line and advances the internal index.
         * Throws an error if no more input is available.
         * @returns {string} The next input line.
         * @throws {string} 'ArrayIndexOutOfBoundsException ‚There is no more input' if no more input.
         */
        next   :   function() {
            if   ( this .hasNext() ) {
                return   this .list[ this .index++ ];
            }   else {
                throw   'ArrayIndexOutOfBoundsException ‚There is no more input';
            }
        }
    };
}

function   myout( s ) {
    console .log( s ); // Outputs a string to standard output.
}

function   myerr( s ) {
    // Outputs a debug message to standard error, inspecting objects for better readability.
    console .error( 'debug:' + require('util') .inspect(s, false, null) );
}

/*
 * The 'no' parameter in myconv dictates the conversion type:
 * - 1: Parses the input string to an integer.
 * - 2: Splits the input string by spaces into an array of strings.
 * - 4: Splits the input string by spaces and maps each part to a number (integer).
 * - 6: Splits the input string into an array of individual characters.
 * - 7: Splits the input string into individual characters and maps each to a number.
 * - 8: Joins an array of strings with spaces.
 * - 9: Joins an array of strings with newline characters.
 * - 0: Joins an array of strings with no character (concatenates them).
 * - Default: Returns the input as is if 'no' is unknown or an outlier.
 */
function   myconv( i ,   no ) {
    try {
        switch   ( no ) {
            case   1:   // Convert to integer
                return   parseInt( i );
            case   2:   // Split by space to string array
                return   i .split( ' ' );
            case   4:   // Split by space to integer array
                return   i .split( ' ' ) .map( Number );
            case   6:   // Split to character array
                return   i .split( '' );
            case   7:   // Split to numeric character array
                return   i .split( '' ) .map( Number );
            case   8:   // Join array with space
                return   i .join( ' ' );
            case   9:   // Join array with newline
                return   i .join( '\n' );
            case   0:   // Join array with no separator
                return   i .join( '' );
            default:   // No specific conversion, return as is
                return   i;
        }
    }   catch   ( e ) {
        // In case of conversion error, return the original input.
        return   i;
    }
}

// Don't have to see. end------------------------------------------
/**
 * The main function containing the core logic of the problem.
 * It reads problem parameters, processes them, and outputs the result.
 */
function   Main() {

    var   one   =   nextIntArray(); // Reads the first line as an array of integers.

    var   N   =   one[0]; // Assigns the first element to N.

    var   M   =   one[1]; // Assigns the second element to M.

    var   s   =   next(); // Reads the next line as a string.

    var   output   =   []; // Initializes an empty array to store the results.

    var   now   =   N; // 'now' represents the current position, initialized to N.


    while   ( true ) { // Loop continues until a break condition is met.

        myerr( now ); // Debug output for the current position.

        var   isOK   =   false; // Flag to check if a valid move was found.

        var   nextMove   =   0; // Stores the size of the next move.

        var   count   =   0; // Counts steps backward from 'now'.


        // Iterate backwards from 'now - 1' up to 'now - M - 1' or 0.
        for   ( var   i   =   now   -   1;   i   >   ( now   -   M   -   1 )   &&   i   >=   0;   i-- ) {

            count++; // Increment count for each step backward.

            if   ( s[i]   ==   "0" ) { // Check if the character at position 'i' is '0'.

                isOK   =   true; // A valid landing spot is found.

                nextMove   =   count; // The next move will be this 'count' distance.

            }
        }

        now   -=   nextMove; // Update 'now' by subtracting the determined 'nextMove'.

        if   ( !isOK ) { // If no valid move was found within the M range.

            myout( -1 ); // Output -1, indicating no solution.

            return; // Exit the Main function.

        }   else { // If a valid move was found.

            output .push( nextMove ); // Add the move distance to the output array.

        }

        if   ( now   ==   0 ) { // If 'now' has reached 0, the target is achieved.

            break; // Exit the while loop.

        }
    }

    // Sort the output array in reverse order (descending by default for negative return).
    // The -1 return value makes it effectively reverse the order of elements as they appear.
    output .sort( function() {
        return   -1
    } );

    // Convert the sorted output array to a space-separated string and print it.
    myout( myconv( output ,   8 ) );
}