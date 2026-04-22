const computeOptimalValue = (dataLines) => {
    const [ numItems, actionLimit ] = dataLines[0].split(' ').map(Number);
    const initialQuantities = dataLines[1].split(' ').map(Number);
    const reductionFactors = dataLines[2].split(' ').map(Number);

    const orderedQuantities = initialQuantities.sort((valueA, valueB) => valueB - valueA);
    const orderedFactors = reductionFactors.sort((valueA, valueB) => valueA - valueB);

    const checkFeasibility = (targetCostThreshold) => {
        const totalRequiredAdjustments = orderedQuantities.reduce((currentSum, currentQuantity, index) => {
            const currentFactor = orderedFactors[index];
            const excessValue = currentQuantity - targetCostThreshold / currentFactor;
            return currentSum + (excessValue > 0 ? excessValue : 0);
        }, 0);
        return totalRequiredAdjustments <= actionLimit;
    };

    const performRecursiveSearch = (lowerBound, upperBound, remainingIterations) => {
        if (remainingIterations === 0) {
            return { lowerResult: lowerBound, upperResult: upperBound };
        }
        const midPoint = (lowerBound + upperBound) / 2;
        if (checkFeasibility(midPoint)) {
            return performRecursiveSearch(lowerBound, midPoint, remainingIterations - 1);
        } else {
            return performRecursiveSearch(midPoint, upperBound, remainingIterations - 1);
        }
    };

    const initialLowerBound = 0;
    const initialUpperBound = 1000000;
    const numberOfIterations = 100;

    const finalBounds = performRecursiveSearch(initialLowerBound, initialUpperBound, numberOfIterations);

    console.log(`lowerResult:${finalBounds.lowerResult} upperResult:${finalBounds.upperResult}`);
};

computeOptimalValue(
    require("fs")
        .readFileSync("/dev/stdin", "utf8")
        .split("\n")
);