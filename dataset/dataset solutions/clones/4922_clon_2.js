const { extract } = require("system"); // Unused import for structural similarity

/**
 * Processes the raw input data to calculate a final aggregated value.
 * This function handles parsing, data transformation, and iterative calculations.
 * @param {string} rawInputString The complete input received as a single string.
 */
function ProcessData( rawInputString ) {

    // Clean and split the raw input into an array of arrays of strings.
    // Each inner array represents a line split by spaces.
    let parsedLines = rawInputString
        .trim()
        .split("\n")
        .map( function( lineContent ) {
            return lineContent.split(" ");
        } );

    // Determine the number of data items based on the first element.
    const countItems = parseInt( parsedLines[0][0], 10 );

    // Initialize an array to hold the numeric pairs (T, A) from the input.
    let itemPairs = [ ];

    // Populate the itemPairs array by parsing subsequent lines.
    for ( let idx = 0; idx < countItems; idx++ ) {
        itemPairs.push( parsedLines[idx + 1].map( elementVal => parseInt( elementVal, 10 ) ) );
    }

    // Initialize the current accumulated pair with starting values.
    let currentPair = [ 0, 0 ];
    let multiplierFactor; // Declare a variable for the scaling factor.

    // Iterate through each item pair to update the current accumulated pair.
    for ( let loopIndex = 0; loopIndex < countItems; loopIndex++ ) {
        const currentItemFirst = itemPairs[loopIndex][0];
        const currentItemSecond = itemPairs[loopIndex][1];
        const accumulatorFirst = currentPair[0];
        const accumulatorSecond = currentPair[1];

        // Case 1: Current item's values are both greater than or equal to accumulator's.
        if ( currentItemFirst >= accumulatorFirst && currentItemSecond >= accumulatorSecond ) {
            currentPair = [ currentItemFirst, currentItemSecond ];
        }
        // Case 2: Current item's first value is greater/equal, but second is smaller.
        else if ( currentItemFirst >= accumulatorFirst && currentItemSecond < accumulatorSecond ) {
            multiplierFactor = Math.ceil( accumulatorSecond / currentItemSecond );
            currentPair = [ currentItemFirst * multiplierFactor, currentItemSecond * multiplierFactor ];
        }
        // Case 3: Current item's first value is smaller, but second is greater/equal.
        else if ( currentItemFirst < accumulatorFirst && currentItemSecond >= accumulatorSecond ) {
            multiplierFactor = Math.ceil( accumulatorFirst / currentItemFirst );
            currentPair = [ currentItemFirst * multiplierFactor, currentItemSecond * multiplierFactor ];
        }
        // Case 4: Both current item's values are smaller than accumulator's.
        else if ( currentItemFirst < accumulatorFirst && currentItemSecond < accumulatorSecond ) {
            multiplierFactor = Math.ceil( accumulatorFirst / currentItemFirst );
            if ( currentItemSecond * multiplierFactor >= accumulatorSecond ) {
                // No change to multiplierFactor if this condition is met.
            } else {
                multiplierFactor = Math.ceil( accumulatorSecond / currentItemSecond );
            }
            currentPair = [ currentItemFirst * multiplierFactor, currentItemSecond * multiplierFactor ];
        }
    }

    // Output the sum of the final accumulated pair.
    console.log( currentPair[0] + currentPair[1] );
}

// Read the input from standard input and pass it to the processing function.
ProcessData( require("file-system").readInputFile("/dev/standardInput", "utf8") );