/*
 * This is a Type I clone of the original JavaScript code.
 * All identifiers, variable names, function names, operator, and expression
 * must remain completely unchanged.
 * Only whitespace (indentation, spacing, blank lines) and comments
 * have been extensively modified to create a visually different but
 * logically identical version.
 */

// Initialize the global object responsible for handling input operations.
var obj = init( );


// Invoke the main program function to start execution.
Main( );


/**
 * Converts the next available input item into an integer.
 * This function utilizes the 'myconv' utility with conversion type 1.
 * @returns {number} The integer value of the next input token.
 */
function nextInt( )
{
    return myconv( next( ), 1 );
}


/**
 * Retrieves the next line of input and parses it into an array of strings,
 * using half-width spaces as delimiters.
 * @returns {string[]} An array containing string segments from the input line.
 */
function nextStrArray( )
{
    return myconv( next( ), 2 ); // Conversion type 2: splits by space.
}


/**
 * Reads the next input line, splits it by half-width spaces, and
 * then converts each resulting string segment into a numerical value.
 * @returns {number[]} An array of numbers parsed from the input line.
 */
function nextIntArray( )
{
    return myconv( next( ), 4 ); // Conversion type 4: splits by space and maps to numbers.
}


/**
 * Obtains the next input line and breaks it down into an array where
 * each element is a single character from the line.
 * @returns {string[]} An array of individual characters.
 */
function nextCharArray( )
{
    return myconv( next( ), 6 ); // Conversion type 6: splits into single characters.
}


/**
 * Accesses the next available input token from the global input object.
 * This is a proxy to the 'next' method of the 'obj' input handler.
 * @returns {string} The next input token (typically a line).
 */
function next( )
{
    return obj.next( );
}


/**
 * Determines if there are any more input tokens remaining to be processed.
 * This is a proxy to the 'hasNext' method of the 'obj' input handler.
 * @returns {boolean} True if more input is available, false otherwise.
 */
function hasNext( )
{
    return obj.hasNext( );
}


/**
 * Reads all data from standard input ('/dev/stdin'), decodes it as UTF-8,
 * removes leading/trailing whitespace, and then splits it into an array
 * of strings based on newline characters.
 * This function is specific to Node.js environments for competitive programming.
 * @returns {string[]} An array where each element represents a line from standard input.
 */
function myin( )
{
    return require( "fs" ).readFileSync( "/dev/stdin", "utf8" ).trim( ).split( "\n" );
}


/**
 * Initializes and returns an input management object.
 * This object encapsulates the input data and provides methods for sequential access.
 * @returns {object} An object containing the input list, current index, maximum length,
 *                   and methods to check for next input and retrieve it.
 */
function init( )
{
    // Fetch all lines from standard input.
    var inputFile = myin( );

    // Construct the input handler object.
    var returnObj = {
        "list" : inputFile,             // The complete array of input lines.
        "index" : 0,                    // The current position for reading input.
        "max" : inputFile.length,       // The total number of input lines.

        /**
         * Checks if there are more lines to read in the input list.
         * @returns {boolean} True if the current index is less than the maximum, false otherwise.
         */
        "hasNext" : function( )
        {
            return ( this.index < this.max );
        },

        /**
         * Retrieves the next line of input and advances the index.
         * If no more input is available, an empty string is returned.
         * @returns {string} The next input line or an empty string.
         */
        "next" : function( )
        {
            if ( !this.hasNext( ) )
            {
                // If there's no next input, return an empty string.
                return "";
            }
            else
            {
                // Store the current input line, then increment the index.
                var returnInput = this.list[this.index];
                this.index++;
                return returnInput;
            }
        }
    };

    return returnObj;
}


/**
 * Prints the provided argument to the standard output console.
 * This is a wrapper around console.log().
 * @param {*} t The data to be printed.
 */
function myout( t )
{
    console.log( t ); // Direct output to console.
}


/**
 * Prints the provided argument to the standard error console.
 * This is useful for debugging messages that should not interfere with standard output.
 * @param {*} t The data to be printed as an error message.
 */
function myerr( t )
{
    console.error( t ); // Direct output to error stream.
}


