/*
 * Evaluar todas las combinaciones
 * posibles de compra y venta.
 */
function calculateMaximumProfit
(
    prices
)
{
    let maximumProfit =
        0;

    // Seleccionar el día de compra.
    for
    (
        let purchaseDay = 0;
        purchaseDay < prices.length - 1;
        purchaseDay++
    )
    {
        // Seleccionar un día posterior de venta.
        for
        (
            let saleDay = purchaseDay + 1;
            saleDay < prices.length;
            saleDay++
        )
        {
            const currentProfit =
                prices[saleDay]
                -
                prices[purchaseDay];

            if
            (
                currentProfit
                >
                maximumProfit
            )
            {
                maximumProfit =
                    currentProfit;
            }
        }
    }

    return maximumProfit;
}