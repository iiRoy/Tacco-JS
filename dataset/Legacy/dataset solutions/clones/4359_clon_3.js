const numericSortAsc = (a, b) => a - b;

function generateUnitCombinations(unitA, unitB, totalMaxWeight) {
    const combinations = new Set();
    for (let countA = 0; ; countA++) {
        const currentWeightA = unitA * countA;
        if (currentWeightA > totalMaxWeight) break;

        for (let countB = 0; ; countB++) {
            const currentWeightB = unitB * countB;
            const totalCurrentWeight = currentWeightA + currentWeightB;
            if (totalCurrentWeight > totalMaxWeight) break;

            combinations.add(totalCurrentWeight);

            if (unitB === 0 && countB === 0) break;
        }
        if (unitA === 0 && countA === 0) break;
    }
    return Array.from(combinations).sort(numericSortAsc);
}

function solveProblem(rawData) {
    const PERCENT_FACTOR = 100;

    const trimmedInput = rawData.trim();
    const inputLines = trimmedInput.split("\n");
    const parsedInputValues = inputLines.map(line => line.split(" "));
    const firstLineParams = parsedInputValues[0].map(e => parseInt(e, 10));

    const [rawA, rawB, sugarUnitC, sugarUnitD, maxSugarRatio, maxTotalWeight] = firstLineParams;
    const waterUnitA = rawA * PERCENT_FACTOR;
    const waterUnitB = rawB * PERCENT_FACTOR;

    const maxSugarWeight = Math.floor(maxTotalWeight * maxSugarRatio / (PERCENT_FACTOR + maxSugarRatio));

    const waterAmounts = generateUnitCombinations(waterUnitA, waterUnitB, maxTotalWeight);

    const sugarAmounts = generateUnitCombinations(sugarUnitC, sugarUnitD, maxSugarWeight);

    const availableSugarMap = new Uint8Array(maxSugarWeight + 1);
    for (const sugarVal of sugarAmounts) {
        if (sugarVal >= 0 && sugarVal <= maxSugarWeight) {
            availableSugarMap[sugarVal] = 1;
        }
    }

    let currentMaxDensity = 0;
    let bestSolution = [0, 0];

    for (const waterVal of waterAmounts) {
        if (waterVal === 0) continue;

        const minSugarToCheck = Math.round(waterVal * currentMaxDensity);
        const maxSugarToCheck = Math.min(
            Math.floor(waterVal * maxSugarRatio / PERCENT_FACTOR),
            maxTotalWeight - waterVal
        );

        for (let sugarVal = minSugarToCheck; sugarVal <= maxSugarToCheck; sugarVal++) {
            if (sugarVal >= 0 && sugarVal <= maxSugarWeight && availableSugarMap[sugarVal] === 1) {
                const potentialTotalWeight = waterVal + sugarVal;
                const calculatedDensity = sugarVal / waterVal;

                if (calculatedDensity > currentMaxDensity) {
                    bestSolution[0] = potentialTotalWeight;
                    bestSolution[1] = sugarVal;
                    currentMaxDensity = calculatedDensity;
                }
                availableSugarMap[sugarVal] = 0;
            }
        }
    }

    console.log("%d %d", Math.round(bestSolution[0]), Math.round(bestSolution[1]));
}

solveProblem(require("fs").readFileSync("/dev/stdin", "utf8"));
