function Main(input) {
    input = input.split("\n");
    const initialResourceAmount = parseInt(input[0]);
    const itemQuantities = input[1].split(" ").map(Number);
    const itemCosts = input[2].split(" ").map(Number);

    const exchangeConfigurations = itemQuantities.map((quantityValue, index) => ({
        originalIndex: index,
        quantityObtained: quantityValue,
        resourceCost: itemCosts[index],
        forwardExchangeRate: quantityValue / itemCosts[index]
    }));

    exchangeConfigurations.sort((configA, configB) => configB.forwardExchangeRate - configA.forwardExchangeRate);

    const [topConfig, middleConfig, bottomConfig] = exchangeConfigurations;

    const applyConversion = (currentTotal, config, useDirectExchange) => {
        const costUnit = useDirectExchange ? config.resourceCost : config.quantityObtained;
        const gainUnit = useDirectExchange ? config.quantityObtained : config.resourceCost;

        if (costUnit === 0) {
            return currentTotal;
        }

        const transactionCount = Math.floor(currentTotal / costUnit);
        const totalGainedFromTransactions = transactionCount * gainUnit;
        const remainingResource = currentTotal % costUnit;
        return totalGainedFromTransactions + remainingResource;
    };

    let finalResourceTotal = initialResourceAmount;

    const isTopRateFavorable = topConfig.forwardExchangeRate >= 1.0;
    const isMiddleRateFavorable = middleConfig.forwardExchangeRate >= 1.0;
    const isBottomRateFavorable = bottomConfig.forwardExchangeRate >= 1.0;

    if (isTopRateFavorable && isMiddleRateFavorable && isBottomRateFavorable) {
        finalResourceTotal = applyConversion(finalResourceTotal, topConfig, true);
        finalResourceTotal = applyConversion(finalResourceTotal, middleConfig, true);
        finalResourceTotal = applyConversion(finalResourceTotal, bottomConfig, true);
    } else if (isTopRateFavorable && isMiddleRateFavorable && !isBottomRateFavorable) {
        finalResourceTotal = applyConversion(finalResourceTotal, bottomConfig, false);
        finalResourceTotal = applyConversion(finalResourceTotal, topConfig, true);
        finalResourceTotal = applyConversion(finalResourceTotal, middleConfig, true);
    } else if (isTopRateFavorable && !isMiddleRateFavorable) {
        finalResourceTotal = applyConversion(finalResourceTotal, bottomConfig, false);
        finalResourceTotal = applyConversion(finalResourceTotal, middleConfig, false);
        finalResourceTotal = applyConversion(finalResourceTotal, topConfig, true);
    } else {
        finalResourceTotal = applyConversion(finalResourceTotal, bottomConfig, false);
        finalResourceTotal = applyConversion(finalResourceTotal, middleConfig, false);
        finalResourceTotal = applyConversion(finalResourceTotal, topConfig, false);
    }

    console.log(finalResourceTotal);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
