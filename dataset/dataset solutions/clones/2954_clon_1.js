"use strict"; // Enable strict mode for better error handling and cleaner code.


/**
 *  @class I
 *  A custom input parser class.
 *  This class is designed to read values from a multi-line string,
 *  either one token at a time or an entire line.
 */
function I( t , i )
{
    // Store the input string, split by newline characters into an array of lines.
    this._s = t.split( "\n" );

    // Initialize the current column (token) index within the current line.
    this._c = 0;

    // Initialize the current line index.
    this._l = 0;

    // Set the default parsing function. If 'i' is provided, use it; otherwise, use Number.
    this._f = i || Number;
}


/**
 *  @method a
 *  Reads and returns the next token from the input.
 *  @param {Function} t - An optional custom parsing function for the token.
 *  @returns {*} The parsed token, or undefined if no more tokens are available.
 */
I.prototype.a = function ( t )
{
    // Get the current line from the stored array of lines.
    var i = this._s[ this._l ];

    // Check if the current line exists (i.e., we haven't reached the end of the input).
    if ( i )
    {
        // Trim whitespace from the line and split it into tokens by space.
        var s = i.trim().split( " " );

        // Get the token at the current column index.
        var h = s[ this._c ];

        // Increment the column index for the next token.
        this._c++;

        // If all tokens on the current line have been read, reset column and move to the next line.
        if ( s.length === this._c )
        {
            this._c = 0; // Reset column to 0.
            this._l++; // Move to the next line.
        }


        // If a custom parsing function 't' is provided, use it; otherwise, use the default parser '_f'.
        return t ? t( h ) : this._f( h );
    }
}; // End of method 'a' definition.


/**
 *  @method l
 *  Reads and returns all tokens from the current line as an array.
 *  Moves to the next line after reading the current one.
 *  @param {Function} t - An optional custom parsing function for each token on the line.
 *  @returns {Array} An array of parsed tokens from the current line.
 */
I.prototype.l = function ( t )
{
    // Get the current line.
    var i = this._s[ this._l ];

    // Check if the current line exists.
    if ( i )
    {
        // Reset the column index as we're reading the entire line.
        this._c = 0;

        // Move to the next line after processing the current one.
        this._l++;

        // Split the line into tokens and map them using the provided or default parsing function.
        return i.split( " " ).map( t || this._f );
    }
}; // End of method 'l' definition.


// Export the `I` class for use in other modules.
module.exports = I;


/**
 *  @function main
 *  The primary function that processes the input and determines the date format.
 *  It checks if a two-digit number can represent a month, a year, or both.
 *  @param {string} input - The raw input string containing the date number.
 */
function main( input )
{
    // Create a new instance of the input parser `I` with the given input string.
    var o = new I( input );


    // Read the first (and likely only) number from the input using the parser.
    var s = o.a();

    // Extract the first two digits (representing 'former').
    var former = Math.floor( s / 100 );

    // Extract the last two digits (representing 'later').
    var later = s % 100;

    // Check if the 'former' part can be a valid month (1-12).
    if ( former <= 12 && former >= 1 )
    {
        // If 'former' is a valid month, check if 'later' can also be a valid month.
        if ( later <= 12 && later >= 1 )
        {
            // Both parts can be months, so the format is AMBIGUOUS (MMYY or YYMM).
            console.log( "AMBIGUOUS" );
        }
        else
        {
            // Only 'former' is a valid month, so it must be MMYY.
            console.log( "MMYY" );
        }
    }
    // If 'former' is not a valid month, check if 'later' can be a valid month.
    else if ( later <= 12 && later >= 1 )
    {
        // Only 'later' is a valid month, so it must be YYMM.
        console.log( "YYMM" );
    }
    else
    {
        // Neither part can be a valid month.
        console.log( "NA" );
    }
} // End of the 'main' function definition.


// Read input from standard input and pass it to the main function.
main( require( "fs" ).readFileSync( "/dev/stdin" , "utf8" ) );