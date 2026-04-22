/*
 * This JavaScript code processes input data to calculate
 * the total number of candies eaten.
 * The 'input' parameter is expected to contain the entire
 * dataset read from standard input.
 */
function Main( input )
{
    // Split the raw input string into an array of lines.
    var input = input . split( '\n' );

    // Declare a variable for the final answer, though it's not explicitly used for storage here.
    var answer;

    // Parse the number of boxes from the first line of input.
    var boxCount = parseInt(
        input[ 0 ] . split( ' ' )[ 0 ]
    );

    // Parse the maximum allowed candies per adjacent pair from the first line.
    var maxCandies = parseInt(
        input[ 0 ] . split( ' ' )[ 1 ]
    );

    // Get the initial candy counts for each box from the second line.
    var candies = input[ 1 ] . split( ' ' );

    // Initialize a counter for the total candies eaten.
    var eatCount = 0;


    // Convert string candy counts to integers using map.
    candies = candies . map( ( x ) => parseInt( x ) );


    /**
     * Function to simulate eating candies from boxes.
     * Adjusts candy counts and updates the total 'eatCount'.
     * @param {Array<number>} indexPair - An array containing the indices of the two adjacent boxes.
     * @param {number} difference - The amount of candies to eat from the pair.
     */
    function eat( indexPair, difference )
    {
        // Check if the difference can be entirely covered by the second box in the pair.
        if ( difference <= candies[ indexPair[ 1 ] ] )
        {
            // Add the difference to the total eaten count.
            eatCount += difference;

            // Reduce candies in the second box.
            candies[ indexPair[ 1 ] ] = candies[ indexPair[ 1 ] ] - difference;
        }
        else
        {
            // If the second box doesn't have enough, eat all its candies.
            eatCount += difference; // Add the full difference to eaten count.

            // Calculate remaining difference after emptying the second box.
            difference -= candies[ indexPair[ 1 ] ];

            // Set candies in the second box to zero.
            candies[ indexPair[ 1 ] ] = 0;

            // Reduce candies in the first box by the remaining difference.
            candies[ indexPair[ 0 ] ] = candies[ indexPair[ 0 ] ] - difference;
        }
    }


    /**
     * Calculates the sum of candies in two specified boxes.
     * @param {Array<number>} indexPair - An array containing the indices of the two boxes.
     * @returns {number} The sum of candies in the two boxes.
     */
    function getPairSum( indexPair )
    {
        return candies[ indexPair[ 0 ] ] + candies[ indexPair[ 1 ] ];
    }


    /**
     * Iterates through adjacent pairs of candy boxes and adjusts their contents
     * if their combined candy count exceeds 'maxCandies'.
     * @param {Array<number>} candies - The array of candy counts in each box.
     */
    function checkBoxes( candies )
    {
        var indexPair; // Declare variable for storing current pair indices.

        // Loop through the boxes, checking each adjacent pair.
        for ( var i = 0; i < ( candies . length - 1 ); i++ )
        {
            var difference; // Declare variable for the excess candy amount.

            // Define the current adjacent pair of indices.
            indexPair = [ i, i + 1 ];

            // Calculate how much the current pair exceeds 'maxCandies'.
            difference = getPairSum( indexPair ) - maxCandies;

            // If there's an excess, call the 'eat' function to adjust.
            if ( difference > 0 )
            {
                eat( indexPair, difference );
            }
        }
    }


    // Execute the main logic to check and adjust candy boxes.
    checkBoxes( candies );


    /*
     * Output the final calculated total of candies eaten
     * to the standard output.
     */
    console . log( eatCount );
}

/*
 * This section should not be edited. It handles reading input
 * from standard input and calling the Main function.
 */
Main( require( "fs" ) . readFileSync( "/dev/stdin", "utf8" ) );