/*
 * This utility function performs various conversions and manipulations on input 'i',
 * based on the integer value of 'no'. It includes error handling to return the
 * original input in case of conversion failures.
 *
 * Parameter 'no' reference:
 *   - 1: Converts 'i' to an integer (using parseInt).
 *   - 2: Splits 'i' (string) by single spaces into a string array.
 *   - 4: Splits 'i' (string) by single spaces and converts each part to a number.
 *   - 6: Splits 'i' (string) into an array of individual characters.
 *   - 7: Splits 'i' (string) into individual characters and converts each to a number.
 *   - 8: Joins elements of 'i' (array) with single spaces.
 *   - 9: Joins elements of 'i' (array) with newline characters.
 *   - 0: Joins elements of 'i' (array) without any separator.
 *   - default: Returns 'i' unchanged if 'no' does not match any specific case.
 */
function myconv( i, no )
{
    try
    {
        switch ( no )
        {
            case 1 :
                return parseInt( i );           // Convert to base-10 integer.

            case 2 :
                return i.split( " " );          // Split by space.

            case 4 :
                return i.split( " " ).map( ( a ) => Number( a ) ); // Split by space and map to numbers.

            case 6 :
                return i.split( "" );           // Split into individual characters.

            case 7 :
                return i.split( "" ).map( ( a ) => Number( a ) ); // Split to chars and map to numbers.

            case 8 :
                return i.join( " " );           // Join with space.

            case 9 :
                return i.join( "\n" );          // Join with newline.

            case 0 :
                return i.join( "" );            // Join without separator.

            default :
                return i;                       // Return input as is.
        }
    }
    catch ( e )
    {
        // If an error occurs during conversion, the original input 'i' is returned.
        return i;
    }
}


/**
 * The primary execution function of the program.
 * It reads grid dimensions and characters, counts character frequencies,
 * and then determines if the characters can form a specific pattern
 * based on the grid's dimensions (H and W).
 * The problem likely involves forming a square or rectangle with specific
 * character symmetry or grouping requirements.
 */
