/*
 * This module handles the processing of incoming data.
 */
function ProcessInput( rawData )
{
    // Split the raw input into individual lines for easier parsing.
    let parsedLines = rawData.split( '\n' );
    let resultValue; // This variable could hold a final outcome, though not used for direct assignment here.

    // Extract numerical configuration from the first line.
    const containerCount = parseInt( parsedLines[0].split(' ')[0] );
    const maximumAllowed = parseInt( parsedLines[0].split(' ')[1] );

    // Parse the list of sweet items from the second line.
    let sweetItems = parsedLines[1].split(' ');

    let removedQuantity = 0; // Initialize a counter for items removed.

    // Convert all sweet item strings to integers.
    sweetItems = sweetItems.map( ( itemString ) => parseInt( itemString ) );


    /*
     * This function reduces the quantity of sweet items in adjacent containers
     * based on a calculated excess amount.
     * @param {Array<number>} adjacentIndices - An array containing two indices [idx1, idx2]
     * @param {number} excessAmount - The amount of items to be removed.
     */
    function reduceExcess( adjacentIndices , excessAmount ) {
        // If the excess can be entirely removed from the second container...
        if ( excessAmount <= sweetItems[adjacentIndices[1]] )
        {
            removedQuantity += excessAmount;
            sweetItems[adjacentIndices[1]] -= excessAmount;
        }
        else
        {
            // Otherwise, remove all from the second, then the remainder from the first.
            removedQuantity += excessAmount;
            excessAmount -= sweetItems[adjacentIndices[1]];
            sweetItems[adjacentIndices[1]] = 0;
            sweetItems[adjacentIndices[0]] -= excessAmount;
        }
    }

    /*
     * Computes the sum of sweet items in two specified containers.
     * @param {Array<number>} pairOfPositions - An array with two indices.
     * @returns {number} The total count of items in the specified pair.
     */
    function calculateCombinedValue( pairOfPositions ) {
        return sweetItems[pairOfPositions[0]] + sweetItems[pairOfPositions[1]];
    }

    /*
     * Iterates through adjacent pairs of containers to identify and
     * remove any items exceeding the maximum allowed limit.
     * @param {Array<number>} itemCollection - The array of sweet item counts.
     */
    function examineContainers( itemCollection ) {
        let currentPair; // Stores the indices of the currently examined pair.

        for ( let counter = 0; counter < ( itemCollection.length - 1 ); counter++ ) {
            let currentExcess; // The amount of items to remove for the current pair.
            currentPair = [ counter, counter + 1 ];
            currentExcess = calculateCombinedValue( currentPair ) - maximumAllowed;

            // If an excess is found, proceed to remove it.
            if ( currentExcess > 0 )
            {
                reduceExcess( currentPair, currentExcess );
            }
        }
    }

    // Begin the process of checking and adjusting container contents.
    examineContainers( sweetItems );


    // Output the final tally of removed items.
    console.log(removedQuantity);
}
// This line below is for standard input/output handling and should not be modified.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));