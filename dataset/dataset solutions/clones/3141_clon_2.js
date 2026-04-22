'use strict'; // Enforce strict parsing rules for better code quality

function ProcessInputData(rawTextContent) {
    // First, clean up the input string and divide it into an array of individual lines.
    let lineSegments = rawTextContent.trim().split("\n");

    // Extract the problem's primary dimensions from the first line.
    // This typically includes the number of available items and the total quantity required.
    let dimensionValues = lineSegments[0].split(" ").map((valueStr) => (Number.parseInt(valueStr, 10)));

    // Initialize an array structure to store details of each item, such as its price and available stock.
    let itemPriceQuantities = Array(dimensionValues[0]);

    // Populate the item details array by parsing subsequent lines of the input.
    // Each line (after the first) represents an item with its specific attributes.
    for (let idx = 0; idx < dimensionValues[0]; idx++) {
        itemPriceQuantities[idx] = lineSegments[idx + 1].split(" ").map((numVal) => (Number.parseInt(numVal, 10)));
    }

    // Sort the items based on their unit price in ascending order to prioritize cheaper options.
    itemPriceQuantities.sort((offerA, offerB) => (offerA[0] < offerB[0] ? -1 : 1));

    // Declare variables to track the quantity of goods still needed and the total cost incurred.
    let remainingPurchaseQuantity = dimensionValues[1];
    let cumulativeExpenditure = 0;

    // Iterate through the sorted item offers to fulfill the total required quantity.
    for (let offerIndex = 0; offerIndex < dimensionValues[0]; offerIndex++) {
        // If the current item's available stock is less than the remaining quantity to buy,
        // purchase all of its available units.
        if (itemPriceQuantities[offerIndex][1] < remainingPurchaseQuantity) {
            // Add the cost of all units from this item to the total expenditure.
            cumulativeExpenditure += itemPriceQuantities[offerIndex][0] * itemPriceQuantities[offerIndex][1];
            // Decrease the remaining quantity by the amount just purchased.
            remainingPurchaseQuantity -= itemPriceQuantities[offerIndex][1];
        } else {
            // Otherwise, if the current item has enough or more stock,
            // purchase only the exact remaining quantity needed.
            cumulativeExpenditure += itemPriceQuantities[offerIndex][0] * remainingPurchaseQuantity;
            // Since the total required quantity is now met, terminate the loop.
            break;
        }
    }

    // Display the final calculated total cost to the console.
    console.log(cumulativeExpenditure);
}

// Execute the primary data processing function, feeding it content read from standard input.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));