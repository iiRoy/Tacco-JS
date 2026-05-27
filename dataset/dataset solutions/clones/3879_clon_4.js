function calculateFinalCost(inputDataString) {
    const numericalParameters = inputDataString.split(" ").map(Number);

    const qOne = numericalParameters[0];
    const qTwo = numericalParameters[1];
    const factorLimit = numericalParameters[2];
    const costOne = numericalParameters[3];
    const costTwo = numericalParameters[4];

    const doubleFactorLimit = factorLimit * 2;

    let currentAggregateValue = qOne * costOne + qTwo * costTwo;

    const commonDiscountRate = Math.min(costOne, costTwo);

    const combinedExcessForCommonDiscount = Math.max(0, qOne + qTwo - doubleFactorLimit);

    currentAggregateValue -= combinedExcessForCommonDiscount * commonDiscountRate;

    const remainingCostOne = costOne - commonDiscountRate;
    const remainingCostTwo = costTwo - commonDiscountRate;

    const excessQOneForIndividualDiscount = Math.max(0, qOne - doubleFactorLimit);
    currentAggregateValue -= excessQOneForIndividualDiscount * Math.max(0, remainingCostOne);

    const excessQTwoForIndividualDiscount = Math.max(0, qTwo - doubleFactorLimit);
    currentAggregateValue -= excessQTwoForIndividualDiscount * Math.max(0, remainingCostTwo);

    return currentAggregateValue;
}

const fileContents = require("fs").readFileSync("/dev/stdin", "utf8");
console.log(calculateFinalCost(fileContents));
