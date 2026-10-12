function ProcessPizzaOrder(orderDataString) {
    const parseNumericValue = (valStr) => Number.parseInt(valStr, 10);

    let inputParts = orderDataString.split(" ");

    let costA = parseNumericValue(inputParts[0]);
    let costB = parseNumericValue(inputParts[1]);
    let costAB = parseNumericValue(inputParts[2]);
    let numA = parseNumericValue(inputParts[3]);
    let numB = parseNumericValue(inputParts[4]);

    let minRequired = Math.min(numA, numB);
    let maxRequired = Math.max(numA, numB);

    const calculateDoublePizzaCost = (count, unitCostAB) => count * unitCostAB * 2;

    let candidateCosts = [];

    // First pricing strategy: Cost of 'minRequired' A and 'minRequired' B pizzas bought separately.
    // This directly reflects the original 'singlePrice' calculation.
    let firstStrategyCost = minRequired * costA + minRequired * costB;
    candidateCosts.push(firstStrategyCost);

    // Second pricing strategy: Buy 'minRequired' AB sets, then remaining A and B separately.
    let costFromSets = calculateDoublePizzaCost(minRequired, costAB);
    let remainingA = numA - minRequired;
    let remainingB = numB - minRequired;
    let costFromRemainingA = remainingA * costA;
    let costFromRemainingB = remainingB * costB;
    let secondStrategyCost = costFromSets + costFromRemainingA + costFromRemainingB;
    candidateCosts.push(secondStrategyCost);

    // Third pricing strategy: Buy enough AB sets to cover the maximum requirement.
    let thirdStrategyCost = calculateDoublePizzaCost(maxRequired, costAB);
    candidateCosts.push(thirdStrategyCost);

    let finalMinimumCost = Math.min(...candidateCosts);

    console.log(finalMinimumCost);
}
// Main(require("fs").readFileSync("/dev/stdin", "utf8"));
ProcessPizzaOrder("1500 2000 1600 3 2");
ProcessPizzaOrder("1500 2000 1900 3 2");
ProcessPizzaOrder("1500 2000 500 90000 100000");
