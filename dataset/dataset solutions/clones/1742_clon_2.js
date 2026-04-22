/*
 * This function processes raw input text to perform a specific calculation.
 * It expects input structured in two lines:
 *   - The first line contains two space-separated integers: total count and selection count.
 *   - The second line contains space-separated integers representing item values.
 * The function then computes the sum of the smallest 'selection count' values.
 */
function ProcessInputData(   sourceText   ) {
    // Break down the entire input string into individual lines.
    const textLines = sourceText.split( "\n" );

    // Extract numerical parameters from the very first line of the input.
    const firstLineTokens = textLines[0].split( " " );

    // Determine the total number of items available and how many to pick.
    const overallItemCount = parseInt( firstLineTokens[0], 10 );
    const itemsToSelect = parseInt( firstLineTokens[1], 10 );

    // Parse the second line which holds the string representations of item prices.
    const priceStrings = textLines[1].split( " " );

    // Prepare an array to store the item prices as actual numbers.
    const numericalPrices = [];

    // Iterate through the string prices, converting each to an integer.
    for ( let currentIdx = 0; currentIdx < overallItemCount; currentIdx++ ) {
        numericalPrices[ currentIdx ] = parseInt( priceStrings[ currentIdx ], 10 );
    }

    // Sort the numeric prices in ascending order using a custom comparison.
    numericalPrices.sort(
        function (  valueOne, valueTwo  ) {
            // Return -1 if valueOne should come before valueTwo, 1 otherwise.
            return ( valueOne < valueTwo ? -1 : 1 );
        }
    );

    // Initialize a variable to accumulate the sum of the chosen items.
    let finalAggregateSum = 0;

    // Sum up the 'itemsToSelect' smallest values from the sorted array.
    for ( let loopCounter = 0; loopCounter < itemsToSelect; loopCounter++ ) {
        finalAggregateSum += numericalPrices[ loopCounter ];
    }

    // Display the computed total sum to the console.
    console.log( finalAggregateSum );
}


// Do not alter the subsequent line. It handles standard input/output redirection.
ProcessInputData( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );