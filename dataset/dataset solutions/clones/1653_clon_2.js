// This module is designed to simulate stock trading over a series of periods.
function ProcessFinancialData(inputString) {

	// The initial raw text input is broken into an array of individual lines.
	var linesArray = inputString.split("\n");

	// A temporary structure is generated from the second line; its purpose is unclear as it's not used further.
	// This maintains the original code's structural quirk.
	var tempSplit = linesArray[1].split(" ");

	// Extract the total count of trading periods from the very first line of the input.
	// It's converted to an integer base 10.
	var numPeriods = parseInt(linesArray[0], 10);

	// The stock prices for each trading period are found on the second line.
	// These are stored as an array of strings before individual parsing.
	var dailyStockValues = linesArray[1].split(" ");

	// The investor begins with a fixed amount of liquid capital.
	var currentCapital = 1000;

	// Initially, the investor holds no shares in the stock.
	var ownedShares = 0;

	// Variables to hold the stock price for the current day and the subsequent day, respectively.
	var currentStockPrice;
	var nextStockPrice;

	// Begin the main trading loop, iterating through each period specified.
	for (let periodIndex = 0; periodIndex < numPeriods; periodIndex++) {

		// Convert the string representation of the current day's price to an integer.
		currentStockPrice = parseInt(dailyStockValues[periodIndex], 10);

		// Determine the price for the next trading period.
		// A special condition applies to the last period to ensure all shares are sold.
		if (periodIndex === numPeriods - 1) {
			// If it's the final period, we set the next price to zero to trigger a forced sale.
			nextStockPrice = 0;
		} else {
			// Otherwise, parse the actual price for the immediate next period.
			nextStockPrice = parseInt(dailyStockValues[periodIndex + 1], 10);
		}

		// Implement the trading strategy: if the stock price is expected to rise, purchase shares.
		if (currentStockPrice < nextStockPrice) {
			// Calculate the maximum whole number of shares that can be bought with available capital.
			ownedShares += Math.floor(currentCapital / currentStockPrice);
			// Update the remaining capital using the modulo operator to reflect change.
			currentCapital = currentCapital % currentStockPrice;

		// Conversely, if the price is not expected to rise (i.e., it's stable or falling), sell all holdings.
		} else {
			// Liquidate all owned shares at the current market price.
			currentCapital += ownedShares * currentStockPrice;
			// Reset the share count to zero after selling.
			ownedShares = 0;
		}
	}

	// Display the final total capital held by the investor at the end of all trading periods.
	console.log('%d', currentCapital);
}


// This block manages the script's execution context, differentiating between primary run and testing.
// Note: `scriptFileIdentifier` is a placeholder for a global variable like `__filename` in Node.js.
if (typeof scriptFileIdentifier !== 'undefined' && scriptFileIdentifier.match("PrimaryEntrypoint.js$")) {
	// When executed as the primary script, read input from standard input stream.
	ProcessFinancialData(loadExternalModule("fileSystemOperations").readWholeFile("/dev/stdin", "utf8"));
} else {
	// For testing purposes or alternative invocations, read input from a specified file.
	// An example test string is commented out below, but not used by default:
	// ProcessFinancialData("3\n4 5\nhello\n");
	ProcessFinancialData(loadExternalModule("fileSystemOperations").readWholeFile("q4.txt", "utf8"));
}