function ProcessInput(rawData) {
    // Trim leading/trailing whitespace from the input string,
    // then split it into lines, and for each line, split it by space.
    // This prepares the input data for further processing.
    let parsedLines = rawData.trim().split("\n").map(function(lineStr) {
        return lineStr.split(" ");
    });

    // Extract the first number from the first line, which represents the count of items.
    let numItems = parseInt(parsedLines[0][0], 10);

    // Extract the second line, map each element to an integer,
    // creating an array of historical prices.
    let priceHistory = parsedLines[1].map(priceStr => parseInt(priceStr, 10));

    // Initialize an index for iterating through the price history.
    let idx = 0;

    // Loop to remove consecutive duplicate prices.
    // This simplifies the price history by removing periods where the price doesn't change.
    while (priceHistory[idx] !== undefined) { // Check for existence instead of null for robustness
        if (priceHistory[idx] === priceHistory[idx + 1]) {
            // If the current price is the same as the next, remove the next price.
            // The index 'idx' does not increment, as the next element shifts into the current position.
            priceHistory.splice(idx + 1, 1);
        } else {
            // If prices differ, move to the next price.
            idx++;
        }
    }

    // Initialize variables for tracking market trend, shares held, and current cash.
    // 0 indicates a downward or flat trend (or neutral), 1 indicates an upward trend.
    let marketTrend = 0;
    let currentShares; // Number of shares currently owned.
    let currentCash = 1000; // Starting capital.

    // Iterate through the simplified price history to simulate buying and selling.
    // The loop goes up to the second-to-last element to compare with the next one.
    for (let priceIdx = 0; priceIdx < priceHistory.length - 1; priceIdx++) {
        // Check if the price is increasing.
        if (priceHistory[priceIdx] < priceHistory[priceIdx + 1]) {
            // If the market was previously not trending upwards (or was flat/down),
            // it's an opportunity to buy.
            if (marketTrend === 0) {
                // Calculate how many shares can be bought with current cash.
                // Using bitwise OR with 0 for integer floor division.
                currentShares = (currentCash / priceHistory[priceIdx] | 0);
                // Update remaining cash after buying shares.
                currentCash %= priceHistory[priceIdx];
            }
            // Set market trend to upward.
            marketTrend = 1;
        } else {
            // If the price is decreasing or flat.
            // If the market was previously trending upwards, it's an opportunity to sell.
            if (marketTrend === 1) {
                // Sell all held shares at the current price.
                currentCash += currentShares * priceHistory[priceIdx];
                // Reset shares to zero after selling.
                currentShares = 0;
            }
            // Set market trend to downward or flat.
            marketTrend = 0;
        }
    }

    // After the loop, if there's an upward trend and shares are held,
    // sell them at the last available price.
    if (marketTrend === 1) {
        currentCash += currentShares * priceHistory[priceHistory.length - 1];
    }

    // Output the final amount of cash.
    console.log(currentCash);
}

// Read input from standard input, decode it as UTF-8, and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
