function processInputData(rawInputString) {
    const [valA, valB, valC, valD, valE, valF] = rawInputString.trim().split(" ").map(Number);
    return {
        waterUnitA: valA * 100,
        waterUnitB: valB * 100,
        sugarUnitC: valC,
        sugarUnitD: valD,
        maxConcentrationRatio: valE,
        maxOverallWeight: valF
    };
}

function determineOptimalMixture(config) {
    const { waterUnitA, waterUnitB, sugarUnitC, sugarUnitD, maxConcentrationRatio, maxOverallWeight } = config;

    const waterAmountSet = new Set();
    for (let i = 0; waterUnitA * i < maxOverallWeight; ++i) {
        const currentWaterBase = waterUnitA * i;
        for (let j = 0; currentWaterBase + waterUnitB * j < maxOverallWeight; ++j) {
            waterAmountSet.add(currentWaterBase + waterUnitB * j);
        }
    }
    const orderedWaterAmounts = Array.from(waterAmountSet).sort((a, b) => a - b);

    const maxPermissibleSugar = Math.floor(maxOverallWeight * maxConcentrationRatio / (100 + maxConcentrationRatio));
    const sugarAmountSet = new Set();
    for (let i = 0; sugarUnitC * i < maxPermissibleSugar; ++i) {
        const currentSugarBase = sugarUnitC * i;
        for (let j = 0; currentSugarBase + sugarUnitD * j < maxPermissibleSugar; ++j) {
            sugarAmountSet.add(currentSugarBase + sugarUnitD * j);
        }
    }
    const orderedSugarAmounts = Array.from(sugarAmountSet).sort((a, b) => a - b);

    const sugarAvailabilityTracker = new Map();
    orderedSugarAmounts.forEach(sug => sugarAvailabilityTracker.set(sug, true));

    let highestAchievedDensity = 0;
    let finalResult = [0, 0];

    orderedWaterAmounts.forEach(currentWaterQuantity => {
        if (currentWaterQuantity === 0) return;

        const maxSugarForCurrentWater = Math.min(
            Math.floor(currentWaterQuantity * maxConcentrationRatio / 100),
            maxOverallWeight - currentWaterQuantity
        );

        const minSugarForDensityThreshold = Math.ceil(currentWaterQuantity * highestAchievedDensity);

        orderedSugarAmounts
            .filter(sugQuantity =>
                sugQuantity >= minSugarForDensityThreshold &&
                sugQuantity <= maxSugarForCurrentWater &&
                sugarAvailabilityTracker.get(sugQuantity)
            )
            .forEach(sugQuantity => {
                const calculatedDensity = sugQuantity / currentWaterQuantity;
                if (calculatedDensity > highestAchievedDensity) {
                    finalResult[0] = currentWaterQuantity + sugQuantity;
                    finalResult[1] = sugQuantity;
                    highestAchievedDensity = calculatedDensity;
                }
                sugarAvailabilityTracker.set(sugQuantity, false);
            });
    });

    return finalResult;
}

function Main(input) {
    const configuration = processInputData(input);
    const solution = determineOptimalMixture(configuration);
    console.log("%d %d", solution[0], solution[1]);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
