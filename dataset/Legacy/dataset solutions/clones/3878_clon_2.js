function CalculateCost(rawInputString) {
    // Split the incoming string into an array of string values
    let parsedValues = rawInputString.split(" ");

    // Parse the string values into integer quantities and costs
    let costA = Number.parseInt(parsedValues[0], 10);
    let costB = Number.parseInt(parsedValues[1], 10);
    let costC = Number.parseInt(parsedValues[2], 10);
    let qtyX = Number.parseInt(parsedValues[3], 10);
    let qtyY = Number.parseInt(parsedValues[4], 10);

    // Determine the minimum and maximum quantities of items X and Y
    let minQty = Math.min(qtyX, qtyY);
    let maxQty = Math.max(qtyX, qtyY);

    // Initialize an array to store various pricing scenarios
    let potentialCosts = [];

    // Scenario 1: Buy all items individually
    let combinedIndividualCost = minQty * costA + minQty * costB;
    potentialCosts.push(combinedIndividualCost);

    // Scenario 2: Buy 'minQty' as combo sets, and the remaining individually
    let mixedComboCost = minQty * costC * 2 + (qtyX - minQty) * costA + (qtyY - minQty) * costB;
    potentialCosts.push(mixedComboCost);

    // Scenario 3: Buy all items as combo sets (even if it means buying more than needed for one type)
    let fullComboCost = maxQty * costC * 2;
    potentialCosts.push(fullComboCost);

    // Find the lowest cost among all calculated scenarios
    let finalMinimumCost = Math.min.apply(null, potentialCosts);

    // Output the optimal price to the console
    console.log(finalMinimumCost);
}

// Example invocations with different input data
// CalculateCost(require("fs").readFileSync("/dev/stdin", "utf8")); // Original commented line
CalculateCost("1500 2000 1600 3 2");
CalculateCost("1500 2000 1900 3 2");
CalculateCost("1500 2000 500 90000 100000");
