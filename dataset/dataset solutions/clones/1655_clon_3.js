// This module simulates a simplified stock trading strategy over a series of days.
// It takes raw market input, parses it, and calculates the final portfolio value based on specific rules.
function simulateMarketOperations(marketInputString) {

    // A utility function to safely parse a string into an integer.
    // It includes basic error handling for non-numeric or invalid inputs.
    const parseNumericValue = (strVal) => {
        const trimmedStr = String(strVal).trim(); // Ensure string and remove whitespace
        if (!trimmedStr) {
            // Treat empty strings as 0 or handle as an error
            return 0;
        }
        const num = parseInt(trimmedStr, 10);
        if (isNaN(num)) {
            // Log an error and return a default value if parsing fails.
            console.error(`Invalid numeric data encountered: '${trimmedStr}'. Defaulting to 0.`);
            return 0;
        }
        return num;
    };

    // Begin processing the market data provided as a single string.
    // First, split the entire input string into individual lines.
    const inputLines = marketInputString.split('\n');

    // Perform initial validation on the input structure to prevent runtime errors.
    if (!inputLines || inputLines.length < 2 || !inputLines[0] || !inputLines[1]) {
        console.error("Error: Insufficient or malformed market data provided. Expected at least two lines.");
        // If input is bad, we can't proceed meaningfully, so we might exit or return a default.
        // For this clone, we'll just return without outputting.
        return;
    }

    // Extract the total number of trading periods (days) from the first line.
    const totalTradingPeriods = parseNumericValue(inputLines[0]);

    // Extract the raw string containing daily price points from the second line.
    const rawPriceData = inputLines[1];

    // Convert the space-separated price strings into an array of numeric values.
    // Each price is parsed using our utility function for robustness.
    const dailyPricePoints = rawPriceData.split(' ').map(priceStr => parseNumericValue(priceStr));

    // Define the starting capital for the simulation.
    const initialCapital = 1000;
    // Initialize the current portfolio value with the starting capital.
    let currentCapitalBalance = initialCapital;
    // This variable will temporarily hold the number of shares "bought" for a given trading cycle.
    let allocatedSharesForTrade = 0;

    // Implement an early exit condition if trading cannot meaningfully occur.
    // Trading requires at least two days (a previous and a current day).
    // Also, ensure that the number of provided prices matches the declared total trading periods.
    if (totalTradingPeriods < 2 || dailyPricePoints.length < totalTradingPeriods) {
        console.warn(`Warning: Not enough trading periods or price data (${dailyPricePoints.length} prices for ${totalTradingPeriods} days). No trading will occur.`);
        console.log(currentCapitalBalance); // Output initial capital if no trading is possible.
        return;
    }

    // Commence the simulation loop, iterating through each trading period starting from the second day.
    // The loop variable 'dayIndex' represents the current day's index in the 'dailyPricePoints' array.
    for (let dayIndex = 1; dayIndex < totalTradingPeriods; dayIndex++) {
        // Retrieve the closing price from the previous trading day.
        const previousDayClosingPrice = dailyPricePoints[dayIndex - 1];
        // Retrieve the opening price for the current trading day.
        const currentDayOpeningPrice = dailyPricePoints[dayIndex];

        // Add a guard clause to handle invalid or non-positive price data.
        // Such data could lead to division by zero or nonsensical calculations.
        if (previousDayClosingPrice <= 0 || currentDayOpeningPrice <= 0) {
             console.warn(`Warning: Invalid price (<= 0) encountered on day ${dayIndex}. Skipping trading for this period.`);
             // Skip to the next iteration if prices are invalid.
             continue;
        }

        // Reset shares for the current day's calculation.
        allocatedSharesForTrade = 0;

        // Determine if a buying opportunity exists based on price increase.
        // The strategy is to buy only if the current day's price is higher than the previous day's.
        if (currentDayOpeningPrice > previousDayClosingPrice) {
            // Calculate the maximum whole number of shares that can be purchased with current capital.
            // Using Math.floor ensures we don't buy fractional shares or exceed our capital.
            allocatedSharesForTrade = Math.floor(currentCapitalBalance / previousDayClosingPrice);

            // An additional check: if no shares can be bought due to insufficient funds,
            // then 'allocatedSharesForTrade' remains 0, and no profit/loss will be calculated for this buy action.
            if (allocatedSharesForTrade === 0) {
                // Optional: console.log(`Insufficient funds to buy shares on day ${dayIndex}.`);
                // This branch effectively means no transaction impact for this day.
            }
        }
        // If 'currentDayOpeningPrice' is not greater than 'previousDayClosingPrice',
        // 'allocatedSharesForTrade' remains 0 (as reset above), meaning no shares are bought for profit.

        // Calculate the per-share price difference between the current and previous day.
        const dailyPriceDifference = currentDayOpeningPrice - previousDayClosingPrice;

        // Calculate the total profit or loss for the day.
        // This simulates selling all 'allocatedSharesForTrade' at the 'currentDayOpeningPrice'
        // after hypothetically buying them at 'previousDayClosingPrice'.
        const netDailyGainOrLoss = dailyPriceDifference * allocatedSharesForTrade;

        // Update the total portfolio value.
        currentCapitalBalance += netDailyGainOrLoss;
    }

    // Output the final calculated portfolio value.
    // Using Math.round to ensure the output is an integer, consistent with integer prices.
    console.log(Math.round(currentCapitalBalance));
}

// The entry point for the script when executed in a Node.js environment.
// It reads the entire content of standard input and passes it to the simulation function.
try {
    const fileInputContent = require("fs").readFileSync("/dev/stdin", "utf8");
    simulateMarketOperations(fileInputContent);
} catch (executionError) {
    // Catch and report any errors that occur during file reading or simulation execution.
    console.error("An error occurred during script execution:", executionError.message);
}