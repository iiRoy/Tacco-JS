function ProcessInput(rawData) {
    const numericSorter = (valA, valB) => valA - valB;

    const parsedLines = rawData.trim().split("\n").map(lineStr => lineStr.split(" "));
    const firstLineParams = parsedLines[0].map(Number);

    const [
        waterUnitA_raw,
        waterUnitB_raw,
        sugarUnitC_raw,
        sugarUnitD_raw,
        maxSugarRatio_raw,
        maxTotalWeight_raw
    ] = firstLineParams;

    const waterUnitA = waterUnitA_raw * 100;
    const waterUnitB = waterUnitB_raw * 100;
    const sugarUnitC = sugarUnitC_raw;
    const sugarUnitD = sugarUnitD_raw;
    const maxSugarRatio = maxSugarRatio_raw;
    const maxTotalWeight = maxTotalWeight_raw;

    // Helper function to generate unique, sorted amounts based on two units and an exclusive upper limit
    const generateUniqueSortedAmounts = (unit1, unit2, limitExclusive) => {
        const amountsSet = new Set();
        for (let i = 0; ; i++) {
            const currentAmount1 = unit1 * i;
            if (currentAmount1 >= limitExclusive) { // Break if currentAmount1 reaches or exceeds the limit
                break;
            }

            for (let j = 0; ; j++) {
                const currentAmount2 = unit2 * j;
                const totalAmount = currentAmount1 + currentAmount2;
                if (totalAmount >= limitExclusive) { // Break if totalAmount reaches or exceeds the limit
                    break;
                }
                amountsSet.add(totalAmount);
            }
        }
        return Array.from(amountsSet).sort(numericSorter);
    };

    // Generate possible water amounts (ABList equivalent)
    const possibleWaterAmounts = generateUniqueSortedAmounts(waterUnitA, waterUnitB, maxTotalWeight);

    // Calculate maximum sugar weight (x equivalent)
    const maxSugarWeight = Math.floor(maxTotalWeight * maxSugarRatio / (100 + maxSugarRatio));

    // Generate possible sugar amounts (CDList equivalent)
    const possibleSugarAmounts = generateUniqueSortedAmounts(sugarUnitC, sugarUnitD, maxSugarWeight);

    // Create a bitmap for quick lookup of available sugar amounts (CDbitmap equivalent)
    const sugarAvailabilityMap = new Array(maxSugarWeight + 1).fill(0);
    for (const sugarVal of possibleSugarAmounts) {
        sugarAvailabilityMap[sugarVal] = 1;
    }

    let currentMaxDensity = 0;
    let bestSolution = [0, 0]; // [totalWeight, sugarWeight]

    // Iterate through possible water amounts to find the optimal solution
    for (const waterAmount of possibleWaterAmounts) {
        // Calculate the lower bound for sugar amount based on current max density
        const lowerSugarBound = Math.round(waterAmount * currentMaxDensity);

        // Calculate the upper bound for sugar amount, considering ratio and total weight limits
        const maxSugarAllowedByRatio = Math.floor(waterAmount * maxSugarRatio / 100);
        const maxSugarAllowedByTotalWeight = maxTotalWeight - waterAmount;
        const upperSugarBound = Math.min(maxSugarAllowedByRatio, maxSugarAllowedByTotalWeight);

        // Iterate through possible sugar amounts within the calculated bounds
        for (let sugarAmount = lowerSugarBound; sugarAmount <= upperSugarBound; sugarAmount++) {
            // Check if this sugar amount is valid and available in the map
            if (sugarAvailabilityMap[sugarAmount] === 1) {
                const currentDensity = sugarAmount / waterAmount;
                if (currentDensity >= currentMaxDensity) {
                    bestSolution[0] = waterAmount + sugarAmount;
                    bestSolution[1] = sugarAmount;
                    currentMaxDensity = currentDensity;
                }
                // Mark this sugar amount as used to prevent re-evaluation with lower densities
                sugarAvailabilityMap[sugarAmount] = 0;
            }
        }
    }

    // Output the final result, rounded as per original behavior
    console.log("%d %d", Math.round(bestSolution[0]), Math.round(bestSolution[1]));
}

// Read input from stdin and pass to the processing function
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
