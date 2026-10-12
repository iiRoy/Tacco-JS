function calculateMaximumProfit(prices) {
    if (prices.length < 2) {
        return 0;
    }

    let maximumProfit = 0;

    for (
        let saleDay = 1;
        saleDay < prices.length;
        saleDay++
    ) {
        const salePrice = prices[saleDay];

        for (
            let purchaseDay = 0;
            purchaseDay < saleDay;
            purchaseDay++
        ) {
            const purchasePrice = prices[purchaseDay];

            const currentProfit =
                salePrice - purchasePrice;

            if (currentProfit <= maximumProfit) {
                continue;
            }

            maximumProfit = currentProfit;
        }
    }

    return maximumProfit;
}