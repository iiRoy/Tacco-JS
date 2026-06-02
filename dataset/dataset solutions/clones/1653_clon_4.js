function ProcessFinancialData(rawData) {
    const dataLines = rawData.split('\n');
    const totalDayCount = parseInt(dataLines[0], 10);
    const dailyPriceStrings = dataLines[1].split(' ');

    const numericPrices = dailyPriceStrings.map(Number);

    const tradingScenarios = numericPrices.map((currentDayValue, index, priceSeries) => ({
        currentValue: currentDayValue,
        subsequentValue: (index === priceSeries.length - 1) ? 0 : priceSeries[index + 1]
    }));

    const initialFinancialState = {
        availableFunds: 1000,
        heldShares: 0
    };

    const finalFinancialState = tradingScenarios.reduce((portfolioState, marketOpportunity) => {
        const { availableFunds, heldShares } = portfolioState;
        const { currentValue, subsequentValue } = marketOpportunity;

        if (currentValue < subsequentValue) {
            // Price is expected to rise, acquire shares
            const sharesToPurchase = Math.floor(availableFunds / currentValue);
            const remainingCash = availableFunds % currentValue;
            return {
                availableFunds: remainingCash,
                heldShares: heldShares + sharesToPurchase
            };
        } else {
            // Price is expected to fall or stay same, liquidate shares
            const newCashTotal = availableFunds + heldShares * currentValue;
            return {
                availableFunds: newCashTotal,
                heldShares: 0
            };
        }
    }, initialFinancialState);

    console.log('%d', finalFinancialState.availableFunds);
}

if (__filename.match("Main.js$")) {
    ProcessFinancialData(require("fs").readFileSync("/dev/stdin", "utf8"));
} else {
    ProcessFinancialData(require("fs").readFileSync("q4.txt", "utf8"));
}
