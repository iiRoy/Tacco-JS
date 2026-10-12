// This function processes financial market data to simulate a simple trading strategy.
function ProcessFinancialData(rawData) {
    // Split the entire input string by newline characters to get individual lines.
    let processedLines = rawData.split("\n");

    // Parse the first line to determine the total number of days for which data is available.
    let totalDays = parseInt(processedLines[0], 10);

    // The second line contains space-separated daily stock prices. Split it into an array of strings.
    let dailyPricesStr = processedLines[1].split(" ");

    // Initialize variables for previous and current day's stock prices.
    let previousDayPrice = 0;
    let currentDayPrice = 0;

    // Initialize the number of shares currently held and the total capital.
    let sharesOwned = 0;
    let currentCapital = 1000; // Starting capital is 1000 units.

    // Iterate through the daily prices, starting from the second day (index 1) up to the last day.
    // The loop runs for totalDays - 1 iterations, comparing each day with the previous one.
    for (let dayIndex = 1; dayIndex < totalDays; dayIndex++) {
        // Convert the string prices to integers for calculation.
        previousDayPrice = parseInt(dailyPricesStr[dayIndex - 1], 10);
        currentDayPrice = parseInt(dailyPricesStr[dayIndex], 10);

        // If the previous day's price was lower than the current day's price,
        // it indicates a potential profit opportunity.
        if (previousDayPrice < currentDayPrice) {
            // Calculate how many shares can be bought with the current capital at the previous day's price.
            // Math.trunc ensures only whole shares are bought.
            sharesOwned = Math.trunc(currentCapital / previousDayPrice);
        }

        // Update the capital based on the price difference and the shares owned.
        // This simulates selling all shares if the price increased, or holding if it decreased.
        // The sharesOwned variable is reset to 0 implicitly for the next iteration's buying decision.
        currentCapital += (currentDayPrice - previousDayPrice) * sharesOwned;
        // Reset shares owned after the transaction for the next day's decision.
        sharesOwned = 0;
    }

    // Output the final calculated capital.
    console.log('%d', currentCapital);
}

// Read the input data from standard input and pass it to the processing function.
ProcessFinancialData(require("fs").readFileSync("/dev/stdin", "utf8"));
