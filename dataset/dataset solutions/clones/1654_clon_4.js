const marketSimulator = (rawData) => {
    const marketLines = rawData.trim().split('\n');
    const initialAssetCount = parseInt(marketLines[0].split(' ')[0], 10); // This value is parsed but not utilized, mirroring original behavior.
    const priceSequence = marketLines[1].split(' ').map(Number);

    const filteredPricePoints = priceSequence.reduce((accumulator, currentPrice) => {
        if (accumulator.length === 0 || accumulator[accumulator.length - 1] !== currentPrice) {
            accumulator.push(currentPrice);
        }
        return accumulator;
    }, []);

    const initialInvestmentState = {
        cashHoldings: 1000,
        shareCount: 0,
        isMarketRising: false
    };

    if (filteredPricePoints.length < 2) {
        console.log(initialInvestmentState.cashHoldings);
        return;
    }

    const finalInvestmentState = filteredPricePoints.slice(0, -1).reduce((currentStatus, currentPrice, index) => {
        const subsequentPrice = filteredPricePoints[index + 1];

        if (currentPrice < subsequentPrice) {
            // Market price is increasing
            if (!currentStatus.isMarketRising) {
                // Not currently in an upward trend, so initiate a purchase
                const purchasableUnits = Math.floor(currentStatus.cashHoldings / currentPrice);
                currentStatus.shareCount += purchasableUnits;
                currentStatus.cashHoldings -= purchasableUnits * currentPrice;
            }
            currentStatus.isMarketRising = true; // Mark as being in an upward trend
        } else {
            // Market price is flat or decreasing
            if (currentStatus.isMarketRising) {
                // Was in an upward trend, so liquidate holdings
                currentStatus.cashHoldings += currentStatus.shareCount * currentPrice;
                currentStatus.shareCount = 0;
            }
            currentStatus.isMarketRising = false; // Mark as not being in an upward trend
        }
        return currentStatus;
    }, initialInvestmentState);

    // Perform final liquidation if still holding shares at the end of an upward trend
    if (finalInvestmentState.isMarketRising) {
        finalInvestmentState.cashHoldings += finalInvestmentState.shareCount * filteredPricePoints[filteredPricePoints.length - 1];
    }

    console.log(finalInvestmentState.cashHoldings);
};

marketSimulator(require("fs").readFileSync("/dev/stdin", "utf8"));
