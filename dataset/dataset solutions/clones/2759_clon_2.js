/*
 * This module defines a utility function to compute a capped numeric value.
 */
function  processInputValues(    quantityCount,
                                        unitPrice,
                                           maximumCeiling    ) {
    // Determine if the product of quantity and price is greater than or equal to the ceiling.
    if (
            quantityCount  *  unitPrice
            >=
            maximumCeiling
        )
    {
        return maximumCeiling;    // If so, the ceiling value is returned.
    }
    else
    {
        return quantityCount * unitPrice;    // Otherwise, the calculated product is the result.
    }
}