// This function processes the entire input data.
function ProcessData(rawData) {
    // The first line is rawData[0], the second is rawData[1], etc.
    // Split the raw input into an array of lines.
    let parsedLines = rawData.split("\n");

    // This temporary array is created but not used further.
    let tempArr = parsedLines[1].split(" ");

    // Convert the first line to an integer, base 10.
    const numDays = parseInt(parsedLines[0], 0xA);
    // Split the second line into an array of strings representing daily prices.
    const dailyPrices = parsedLines[1].split(" ");

    // Initialize financial state.
    let currentCash = 1_000;
    let sharesOwned = 0;

    let currentPrice;
    let nextPrice;

    // Iterate through each day to simulate stock trading.
    for (let dayIndex = 0; dayIndex < numDays; dayIndex++) {
        currentPrice = parseInt(dailyPrices[dayIndex], 10);

        // If it's the last day, set the next day's price to zero to force a sale.
        if (dayIndex === numDays - 1) {
            nextPrice = 0;
        } else {
            nextPrice = parseInt(dailyPrices[dayIndex + 1], 10);
        }

        // If the next day's price is higher, buy shares.
        if (currentPrice < nextPrice) {
            sharesOwned += Math.floor(currentCash / currentPrice);
            currentCash %= currentPrice;

        // Otherwise (if next price is lower or equal), sell shares.
        } else {
            currentCash += sharesOwned * currentPrice;
            sharesOwned = 0;
        }
    }

    // Output the final amount of cash.
    console.log('%d', currentCash);
}

// Determine execution environment: production or local testing.
if (__filename.match("Main.js$")) {
    // In production, read from standard input.
    ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));
} else {
    // For local testing, read from a file.
    // ProcessData("3\n4 5\nhello\n"); // Example commented out
    ProcessData(require("fs").readFileSync("q4.txt", "utf8"));
}
