function simulatedTradingJourney(dataSource) {
    const contentLines = dataSource.split('\n');
    const totalPeriods = Number(contentLines[0]);
    const periodPrices = contentLines[1].split(' ').map(Number);

    const resultingPortfolio = periodPrices.reduce((currentStatus, currentPeriodPrice, periodIndex, allPrices) => {
        let { cashBalance, assetHoldings } = currentStatus;

        const nextPeriodPriceForDecision = (periodIndex === allPrices.length - 1)
            ? 0
            : allPrices[periodIndex + 1];

        if (currentPeriodPrice < nextPeriodPriceForDecision) {
            const unitsToAcquire = Math.trunc(cashBalance / currentPeriodPrice);
            assetHoldings += unitsToAcquire;
            cashBalance %= currentPeriodPrice;
        } else {
            cashBalance += assetHoldings * currentPeriodPrice;
            assetHoldings = 0;
        }

        return { cashBalance, assetHoldings };
    }, { cashBalance: 1000, assetHoldings: 0 });

    console.log('%d', resultingPortfolio.cashBalance);
}

const fileOperations = require("fs");
const currentModulePath = __filename;
const productionInputSource = "/dev/stdin";
const developmentInputSource = "development_sample.txt";

if (currentModulePath.endsWith("Main.js")) {
    simulatedTradingJourney(fileOperations.readFileSync(productionInputSource, "utf8"));
} else {
    simulatedTradingJourney(fileOperations.readFileSync(developmentInputSource, "utf8"));
}