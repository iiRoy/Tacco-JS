function processMarketData(rawData) {
    const parseNumericValue = (str) => parseInt(str, 10);

    const inputLines = rawData.split("\n");

    const totalDays = parseNumericValue(inputLines[0]);

    const dailyPriceStrings = inputLines[1].split(" ");
    const marketPrices = dailyPriceStrings.map(parseNumericValue);

    const INITIAL_CAPITAL = 1000;

    let currentFunds = INITIAL_CAPITAL;
    let sharesHeld = 0;

    for (let dayIterator = 1; dayIterator < totalDays; dayIterator++) {
        const priceYesterday = marketPrices[dayIterator - 1];
        const priceToday = marketPrices[dayIterator];

        if (priceYesterday < priceToday) {
            sharesHeld = Math.floor(currentFunds / priceYesterday);
        }

        const priceChange = priceToday - priceYesterday;
        const dailyProfitLoss = priceChange * sharesHeld;
        currentFunds += dailyProfitLoss;
    }

    console.log('%d', currentFunds);
}

processMarketData(require("fs").readFileSync("/dev/stdin", "utf8"));
