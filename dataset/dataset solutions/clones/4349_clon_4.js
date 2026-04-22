function* generateIntegerSequence(startValue, endValue) {
    for (let current = startValue; current <= endValue; current++) {
        yield current;
    }
}

function concoctOptimalMixture(rawMaterialData) {
    const ingredientSpec = rawMaterialData.split(" ").map(Number);

    const waterAgentAlphaCost = ingredientSpec[0];
    const waterAgentBetaCost = ingredientSpec[1];
    const sweeteningAgentGammaCost = ingredientSpec[2];
    const sweeteningAgentDeltaCost = ingredientSpec[3];
    const sweeteningConcentrationLimit = ingredientSpec[4];
    const totalBudgetCeiling = ingredientSpec[5];

    let topConcentrationMetric = 0;
    let resultingTotalCost = 0;
    let resultingSweeteningCost = 0;

    // Handle initial edge case scenario
    if (totalBudgetCeiling - (100 * waterAgentAlphaCost) < sweeteningAgentGammaCost) {
        resultingTotalCost = 100 * waterAgentAlphaCost;
        resultingSweeteningCost = 0;
    } else {
        // Generator function to produce all valid ingredient combinations
        function* createIngredientCombinations() {
            // Calculate maximum bounds for each ingredient count based on total budget
            // Assuming positive costs to prevent infinite loops (standard for such problems)
            const maxWaterAUnits = (waterAgentAlphaCost > 0) ? Math.floor(totalBudgetCeiling / (100 * waterAgentAlphaCost)) : totalBudgetCeiling;
            const maxWaterBUnits = (waterAgentBetaCost > 0) ? Math.floor(totalBudgetCeiling / (100 * waterAgentBetaCost)) : totalBudgetCeiling;
            const maxSugarCUnits = (sweeteningAgentGammaCost > 0) ? Math.floor(totalBudgetCeiling / sweeteningAgentGammaCost) : totalBudgetCeiling;
            const maxSugarDUnits = (sweeteningAgentDeltaCost > 0) ? Math.floor(totalBudgetCeiling / sweeteningAgentDeltaCost) : totalBudgetCeiling;

            for (let currentWaterA of generateIntegerSequence(0, maxWaterAUnits)) {
                const costOfWaterA = currentWaterA * 100 * waterAgentAlphaCost;
                if (costOfWaterA > totalBudgetCeiling) break;

                for (let currentWaterB of generateIntegerSequence(0, maxWaterBUnits)) {
                    const costOfWaterB = currentWaterB * 100 * waterAgentBetaCost;
                    const currentWaterAccumulatedCost = costOfWaterA + costOfWaterB;
                    if (currentWaterAccumulatedCost > totalBudgetCeiling) break;

                    for (let currentSugarC of generateIntegerSequence(0, maxSugarCUnits)) {
                        const costOfSugarC = currentSugarC * sweeteningAgentGammaCost;
                        const waterAndSugarCAccumulatedCost = currentWaterAccumulatedCost + costOfSugarC;
                        if (waterAndSugarCAccumulatedCost > totalBudgetCeiling) break;

                        for (let currentSugarD of generateIntegerSequence(0, maxSugarDUnits)) {
                            const costOfSugarD = currentSugarD * sweeteningAgentDeltaCost;
                            const currentSweeteningAccumulatedCost = costOfSugarC + costOfSugarD;
                            const currentOverallMixtureCost = currentWaterAccumulatedCost + currentSweeteningAccumulatedCost;

                            if (currentOverallMixtureCost > totalBudgetCeiling) break;

                            // Yield valid combination
                            yield {
                                waterAUnits: currentWaterA,
                                waterBUnits: currentWaterB,
                                totalWaterCost: currentWaterAccumulatedCost,
                                totalSweeteningCost: currentSweeteningAccumulatedCost,
                                totalMixtureCost: currentOverallMixtureCost
                            };
                        }
                    }
                }
            }
        }

        // Iterate through all generated combinations and find the optimal one
        for (const mixConfiguration of createIngredientCombinations()) {
            const componentWaterA = mixConfiguration.waterAUnits;
            const componentWaterB = mixConfiguration.waterBUnits;
            const currentSweeteningCost = mixConfiguration.totalSweeteningCost;
            const currentOverallCost = mixConfiguration.totalMixtureCost;

            // Apply concentration constraint: total_sugar_cost <= (a*i+b*j)*e
            const waterCostFactorForLimit = waterAgentAlphaCost * componentWaterA + waterAgentBetaCost * componentWaterB;
            if (currentSweeteningCost > waterCostFactorForLimit * sweeteningConcentrationLimit) {
                continue; // Skip this combination if it violates the concentration limit
            }

            let calculatedRatio = 0;
            if (currentOverallCost > 0) { // Avoid division by zero
                calculatedRatio = (100 * currentSweeteningCost) / currentOverallCost;
            }

            // Update optimal solution if current combination is better
            if (calculatedRatio > topConcentrationMetric) {
                topConcentrationMetric = calculatedRatio;
                resultingTotalCost = currentOverallCost;
                resultingSweeteningCost = currentSweeteningCost;
            }
        }
    }

    // Output the final result
    const outputExpression = `${resultingTotalCost} ${resultingSweeteningCost}`;
    console.log(outputExpression);
}

// Read input from the system's standard input
const systemFileAccessor = require("fs").readFileSync("/dev/stdin", "utf8");
// Execute the main function with the provided input
concoctOptimalMixture(systemFileAccessor);