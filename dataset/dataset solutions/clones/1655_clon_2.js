// This module handles the processing of market trend data.
function ProcessFinancialData(rawData) {

  // Split the raw input string into individual data lines.
  let dataLines = rawData.split("\n");

  // Parse the total number of periods from the first line.
  let numPeriods = parseInt(dataLines[0], 10);

  // Extract the series of daily prices from the second line.
  let priceSeries = dataLines[1].split(" ");

  let priorValue = 0;   // Stores the price from the previous period.
  let currentValue = 0; // Stores the price for the current period.

  let equityAmount = 0;     // Tracks the number of shares currently held.
  let currentCapital = 1000; // Represents the total available capital, starting at 1000 units.

  /*
   * Iterate through the market data, starting from the second period,
   * to simulate buying and selling based on price fluctuations.
   */
  for (let periodIdx = 1; periodIdx < numPeriods; periodIdx++) {
    // Convert previous and current period prices to integers.
    priorValue = parseInt(priceSeries[periodIdx - 1], 10);
    currentValue = parseInt(priceSeries[periodIdx], 10);

    // If the price has increased, attempt to buy shares.
    if (priorValue < currentValue) {
      // Calculate how many shares can be bought with the current capital.
      equityAmount = Math.trunc(currentCapital / priorValue);
    }

    // Update the capital by simulating selling shares at the current price.
    // This effectively calculates the profit/loss from holding shares.
    currentCapital += (currentValue - priorValue) * equityAmount;
  }

  // Display the final calculated capital.
  console.log('%d', currentCapital);
}


// Invoke the main processing function with data read from standard input.
ProcessFinancialData(require("fs").readFileSync("/dev/stdin", "utf8"));