function processFinancialData(rawData) {
    const parsedInputLines = rawData.split("\n");

    const parseRateValue = (rateString) => parseInt(rateString, 10);

    const numDays = parseRateValue(parsedInputLines[0]);
    const dailyRatesStr = parsedInputLines[1].split(" ");

    const allDailyRates = dailyRatesStr.map(parseRateValue);

    const INITIAL_FUNDS = 1000;
    let currentFunds = INITIAL_FUNDS;
    let sharesOwned = 0;

    for (let dayIndex = 0; dayIndex < numDays; dayIndex++) {
        const currentRate = allDailyRates[dayIndex];
        const nextDayRate = (dayIndex < numDays - 1) ? allDailyRates[dayIndex + 1] : 0;

        if (currentRate < nextDayRate) {
            const sharesToAcquire = Math.floor(currentFunds / currentRate);
            sharesOwned += sharesToAcquire;
            currentFunds %= currentRate;
        } else {
            currentFunds += sharesOwned * currentRate;
            sharesOwned = 0;
        }
    }

    console.log('%d', currentFunds);
}

if (__filename.match("Main.js$")) {
    processFinancialData(require("fs").readFileSync("/dev/stdin", "utf8"));
} else {
    processFinancialData(require("fs").readFileSync("q4.txt", "utf8"));
}
