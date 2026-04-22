// This module provides functionality to simulate a simplified stock trading strategy.
// It processes market data to determine the optimal buying and selling actions
// based on a greedy approach: buy if the next day's price is higher, sell otherwise.

/**
 * Simulates a stock trading strategy over a series of days.
 * The strategy involves buying shares when the next day's price is expected to be higher,
 * and selling all shares if the next day's price is expected to be lower or equal.
 *
 * @param {string} marketDataString - A multi-line string containing market information.
 *                                    The first line specifies the number of trading days.
 *                                    The second line contains space-separated daily share prices.
 * @returns {number} The final capital balance after all trading days.
 */
function simulateStockPortfolio(marketDataString) {
  // Input validation and initial parsing of the raw market data string.
  // Checks for null, undefined, non-string, or empty input.
  if (!marketDataString || typeof marketDataString !== 'string' || marketDataString.trim() === '') {
    console.error("Error: Market data input is invalid or empty. Cannot proceed with simulation.");
    return 0; // Return zero capital in case of critical input error.
  }

  // Split the input string into individual lines, filtering out any empty lines.
  const dataLines = marketDataString.split("\n").filter(line => line.trim() !== '');

  // Ensure there are at least two lines of data (one for day count, one for prices).
  if (dataLines.length < 2) {
    console.error("Error: Insufficient market data provided. Expected at least two lines: trading days count and daily prices.");
    return 0;
  }

  // Parse the number of trading days from the first line of input.
  const tradingDaysCount = Number(dataLines[0]);
  // Validate that the parsed number of days is a positive integer.
  if (!Number.isInteger(tradingDaysCount) || tradingDaysCount <= 0) {
    console.error(`Error: Invalid number of trading days specified: '${dataLines[0]}'. Must be a positive integer.`);
    return 0;
  }

  // Parse the raw price strings from the second line of input.
  const rawPriceStrings = dataLines[1].split(" ");
  // Validate that the number of provided prices matches the declared trading days count.
  if (rawPriceStrings.length !== tradingDaysCount) {
    console.error(`Error: Mismatch between declared trading days (${tradingDaysCount}) and the count of provided prices (${rawPriceStrings.length}).`);
    return 0;
  }

  // Convert string prices to numerical values and perform validation for each price.
  const dailySharePrices = rawPriceStrings.map((priceStr, index) => {
    const priceValue = Number(priceStr);
    // Warn if a price is not a valid number or is non-positive, treating it as zero for simulation robustness.
    if (isNaN(priceValue) || priceValue <= 0) {
      console.warn(`Warning: Invalid or non-positive price found for day ${index + 1}: '${priceStr}'. Treating as 0 for this day.`);
      return 0;
    }
    return priceValue;
  });

  // --- Portfolio Initialization ---
  // Define the starting capital for the trading simulation.
  const initialFunds = 1000;
  let currentPortfolioValue = initialFunds; // The current monetary balance.
  let sharesInPossession = 0; // The number of stock shares currently held.

  // --- Trading Simulation Loop ---
  // Iterate through each trading day to execute buying or selling decisions.
  for (let currentDayIdx = 0; currentDayIdx < tradingDaysCount; ++currentDayIdx) {
    const currentSharePrice = dailySharePrices[currentDayIdx];

    // Determine the prospective price for the next trading day.
    // If it's the last day of the simulation, set the next price to 0.
    // This effectively forces a sell-off of all remaining shares on the final day,
    // as any positive current price will be greater than 0.
    const prospectiveNextDayPrice = (currentDayIdx < tradingDaysCount - 1)
      ? dailySharePrices[currentDayIdx + 1]
      : 0;

    // Skip trading for the current day if its price is invalid (e.g., zero from previous validation).
    if (currentSharePrice <= 0) {
      console.warn(`Skipping trading for day ${currentDayIdx + 1} due to an invalid current share price of ${currentSharePrice}.`);
      continue;
    }

    // --- Trading Decision Logic ---
    // Strategy: Buy if the current price is strictly lower than the next day's price.
    if (currentSharePrice < prospectiveNextDayPrice) {
      // Calculate the maximum number of shares that can be purchased with available funds.
      const purchasableShares = Math.trunc(currentPortfolioValue / currentSharePrice);

      // Only execute a buy order if at least one share can be afforded.
      if (purchasableShares > 0) {
        sharesInPossession += purchasableShares;
        currentPortfolioValue -= purchasableShares * currentSharePrice; // Deduct cost from capital.
        // Optional: Log buy action for detailed simulation tracing.
        // console.log(`Day ${currentDayIdx + 1}: BOUGHT ${purchasableShares} shares at ${currentSharePrice.toFixed(2)}. Capital: ${currentPortfolioValue.toFixed(2)}.`);
      }
    }
    // Strategy: Sell all held shares if the current price is greater than or equal to the next day's price.
    // This also covers the last day scenario where prospectiveNextDayPrice is 0.
    else if (sharesInPossession > 0) {
      currentPortfolioValue += sharesInPossession * currentSharePrice; // Add proceeds to capital.
      sharesInPossession = 0; // All shares are sold, reset count.
      // Optional: Log sell action for detailed simulation tracing.
      // console.log(`Day ${currentDayIdx + 1}: SOLD ALL shares at ${currentSharePrice.toFixed(2)}. Capital: ${currentPortfolioValue.toFixed(2)}.`);
    }
    // If `currentSharePrice >= prospectiveNextDayPrice` and `sharesInPossession === 0`,
    // no action is taken for this day (implicitly handled by the `else if` condition).
  }

  // --- Finalization and Output ---
  // A final check to ensure any remaining shares are liquidated at the last day's price.
  // This scenario is mostly covered by the `prospectiveNextDayPrice = 0` logic on the last iteration,
  // but this explicit check adds an extra layer of robustness.
  if (sharesInPossession > 0 && tradingDaysCount > 0) {
      const lastDayPrice = dailySharePrices[tradingDaysCount - 1];
      if (lastDayPrice > 0) { // Only liquidate if the last day's price is valid
          currentPortfolioValue += sharesInPossession * lastDayPrice;
          sharesInPossession = 0;
          // console.log(`Post-simulation liquidation: Sold remaining shares at ${lastDayPrice.toFixed(2)}. Final capital: ${currentPortfolioValue.toFixed(2)}.`);
      } else {
          console.warn("Warning: Cannot liquidate remaining shares due to invalid (non-positive) price on the last day.");
      }
  }

  // Output the final capital balance, formatted to two decimal places for currency representation.
  console.log(`Simulation complete. Final portfolio balance: ${currentPortfolioValue.toFixed(2)} units.`);

  return currentPortfolioValue; // Return the final calculated portfolio value.
}

// --- Execution Context Handling ---
// This block determines how the script is executed, allowing for different input sources.
// It checks if the script is being run directly as the main module (e.g., via `node script.js`).
if (typeof require !== 'undefined' && require.main === module) {
  // In a production-like environment (e.g., competitive programming platform),
  // input is typically read from standard input (`/dev/stdin`).
  try {
    const fileSystem = require("fs");
    const inputData = fileSystem.readFileSync("/dev/stdin", "utf8");
    simulateStockPortfolio(inputData);
  } catch (error) {
    console.error("Failed to read input from /dev/stdin:", error.message);
    // Optionally exit process or return an error code here.
  }
} else {
  // In a development or testing environment, input might come from a local file
  // or a hardcoded string for convenience.
  try {
    const fileSystem = require("fs");
    // Attempt to read from a designated test data file.
    const testData = fileSystem.readFileSync("market_data_sample.txt", "utf8");
    simulateStockPortfolio(testData);
  } catch (error) {
    console.warn("Could not read from 'market_data_sample.txt'. Using a fallback hardcoded example for demonstration.");
    // Fallback to a hardcoded example if the test file is not found or unreadable.
    simulateStockPortfolio("5\n10 12 8 15 11\n");
  }
}