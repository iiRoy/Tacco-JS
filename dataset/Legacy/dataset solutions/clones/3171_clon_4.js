"use strict";
function processFinancialData(rawData) {
    const inputSegments = rawData.split("\n");
    const itemCount = Number(inputSegments[0]);

    const currencyConversionRates = new Map([
        ['BTC', 380000.0],
        ['JPY', 1.0]
    ]);

    const transactionEntries = inputSegments.slice(1, itemCount + 1);

    const totalValue = transactionEntries.reduce((currentTotal, currentEntryLine) => {
        const [amountString, currencyIdentifier] = currentEntryLine.split(/\s/);
        const numericalAmount = Number(amountString);
        const conversionFactor = currencyConversionRates.get(currencyIdentifier) || 1.0;

        return currentTotal + (numericalAmount * conversionFactor);
    }, 0);

    console.log(totalValue);
}

processFinancialData(require("fs").readFileSync("/dev/stdin", "utf8"));
