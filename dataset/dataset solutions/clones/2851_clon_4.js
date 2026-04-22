function processTransactions(rawInput) {
    const lines = rawInput.split("\n");
    const initialValue = parseInt(lines[0]);

    const conversionAmounts = lines[1].split(" ").map(Number);
    const exchangeRatios = lines[2].split(" ").map(Number);

    const itemConfigurations = Array.from({ length: 3 }, (_, index) => {
        const primarySupply = conversionAmounts[index];
        const primaryDemand = exchangeRatios[index];
        
        let primaryRate;
        if (primaryDemand === 0) {
            // If demand is zero, rate is infinite for positive supply, NaN for zero supply
            primaryRate = (primarySupply > 0) ? Infinity : NaN;
        } else {
            primaryRate = primarySupply / primaryDemand;
        }

        let effectiveCost;
        let effectiveGain;

        // Determine effective cost and gain based on whether A/B rate is >= 1.0
        if (primaryRate >= 1.0) {
            effectiveCost = primaryDemand;
            effectiveGain = primarySupply;
        } else {
            effectiveCost = primarySupply;
            effectiveGain = primaryDemand;
        }

        return {
            sourceIdentifier: index,
            baseRate: primaryRate,
            effCost: effectiveCost,
            effGain: effectiveGain,
            isForwardConversion: primaryRate >= 1.0
        };
    });

    // Filter and sort items for forward conversions (A/B >= 1.0), by A/B rate descending
    const forwardConversions = itemConfigurations
        .filter(item => item.isForwardConversion)
        .sort((item1, item2) => item2.baseRate - item1.baseRate);

    // Filter and sort items for backward conversions (A/B < 1.0), by A/B rate ascending (equivalent to B/A rate descending)
    const backwardConversions = itemConfigurations
        .filter(item => !item.isForwardConversion)
        .sort((item1, item2) => item1.baseRate - item2.baseRate);

    // Helper function to perform a single exchange transaction
    const performSwap = (currentQuantity, transaction) => {
        if (transaction.effCost === 0) {
            // If cost is zero, and gain is positive, it implies infinite profit
            return transaction.effGain > 0 ? Infinity : currentQuantity;
        }
        const numberOfExchanges = Math.floor(currentQuantity / transaction.effCost);
        const remainingQuantity = currentQuantity % transaction.effCost;
        return (numberOfExchanges * transaction.effGain) + remainingQuantity;
    };

    // First, apply backward conversions (items where A/B < 1.0, using A as cost, B as gain)
    // These are applied from lowest A/B rate (highest B/A rate) to highest A/B rate.
    let currentTotal = backwardConversions.reduce(performSwap, initialValue);

    // Then, apply forward conversions (items where A/B >= 1.0, using B as cost, A as gain)
    // These are applied from highest A/B rate to lowest A/B rate.
    currentTotal = forwardConversions.reduce(performSwap, currentTotal);

    console.log(currentTotal);
}

processTransactions(require("fs").readFileSync("/dev/stdin", "utf8"));