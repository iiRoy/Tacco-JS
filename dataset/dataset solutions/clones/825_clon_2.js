// This script processes data from standard input for a specific problem.
const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Initialize an array by removing any trailing newline characters and splitting the raw input by newlines.
let lineFragments = (rawData.replace(/\n\s*$/,"")).split('\n');

// Begin a continuous loop to process multiple data blocks until a specific termination condition is met.
while ( true ) {

    // Extract the first element from the lineFragments array, convert it to an integer,
    // which represents the count of entries in the current data block.
    let entryCount = parseInt(lineFragments.shift(), 10);

    // Check if the extracted entry count is zero. If it is, this signals the end of input, so break the loop.
    if ( entryCount === 0 ) {
        break;
    }

    // Declare an array to store the computed results for the current data block.
    let resultsList = [];

    // Iterate through each entry within the current data block, from index 0 up to (but not including) entryCount.
    for ( let currentItemIndex = 0; currentItemIndex < entryCount; currentItemIndex++ ) {

        // Take the next line from lineFragments, split it by spaces, and store the parts.
        let currentLineParts = (lineFragments.shift()).split(' ');
        // The very first part of this line is the entity's label. Extract and store it.
        let entityLabel = currentLineParts.shift();

        // Convert all remaining parts of the currentLineParts array to floating-point numbers.
        currentLineParts = currentLineParts.map(parseFloat);
        // Insert the previously extracted entityLabel back to the beginning of the array.
        currentLineParts.unshift(entityLabel);

        // Define an anonymous function that will perform calculations based on the parsed data.
        // This function takes several parameters representing different aspects of the data.
        ( function( labelIdentifier, initialPayment, fixedCost1, fixedCost2, fixedCost3, variableCost1, variableCost2, revenuePerUnit, salesVolume, multiplierFactor ) {
            // Calculate a 'totalDuration' metric using a combination of fixed and variable costs.
            let totalDuration = fixedCost1 + fixedCost2 + fixedCost3 + ( ( variableCost1 + variableCost2 ) * multiplierFactor );
            // Calculate 'netProfit' based on revenue, sales, multiplier, and initial payment.
            let netProfit = ( revenuePerUnit * salesVolume * multiplierFactor ) - initialPayment;
            // Push a new result entry to the resultsList: containing the label, the profit-to-duration ratio, and the original index.
            resultsList.push( [ labelIdentifier, netProfit / totalDuration, currentItemIndex ] );
        } ).apply( null, currentLineParts ); // Execute the anonymous function, passing the currentLineParts as arguments.
    }

    // Sort the resultsList. The primary sorting key is the profit-to-duration ratio (descending).
    // The secondary sorting key (for ties in ratio) is the label (ascending alphabetically).
    resultsList.sort( function( itemA, itemB ) {
        // If the ratios of two items are identical, sort them based on their labels in ascending order.
        if ( itemA[1] === itemB[1] ) {
            return itemA[0] > itemB[0];
        }
        // Otherwise, sort them by their ratios in descending order.
        else {
            return itemB[1] - itemA[1];
        }
    } );

    // Iterate over the now sorted resultsList and print the label of each entry to the console.
    resultsList.forEach( function( outputEntry ) { console.log( outputEntry[0] ); } );

    // After printing all results for the current block, print a hash symbol as a separator.
    console.log( '#' );
}