function calculateMaximumProfit(prices) {
    let maximumProfit = 0;

    for (
        let purchaseDay = 0;
        purchaseDay < prices.length - 1;
        purchaseDay++
    ) {
        for (
            let saleDay = purchaseDay + 1;
            saleDay < prices.length;
            saleDay++
        ) {
            const currentProfit =
                prices[saleDay] - prices[purchaseDay];

            if (currentProfit > maximumProfit) {
                maximumProfit = currentProfit;
            }
        }
    }

    return maximumProfit;
}