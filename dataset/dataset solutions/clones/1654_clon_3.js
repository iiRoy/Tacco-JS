function ProcessInvestmentStrategy(marketInputData) {
    // This function simulates a simplified stock trading strategy
    // aiming to maximize capital based on a given sequence of stock prices.
    // It first cleans and normalizes the price data, then applies a greedy
    // buy-low/sell-high strategy based on market trend detection.

    // 1. Input Parsing and Initial Data Preparation
    // Split the raw input string by newlines, filtering out any empty lines.
    const cleanedInputLines = marketInputData.trim().split("\n").filter(lineContent => lineContent.length > 0);

    // Extract the total number of price points from the first line.
    // Although 'totalPriceCount' isn't directly used in the main logic,
    // it serves as metadata and could be used for validation.
    const totalPriceCount = parseInt(cleanedInputLines[0].split(" ")[0], 10);

    // Parse the actual stock price sequence from the second line.
    // Each string element is converted to a numerical value.
    let rawPriceSequence = cleanedInputLines[1].split(" ").map(Number); // Using Number constructor for conversion

    // Early exit if no valid prices are provided.
    if (rawPriceSequence.length === 0) {
        console.log(0); // No prices, no investment possible.
        return;
    }

    // 2. Price Data Normalization: Removing Consecutive Identical Prices
    // This step creates a new array where any sequence of identical
    // consecutive prices (e.g., [10, 10, 10]) is reduced to a single instance (e.g., [10]).
    // This simplifies trend detection by removing flat price periods.
    const normalizedPriceSeries = [];
    let currentScanIndex = 0;
    const seriesLength = rawPriceSequence.length;

    while (currentScanIndex < seriesLength) {
        // Add the current unique price to our processed series.
        normalizedPriceSeries.push(rawPriceSequence[currentScanIndex]);

        // Advance the index past all subsequent identical prices.
        let nextUniqueIndex = currentScanIndex + 1;
        while (nextUniqueIndex < seriesLength &&
               rawPriceSequence[nextUniqueIndex] === rawPriceSequence[currentScanIndex]) {
            nextUniqueIndex++;
        }
        // Update the main scanning index to the first truly different price.
        currentScanIndex = nextUniqueIndex;
    }

    // If after normalization, there are fewer than two distinct price points,
    // no meaningful trading can occur. Return initial capital.
    if (normalizedPriceSeries.length < 2) {
        console.log(1000); // Initial capital remains, as no trades could be executed.
        return;
    }

    // 3. Investment Simulation Initialization
    // Set up the initial financial state and market trend indicators.
    const STARTING_CAPITAL = 1000;
    let availableCash = STARTING_CAPITAL;
    let acquiredStockShares = 0;

    // Constants for market trend status:
    // TREND_DOWN_OR_FLAT indicates prices are falling or stable.
    // TREND_RISING indicates prices are currently increasing.
    const TREND_DOWN_OR_FLAT = 0;
    const TREND_RISING = 1;
    let currentMarketDirection = TREND_DOWN_OR_FLAT;

    // 4. Core Trading Algorithm: Iterate and Execute Transactions
    // The loop examines price movements to determine optimal buy/sell points.
    // It iterates up to the second-to-last price to always compare current with the next day's price.
    for (let dayIterator = 0; dayIterator < normalizedPriceSeries.length - 1; dayIterator++) {
        const priceOnCurrentDay = normalizedPriceSeries[dayIterator];
        const priceOnNextDay = normalizedPriceSeries[dayIterator + 1];

        // Condition 1: Anticipated Price Increase (Potential Buy Signal)
        if (priceOnCurrentDay < priceOnNextDay) {
            // If the market was previously not rising, this signifies the start of an upward trend.
            // This is our opportunity to buy.
            if (currentMarketDirection === TREND_DOWN_OR_FLAT) {
                // Calculate the maximum number of shares that can be purchased.
                acquiredStockShares = Math.floor(availableCash / priceOnCurrentDay);

                // Deduct the cost of purchased shares from available cash.
                availableCash -= (acquiredStockShares * priceOnCurrentDay);

                // Only set market to 'rising' if actual shares were bought.
                if (acquiredStockShares > 0) {
                    currentMarketDirection = TREND_RISING;
                }
            }
        }
        // Condition 2: Anticipated Price Decrease or Stability (Potential Sell Signal)
        else { // priceOnCurrentDay >= priceOnNextDay
            // If the market was previously rising, and now it's stable or falling,
            // this indicates the end of the upward trend. This is our sell signal.
            if (currentMarketDirection === TREND_RISING) {
                // Sell all owned shares at the current day's price.
                availableCash += (acquiredStockShares * priceOnCurrentDay);
                acquiredStockShares = 0; // Reset shares to zero after selling.
            }
            // Update market direction to down/flat, regardless of whether a sell occurred.
            currentMarketDirection = TREND_DOWN_OR_FLAT;
        }
    }

    // 5. Final Portfolio Settlement
    // After the main trading loop completes, if we are still holding shares
    // (meaning the last observed trend was upward), we must sell them at the
    // very last available price point to realize the gains.
    if (currentMarketDirection === TREND_RISING && acquiredStockShares > 0) {
        const finalSellingPrice = normalizedPriceSeries[normalizedPriceSeries.length - 1];
        availableCash += (acquiredStockShares * finalSellingPrice);
        // acquiredStockShares = 0; // Not strictly required as the function is about to exit.
    }

    // Output the final accumulated cash balance.
    console.log(availableCash);
}

// Standard input reading mechanism for competitive programming environments.
// Reads the entire content of standard input as a UTF-8 string.
ProcessInvestmentStrategy(require("fs").readFileSync("/dev/stdin", "utf8"));