(function() {
    "use strict";

    // Acquire the Node.js file system module for input operations.
    const fileSystemManager = require("fs");

    // This function serves as the primary entry point for the application,
    // mimicking the 'main' function in the original PureScript code.
    function launchCalculationProcess() {
        // Read the entire standard input as a UTF-8 string.
        // This replaces Node_FS_Sync.readTextFile(Node_Encoding.UTF8.value)("/dev/stdin")()
        const rawInputContent = fileSystemManager.readFileSync("/dev/stdin", "utf8");

        // Process the raw input to derive the final computed value.
        // This replaces the call to AtCoder_ABC121_C.solve(v)
        const finalComputedValue = calculateOptimalCost(rawInputContent);

        // Output the result to the console.
        // This replaces Effect_Console.log(v1)()
        console.log(finalComputedValue);
    }

    // This function encapsulates the core business logic,
    // analogous to AtCoder_ABC121_C.solve and its helper solve$prime$prime.
    function calculateOptimalCost(rawDataPayload) {
        // Remove any leading or trailing whitespace from the input.
        // This replaces Data_String_Common.trim(input)
        const trimmedData = rawDataPayload.trim();

        // Split the cleaned input into individual lines.
        // This replaces Data_String_Common.split("\n")(cleansedText)
        const dataLines = trimmedData.split("\n");

        // Parse the first line to get the total number of items needed.
        // This replaces Data_Array.head(lines) and subsequent Data_Int.fromString parsing.
        const headerInfo = dataLines[0].split(" ");
        // The first element (number of shops) is not directly used in the cost calculation.
        const totalItemsRequired = BigInt(headerInfo[1]); // Use BigInt for large numbers

        // Process the remaining lines, each representing a shop's offer.
        // This replaces Data_Array.drop(1)(lines) and Data_Array.mapMaybe.
        const shopOfferings = dataLines.slice(1).map(line => {
            const offerDetails = line.split(" ");
            const itemUnitValue = BigInt(offerDetails[0]); // Price per item, as BigInt
            const availableQuantity = BigInt(offerDetails[1]); // Stock count, as BigInt
            return { valuePerUnit: itemUnitValue, stockLevel: availableQuantity };
        });

        // Sort the shop offerings by their unit price in ascending order.
        // This replaces Data_Array.sortWith(Data_Ord.ordInt)(Data_Tuple.fst)(abs).
        shopOfferings.sort((offerX, offerY) => {
            if (offerX.valuePerUnit < offerY.valuePerUnit) return -1;
            if (offerX.valuePerUnit > offerY.valuePerUnit) return 1;
            return 0;
        });

        // Initialize variables for the greedy purchasing strategy.
        // These replace the state variables (n, m') in the tailRec loop.
        let cumulativePayment = 0n; // Total cost accumulated, BigInt
        let remainingDemand = totalItemsRequired; // Items still needed, BigInt

        // Iterate through the sorted shop offerings to fulfill the demand,
        // prioritizing cheaper options. This replaces the Control_Monad_Rec_Class.tailRec loop.
        for (const currentShopOffer of shopOfferings) {
            const currentPrice = currentShopOffer.valuePerUnit;
            const currentStock = currentShopOffer.stockLevel;

            // If all items have been acquired, terminate the process.
            if (remainingDemand <= 0n) {
                break;
            }

            // Determine the quantity to buy from the current shop:
            // either the remaining demand or the shop's available stock, whichever is smaller.
            const quantityToPurchase = (remainingDemand < currentStock) ? remainingDemand : currentStock;

            // Add the cost of this purchase to the cumulative payment.
            cumulativePayment += currentPrice * quantityToPurchase;

            // Decrease the outstanding demand by the quantity just purchased.
            remainingDemand -= quantityToPurchase;
        }

        // Convert the final cumulative payment (BigInt) to its string representation.
        // This replaces Data_Show.show and Data_String_CodeUnits.stripPrefix.
        return cumulativePayment.toString();
    }

    // Initiate the main application sequence.
    launchCalculationProcess();

})();