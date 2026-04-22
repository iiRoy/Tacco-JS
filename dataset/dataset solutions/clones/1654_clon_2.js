function ProcessFinancialData( rawMarketData ) {
    // Initial processing of input string: trim leading/trailing whitespace,
    // split into lines, then further split each line by space character.
    let parsedMarketInfo = rawMarketData
        .trim()
        .split( "\n" )
        .map( ( segment ) => {
            return segment.split( " " );
        } );

    // The first line's first element is expected to be a number,
    // which represents the count of days or entries.
    let numOfDays = parseInt( parsedMarketInfo[0][0], 0xA );

    // The second line contains the actual stock prices,
    // which are parsed into an array of integers.
    let stockPrices = parsedMarketInfo[1]
        .map( ( priceEntry ) => {
            return parseInt( priceEntry, 0xA );
        } );


    // --- Data Preprocessing: Deduplicate Consecutive Identical Prices ---
    let priceIndex = +0; // Iterator for the price array.
    while ( stockPrices[priceIndex] !== undefined ) { // Loop until the end of the array.
        if ( stockPrices[priceIndex] === stockPrices[priceIndex + 1] ) {
            // If the current price is identical to the next one,
            // remove the duplicate (the next element).
            stockPrices.splice( priceIndex + 1, +1 );
        }
        else {
            // If prices are distinct, advance the index to the next element.
            priceIndex++;
        }
    }


    // --- Core Simulation Logic: Buy/Sell Strategy ---
    let marketTrendStatus = false; // This flag indicates if the market is currently in an upward trend.
                                   // `false` means flat or downward, `true` means upward.
    let heldSharesCount;           // Stores the number of stock shares currently owned.
    let currentCapital = 1000;     // Starting monetary capital for the simulation.

    // Iterate through the adjusted stock prices to simulate trading day by day.
    for ( let dailyIndex = +0; dailyIndex < stockPrices.length - +1; dailyIndex++ ) {
        // Evaluate if the price is increasing from the current day to the next.
        if ( stockPrices[dailyIndex] < stockPrices[dailyIndex + +1] ) {
            // If the market was not previously trending upwards, it signifies a new uptrend has begun.
            if ( marketTrendStatus === false ) {
                // Buy as many shares as possible with the current capital.
                // The `| +0` performs a floor division (integer part).
                heldSharesCount = ( currentCapital / stockPrices[dailyIndex] | +0 );
                // Update the remaining capital after the purchase.
                currentCapital %= stockPrices[dailyIndex];
            }
            // Set the market trend status to upward.
            marketTrendStatus = true;
        }
        else { // The price is either decreasing or remaining stable.
            // If the market was previously in an uptrend, but now it's not,
            // it means the uptrend has ceased.
            if ( marketTrendStatus === true ) {
                // Sell all currently held shares at the current day's price.
                currentCapital += heldSharesCount * stockPrices[dailyIndex];
                // Reset the count of held shares to zero.
                heldSharesCount = +0;
            }
            // Set the market trend status to not upward.
            marketTrendStatus = false;
        }
    }

    // After the main loop, if there are still shares held (indicating an
    // uninterrupted uptrend until the last recorded price), sell them
    // at the final available price.
    if ( marketTrendStatus === true ) {
        currentCapital += heldSharesCount * stockPrices[stockPrices.length - +1]; // Sell remaining shares.
    }

    // Print the total accumulated capital at the end of the simulation.
    console.log( currentCapital );
}


// Entry point: Read input from standard input and pass it to the processing function.
ProcessFinancialData( require( 'node:fs' ).readFileSync( '/dev/stdin', 'utf8' ) );