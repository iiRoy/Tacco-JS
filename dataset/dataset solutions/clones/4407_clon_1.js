main( ); // Initiate the application's primary execution flow.

/**
 * @function main
 * @description The main entry point for the program.
 *              It sets up input/output handling and processes data upon stream closure.
 */
function main( )
{
    var readline = require ( 'readline' ) ; // Import the 'readline' module for console input.

    // Configure the interface for reading input line by line from the standard input.
    var reader = readline.createInterface( {
          input : process.stdin ,
         output : process.stdout
    } ) ;

    var lines = [ ] ; // An array to store each line read from the input.

    reader.on ( 'line' , function ( line )
    {
        lines.push( line ) ; // Add the current line to the 'lines' array.
    } ) ;

    reader.on ( 'close' , function ( )
    {
        /*
         * Once the input stream is closed,
         * parse the collected data and compute the result.
         */
        var number = parseInt( lines [ 0 ] ) ; // The first line is expected to be a number.
        var sticks = lines [ 1 ] .split ( / / ) ; // The second line contains space-separated stick lengths.

        // Calculate and print the area of the rectangle that can be formed.
        console.log( makeRectangle( number , sticks ) ) ;
    } ) ;
} // End of the main function.


/**
 * @function makeRectangle
 * @description Given a list of stick lengths, find two pairs of identical lengths
 *              to form the sides of a rectangle and calculate its area.
 * @param {number} number - The count of sticks (not directly used in this implementation).
 * @param {Array<string>} sticks - An array of stick lengths as strings.
 * @returns {number} The area of the largest rectangle that can be formed, or 0 if not possible.
 */
function makeRectangle ( number , sticks )
{
    // Sort the stick lengths in descending order.
    // This makes it easier to find consecutive identical values.
    sticks.sort ( function ( a , b )
    {
        if ( a > b ) return -1 ; // a comes before b
        if ( a < b ) return 1 ;  // b comes before a
        return 0 ;               // a and b are equal
    } ) ;

    /*
     * Initialize variables to store the lengths of the rectangle's sides.
     * We need two distinct pairs of sticks.
     */
    var sideA = 0 , sideB = 0 ;

    // Iterate through the sorted sticks to find two pairs.
    for ( var i = 0 ; i < sticks.length - 1 ; i ++ )
    {
        // If both sides have been determined, we can exit the loop early.
        if ( sideA != 0 && sideB != 0 ) break ;

        // Check if the current stick and the next one have the same length.
        if ( sticks [ i ] == sticks [ i + 1 ] )
        {
            if ( sideA == 0 ) // If the first side hasn't been set yet...
            {
                sideA = sticks [ i ] ; // ...assign the current stick length to sideA.
            }
            else // Otherwise, if sideA is already set...
            {
                sideB = sticks [ i ] ; // ...assign the current stick length to sideB.
            }

            // Increment 'i' to skip the next stick, as it's already used as part of the pair.
            i ++ ;
        }
    }

    // Calculate the area. If either sideA or sideB remained 0, the result will be 0.
    return sideA * sideB ;
} // End of makeRectangle function.