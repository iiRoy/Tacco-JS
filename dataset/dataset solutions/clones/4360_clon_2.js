function ProcessInput(rawData) {
    // Helper function for numerical sorting in ascending order.
    function numericSorter(valA, valB) {
        return valA - valB;
    }

    // Process the raw input string: trim, split by newlines, then split each line by spaces.
    let processedLines = rawData.trim().split("\n").map(function(lineSegment) {
        return lineSegment.split(" ");
    });

    // Parse the first line of input into integer parameters.
    const firstLineData = processedLines[0].map(element => parseInt(element, 10));

    // Assign problem parameters from the parsed input.
    const waterUnitA = firstLineData[0] * 100; // Water unit A in grams (multiplied by 100 for consistency)
    const waterUnitB = firstLineData[1] * 100; // Water unit B in grams
    const sugarUnitC = firstLineData[2];       // Sugar unit C in grams
    const sugarUnitD = firstLineData[3];       // Sugar unit D in grams
    const maxConcentrationRatio = firstLineData[4]; // Maximum sugar concentration ratio (E)
    const maxTotalWeight = firstLineData[5];   // Maximum total weight of solution (F)

    // Generate all possible total water amounts (A*i + B*j) within the total weight limit.
    let waterAmounts = [];
    let currentWaterSum;
    for (let idx1 = 0; idx1 < (maxTotalWeight / waterUnitA); idx1++) {
        currentWaterSum = waterUnitA * idx1;
        for (let idx2 = 0; idx2 < ((maxTotalWeight - currentWaterSum) / waterUnitB); idx2++) {
            waterAmounts.push(currentWaterSum + waterUnitB * idx2);
        }
    }

    // Sort the generated water amounts and remove duplicates.
    waterAmounts.sort(numericSorter);
    waterAmounts = waterAmounts.filter(function (value, index, self) {
        return self.indexOf(value) === index;
    });

    // Calculate the maximum possible sugar weight based on the concentration limit.
    // This is derived from S / (W + S) <= E / 100 => 100S <= E(W+S) => 100S <= EW + ES => S(100-E) <= EW
    // If E is max concentration, then S / (W+S) <= E/100.
    // Max sugar S for a given W is S = W * E / (100 - E).
    // Max total weight F = W + S.
    // F = W + W * E / (100 - E) = W * (1 + E / (100 - E)) = W * (100 - E + E) / (100 - E) = W * 100 / (100 - E)
    // So W = F * (100 - E) / 100.
    // S = F - W = F - F * (100 - E) / 100 = F * (100 - (100 - E)) / 100 = F * E / 100.
    // This `maxSugarWeight` is the maximum sugar that can be dissolved in *any* amount of water,
    // given the total solution weight constraint `F` and concentration `E`.
    // The original code uses `F * E / (100 + E)`. Let's re-evaluate.
    // If S / (W+S) <= E/100, and W+S <= F.
    // Then S <= (E/100) * (W+S).
    // If W+S = F, then S <= F * E / 100. This is the maximum sugar if the total weight is F.
    // However, the problem states S / W <= E / 100.
    // So S <= W * E / 100.
    // And W + S <= F.
    // W + W * E / 100 <= F => W * (1 + E/100) <= F => W * (100+E)/100 <= F => W <= F * 100 / (100+E).
    // S <= (F * 100 / (100+E)) * E / 100 = F * E / (100+E).
    // This `maxSugarWeight` is the maximum possible sugar amount that can be in the solution,
    // given the total weight constraint `F` and the concentration ratio `E`.
    const maxSugarWeight = Math.floor(maxTotalWeight * maxConcentrationRatio / (100 + maxConcentrationRatio));

    // Generate all possible total sugar amounts (C*i + D*j) up to `maxSugarWeight`.
    let sugarAmounts = [];
    let currentSugarSum;
    for (let kdx = 0; kdx < (maxSugarWeight / sugarUnitC); kdx++) {
        currentSugarSum = sugarUnitC * kdx;
        for (let ldx = 0; ldx < ((maxSugarWeight - currentSugarSum) / sugarUnitD); ldx++) {
            sugarAmounts.push(currentSugarSum + sugarUnitD * ldx);
        }
    }

    // Sort the generated sugar amounts and remove duplicates.
    sugarAmounts.sort(numericSorter);
    sugarAmounts = sugarAmounts.filter(function (value, index, self) {
        return self.indexOf(value) === index;
    });

    // Create a bitmap (boolean array) to quickly check for the existence of a sugar amount.
    let sugarPresenceMap = [];
    for (let mdx = 0; mdx <= maxSugarWeight; mdx++) {
        sugarPresenceMap.push(0); // Initialize with 0 (false)
    }
    for (let sugarVal of sugarAmounts) {
        sugarPresenceMap[sugarVal] = 1; // Mark as 1 (true) if this sugar amount is possible
    }

    // Initialize variables for tracking the best solution.
    let currentMaxDensity = 0; // Current maximum sugar density (sugar / water)
    let bestSolution = [0, 0]; // [total_weight, sugar_weight]

    // Iterate through all possible water amounts.
    for (let waterVal of waterAmounts) {
        // Calculate the lower and upper bounds for sugar amount for the current water amount.
        // lowerSugarBound: Minimum sugar needed to achieve currentMaxDensity (rounded up).
        // upperSugarBound: Maximum sugar allowed by concentration limit (waterVal * E / 100)
        //                  and also by total weight limit (maxTotalWeight - waterVal).
        let lowerSugarBound = Math.round(waterVal * currentMaxDensity);
        let upperSugarBound = Math.min(Math.floor(waterVal * maxConcentrationRatio / 100), maxTotalWeight - waterVal);

        // Iterate through possible sugar amounts within the calculated bounds.
        for (let sugarVal = lowerSugarBound; sugarVal <= upperSugarBound; sugarVal++) {
            // Check if this sugar amount is possible (from sugarPresenceMap)
            if (sugarPresenceMap[sugarVal] === 1) {
                // If the current sugar density is greater than or equal to the best found so far, update.
                if ((sugarVal / waterVal) >= currentMaxDensity) {
                    bestSolution[0] = waterVal + sugarVal; // Total weight
                    bestSolution[1] = sugarVal;             // Sugar weight
                    currentMaxDensity = sugarVal / waterVal; // Update max density
                }
                // Mark this sugar amount as "used" or "processed" to avoid redundant checks
                // if multiple water amounts could use the same sugar amount.
                // This is a critical optimization to prevent re-evaluating the same sugar amount
                // with different water amounts if a better density has already been found for it.
                sugarPresenceMap[sugarVal] = 0;
            }
        }
    }

    // Edge case: If no sugar was found (ans[1] is 0), the solution is just the smallest water amount (A).
    if (bestSolution[1] === 0) {
        bestSolution[0] = waterUnitA;
    }

    // Output the result formatted as two integers.
    console.log("%d %d", Math.round(bestSolution[0]), Math.round(bestSolution[1]));
}

// Read input from stdin and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