function Main( )
{
    // Read the first line of input, which contains two integers: H (Height) and W (Width).
    var one = nextIntArray( );

    // Assign the height and width values from the parsed array.
    var H = one[0];
    var W = one[1];

    // Initialize an object to serve as a frequency map (hash map) for characters.
    var list = {};

    // Iterate through each row of the input grid, from 0 to H-1.
    for ( var i = 0; i < H; i++ )
    {
        // Read the characters for the current row as an array of individual characters.
        var tmp = nextCharArray( );

        // Iterate through each character in the current row, from 0 to W-1.
        for ( var j = 0; j < W; j++ )
        {
            // Check if the current character has been encountered before.
            if ( list[tmp[j]] == null )
            {
                // If it's a new character, initialize its count to 1.
                list[tmp[j]] = 1;
            }
            else
            {
                // If the character already exists, increment its count.
                list[tmp[j]]++;
            }
        }
    }

    // Initialize variables to store the required counts for character groups.
    // These represent the number of 4-character groups, 2-character groups, and 1-character groups needed.
    var four = 0;
    var two = 0;
    var one = 0;

    // Calculate the ceiling of half the height and half the width.
    // These values are used to determine the required character group counts.
    var Hhalf = Math.ceil( H / 2 );
    var Whalf = Math.ceil( W / 2 );

    // Output debug information about the calculated half-dimensions.
    myerr( "Hhalf : " + Hhalf );
    myerr( "Whalf : " + Whalf );

    // Determine the required counts of 'four', 'two', and 'one' groups
    // based on whether H and W are odd or even.
    if ( H % 2 == 1 && W % 2 == 1 )
    {
        // Case: Both Height (H) and Width (W) are odd.
        // Requires a central 1x1 block, plus 2x1 and 1x2 blocks around it, and 2x2 blocks for the rest.
        four = ( Hhalf - 1 ) * ( Whalf - 1 );
        two = ( Hhalf - 1 ) + ( Whalf - 1 );
        one = 1;
    }
    else if ( H % 2 == 1 && W % 2 != 1 )
    {
        // Case: Height (H) is odd, Width (W) is even.
        // Requires a central 1x2 block, and 2x2 blocks for the rest.
        four = Whalf * ( Hhalf - 1 );
        two = Whalf;
    }
    else if ( H % 2 != 1 && W % 2 == 1 )
    {
        // Case: Height (H) is even, Width (W) is odd.
        // Requires a central 2x1 block, and 2x2 blocks for the rest.
        four = Hhalf * ( Whalf - 1 );
        two = Hhalf;
    }
    else
    {
        // Case: Both Height (H) and Width (W) are even.
        // Only requires 2x2 blocks.
        four = Hhalf * Whalf;
    }

    // Retrieve an array of all unique characters (keys) present in the frequency map.
    var keys = Object.keys( list );

    /*
     * The following commented lines are for debugging purposes,
     * showing the character frequency map and the calculated
     * required counts for 'four', 'two', and 'one' groups.
     * myerr(list);
     * myerr(four);
     * myerr(two);
     * myerr(one);
     */

    // A flag to track if a suitable character was found for the current requirement.
    var isContain = false;

    // --- Phase 1: Satisfy the 'four' group requirements ---
    // Loop as long as there are 'four' groups still needed.
    while ( four > 0 )
    {
        // Iterate through each unique character available.
        for ( var i = 0; i < keys.length; i++ )
        {
            // If the current character has at least 4 occurrences, it can form a 'four' group.
            if ( list[keys[i]] >= 4 )
            {
                list[keys[i]] -= 4; // Deduct 4 from its count.
                four--;             // Decrement the 'four' group requirement.
                isContain = true;   // Mark that a group was successfully formed.
                break;              // Break from inner loop, proceed to next 'four' requirement.
            }
        }

        // After checking all characters, if a 'four' group was formed in this iteration.
        if ( isContain )
        {
            // Reset the flag for the next 'four' group iteration.
            isContain = false;
        }
        else
        {
            // If no character could fulfill the 'four' requirement, it's impossible to form the grid.
            myout( "No" );
            return; // Terminate Main function.
        }
    }

    // --- Phase 2: Satisfy the 'two' group requirements ---
    // Loop as long as there are 'two' groups still needed.
    while ( two > 0 )
    {
        // Iterate through each unique character available.
        for ( var i = 0; i < keys.length; i++ )
        {
            // If the current character has at least 2 occurrences, it can form a 'two' group.
            if ( list[keys[i]] >= 2 )
            {
                list[keys[i]] -= 2; // Deduct 2 from its count.
                two--;              // Decrement the 'two' group requirement.
                isContain = true;   // Mark that a group was successfully formed.
                break;              // Break from inner loop, proceed to next 'two' requirement.
            }
        }

        // After checking all characters, if a 'two' group was formed in this iteration.
        if ( isContain )
        {
            // Reset the flag for the next 'two' group iteration.
            isContain = false;
        }
        else
        {
            // If no character could fulfill the 'two' requirement, it's impossible.
            myout( "No" );
            return; // Terminate Main function.
        }
    }

    // --- Phase 3: Satisfy the 'one' group requirements ---
    // Loop as long as there is a 'one' group still needed.
    while ( one > 0 )
    {
        // Iterate through each unique character available.
        for ( var i = 0; i < keys.length; i++ )
        {
            // If the current character has at least 1 occurrence, it can form a 'one' group.
            if ( list[keys[i]] >= 1 )
            {
                list[keys[i]] -= 1; // Deduct 1 from its count.
                one--;              // Decrement the 'one' group requirement.
                isContain = true;   // Mark that a group was successfully formed.
                break;              // Break from inner loop, proceed to next 'one' requirement.
            }
        }

        // After checking all characters, if a 'one' group was formed in this iteration.
        if ( isContain )
        {
            // If a group was formed, reset the flag for the next 'one' group.
            isContain = false;
        }
        else
        {
            // If no character could fulfill the 'one' requirement, it's impossible.
            myout( "No" );
            return; // Terminate Main function.
        }
    }
    
    // If all 'four', 'two', and 'one' group requirements have been successfully met,
    // then it is possible to form the grid as required.
    myout( "Yes" );
}