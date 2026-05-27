"use strict";

function parsePizzaOrderDetails(inputStringData) {
    const numericValues = inputStringData.trim().split(' ').map(Number);
    const [costPerA, costPerB, costPerAB, neededA, neededB] = numericValues;
    return {
        priceA: costPerA,
        priceB: costPerB,
        priceC: costPerAB,
        requiredA: neededA,
        requiredB: neededB
    };
}

function calculateCombinedPizzaCost(numHalfABPizzas, pA, pB, pC, rA, rB) {
    const numFullABPizzas = numHalfABPizzas / 2;
    const remainingAPizzas = Math.max(0, rA - numFullABPizzas);
    const remainingBPizzas = Math.max(0, rB - numFullABPizzas);
    return pC * numHalfABPizzas + remainingAPizzas * pA + remainingBPizzas * pB;
}

function calculateMinimumPizzaCost(rawInputString) {
    const { priceA, priceB, priceC, requiredA, requiredB } = parsePizzaOrderDetails(rawInputString);

    let currentMinCost = priceA * requiredA + priceB * requiredB;

    const costOfTwoABPizzas = 2 * priceC;

    if (priceA + priceB < costOfTwoABPizzas) {
        console.log(currentMinCost);
        return;
    }

    const maxHalfABToConsider = 2 * Math.max(requiredA, requiredB);

    for (let numHalfABPizzas = 2; numHalfABPizzas <= maxHalfABToConsider; numHalfABPizzas += 2) {
        const iterationCost = calculateCombinedPizzaCost(
            numHalfABPizzas,
            priceA,
            priceB,
            priceC,
            requiredA,
            requiredB
        );
        currentMinCost = Math.min(currentMinCost, iterationCost);
    }

    console.log(currentMinCost);
}

calculateMinimumPizzaCost(require("fs").readFileSync("/dev/stdin", "utf8"));
