function processInputData(rawData) {
    const numericAscendingSort = (valA, valB) => valA - valB;

    const inputLines = rawData.trim().split("\n");
    const initialParametersString = inputLines[0].split(" ");
    const initialParameters = initialParametersString.map(Number);

    const waterUnitA = initialParameters[0] * 100;
    const waterUnitB = initialParameters[1] * 100;
    const sugarUnitC = initialParameters[2];
    const sugarUnitD = initialParameters[3];
    const maxSugarRatioPercent = initialParameters[4];
    const maxTotalWeight = initialParameters[5];

    const generateUniqueSortedAmounts = (unitOne, unitTwo, totalLimit) => {
        const amountsSet = new Set();
        for (let factorOne = 0; ; factorOne++) {
            const currentAmountOne = unitOne * factorOne;
            if (currentAmountOne >= totalLimit) {
                break;
            }
            for (let factorTwo = 0; ; factorTwo++) {
                const totalCurrentAmount = currentAmountOne + unitTwo * factorTwo;
                if (totalCurrentAmount >= totalLimit) {
                    break;
                }
                amountsSet.add(totalCurrentAmount);
                if (unitTwo === 0) break;
            }
            if (unitOne === 0) break;
        }
        return Array.from(amountsSet).sort(numericAscendingSort);
    };

    const possibleWaterAmounts = generateUniqueSortedAmounts(waterUnitA, waterUnitB, maxTotalWeight);

    const SUGAR_RATIO_DENOMINATOR = 100 + maxSugarRatioPercent;
    const maxPossibleSugarWeight = Math.floor(maxTotalWeight * maxSugarRatioPercent / SUGAR_RATIO_DENOMINATOR);

    const possibleSugarAmounts = generateUniqueSortedAmounts(sugarUnitC, sugarUnitD, maxPossibleSugarWeight);

    const sugarAvailabilityMap = Array.from({ length: maxPossibleSugarWeight + 1 }, () => 0);
    for (const sugarValue of possibleSugarAmounts) {
        sugarAvailabilityMap[sugarValue] = 1;
    }

    let currentMaxDensity = 0;
    let bestSolution = [0, 0];

    for (const currentWaterAmount of possibleWaterAmounts) {
        if (currentWaterAmount === 0) {
            continue;
        }

        const sugarLowerBound = Math.floor(currentWaterAmount * currentMaxDensity);
        
        const maxSugarBySolubility = Math.floor(currentWaterAmount * maxSugarRatioPercent / 100);
        const maxSugarByTotalWeight = maxTotalWeight - currentWaterAmount;
        const sugarUpperBound = Math.min(maxSugarBySolubility, maxSugarByTotalWeight);

        for (let currentSugarAmount = sugarLowerBound; currentSugarAmount <= sugarUpperBound; currentSugarAmount++) {
            if (currentSugarAmount >= 0 && currentSugarAmount <= maxPossibleSugarWeight && sugarAvailabilityMap[currentSugarAmount] === 1) {
                const currentDensity = currentSugarAmount / currentWaterAmount;
                if (currentDensity > currentMaxDensity) {
                    bestSolution[0] = currentWaterAmount + currentSugarAmount;
                    bestSolution[1] = currentSugarAmount;
                    currentMaxDensity = currentDensity;
                }
                sugarAvailabilityMap[currentSugarAmount] = 0;
            }
        }
    }

    console.log("%d %d", bestSolution[0], bestSolution[1]);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
