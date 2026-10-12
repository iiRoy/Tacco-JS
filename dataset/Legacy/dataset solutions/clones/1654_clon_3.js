function processStockData(rawData) {
    const lines = rawData.trim().split("\n");
    const priceSeries = lines[1].split(" ").map(Number);

    let currentIndex = 0;
    while (currentIndex < priceSeries.length - 1) {
        const currentPrice = priceSeries[currentIndex];
        const nextPrice = priceSeries[currentIndex + 1];

        if (currentPrice === nextPrice) {
            priceSeries.splice(currentIndex + 1, 1);
        } else {
            currentIndex++;
        }
    }

    const TREND_FLAT_OR_DOWN = 0;
    const TREND_UP_OR_HOLDING = 1;

    let marketTrend = TREND_FLAT_OR_DOWN;
    let sharesHeld = 0;
    let currentCapital = 1000;

    const seriesLength = priceSeries.length;
    for (let priceIndex = 0; priceIndex < seriesLength - 1; priceIndex++) {
        const currentDayPrice = priceSeries[priceIndex];
        const nextDayPrice = priceSeries[priceIndex + 1];

        if (currentDayPrice < nextDayPrice) {
            if (marketTrend === TREND_FLAT_OR_DOWN) {
                sharesHeld = Math.trunc(currentCapital / currentDayPrice);
                currentCapital %= currentDayPrice;
            }
            marketTrend = TREND_UP_OR_HOLDING;
        } else {
            if (marketTrend === TREND_UP_OR_HOLDING) {
                currentCapital += sharesHeld * currentDayPrice;
                sharesHeld = 0;
            }
            marketTrend = TREND_FLAT_OR_DOWN;
        }
    }

    if (marketTrend === TREND_UP_OR_HOLDING) {
        currentCapital += sharesHeld * priceSeries[seriesLength - 1];
    }

    console.log(currentCapital);
}

processStockData(require("fs").readFileSync("/dev/stdin", "utf8"));
