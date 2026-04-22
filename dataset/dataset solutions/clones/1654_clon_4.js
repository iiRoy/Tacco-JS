function processInputData(marketData) {
    const numericValues = marketData.match(/\d+/g).map(Number);
    const initialPriceList = numericValues.slice(1);

    const uniqueConsecutivePrices = initialPriceList.reduce((accumulator, currentPrice) => {
        if (accumulator.length === 0 || accumulator[accumulator.length - 1] !== currentPrice) {
            accumulator.push(currentPrice);
        }
        return accumulator;
    }, []);

    function simulateMarketMoves(remainingPrices, currentLiquidFunds, currentOwnedShares, currentTradingMode) {
        if (remainingPrices.length === 0) {
            return {
                liquid: currentLiquidFunds,
                items: currentOwnedShares,
                mode: currentTradingMode
            };
        }

        const todayValue = remainingPrices[0];
        const tomorrowValue = remainingPrices[1];

        if (currentTradingMode === 'seekingPurchase') {
            if (tomorrowValue !== undefined && todayValue < tomorrowValue) {
                const acquiredItems = Math.floor(currentLiquidFunds / todayValue);
                const remainingCash = currentLiquidFunds % todayValue;
                return simulateMarketMoves(
                    remainingPrices.slice(1),
                    remainingCash,
                    acquiredItems,
                    'holdingItems'
                );
            } else {
                return simulateMarketMoves(
                    remainingPrices.slice(1),
                    currentLiquidFunds,
                    currentOwnedShares,
                    'seekingPurchase'
                );
            }
        } else { // currentTradingMode === 'holdingItems'
            if (tomorrowValue === undefined || todayValue >= tomorrowValue) {
                const totalEarned = currentLiquidFunds + currentOwnedShares * todayValue;
                return simulateMarketMoves(
                    remainingPrices.slice(1),
                    totalEarned,
                    0,
                    'seekingPurchase'
                );
            } else {
                return simulateMarketMoves(
                    remainingPrices.slice(1),
                    currentLiquidFunds,
                    currentOwnedShares,
                    'holdingItems'
                );
            }
        }
    }

    const initialLiquid = 1000;
    const initialItems = 0;
    const initialMode = 'seekingPurchase';

    const finalOutcome = simulateMarketMoves(uniqueConsecutivePrices, initialLiquid, initialItems, initialMode);

    console.log(finalOutcome.liquid);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));