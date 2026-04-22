const processInput = () => {
    const rawData = require('node:fs').readFileSync(0, 'utf8');
    const [alpha, beta] = rawData.trim().split(' ').map(Number);
    return { alpha, beta };
};

const computePathCost = (initialPosition, targetPosition) => {
    if (initialPosition === targetPosition) {
        return 0;
    }

    const absoluteDifferenceOfMagnitudes = Math.abs(Math.abs(initialPosition) - Math.abs(targetPosition));

    const polarityOfInitial = Math.sign(initialPosition);
    const polarityOfTarget = Math.sign(targetPosition);

    let supplementaryCost = 0;

    // A lookup table for determining the 'supplementaryCost' based on number polarities and relative order.
    // Keys are constructed as "polarityOfInitial,polarityOfTarget,comparison" where comparison is "gt" (greater than) or "lt" (less than).
    // If comparison is implied by polarities (e.g., positive vs negative), it's omitted.
    const costTable = new Map([
        // Both positive
        ['1,1,gt', 2], // initial > 0, target > 0, initial > target (e.g., 5,2)
        ['1,1,lt', 0], // initial > 0, target > 0, initial < target (e.g., 2,5)

        // Both negative
        ['-1,-1,gt', 2], // initial < 0, target < 0, initial > target (e.g., -2,-5)
        ['-1,-1,lt', 0], // initial < 0, target < 0, initial < target (e.g., -5,-2)

        // Different signs, neither is zero (relative order is implied)
        ['1,-1', 1], // initial > 0, target < 0 (initial is always > target) (e.g., 5,-2)
        ['-1,1', 1], // initial < 0, target > 0 (initial is always < target) (e.g., -2,5)

        // One of the numbers is zero
        ['1,0', 2],  // initial > 0, target = 0 (initial is always > target) (e.g., 5,0)
        ['0,1', 0],  // initial = 0, target > 0 (initial is always < target) (e.g., 0,5)
        ['0,-1', 2], // initial = 0, target < 0 (initial is always > target) (e.g., 0,-5)
        ['-1,0', 0]  // initial < 0, target = 0 (initial is always < target) (e.g., -5,0)
    ]);

    let tableLookupKey;
    if (polarityOfInitial === polarityOfTarget && polarityOfInitial !== 0) {
        // Numbers have the same non-zero sign, so relative order matters for the key
        tableLookupKey = `${polarityOfInitial},${polarityOfTarget},${initialPosition > targetPosition ? 'gt' : 'lt'}`;
    } else {
        // Numbers have different signs, or one/both are zero. Relative order is typically implied by polarities.
        tableLookupKey = `${polarityOfInitial},${polarityOfTarget}`;
    }

    // Retrieve the supplementary cost, defaulting to 0 if a specific key isn't found (e.g., for '0,0' which is handled by initialPosition === targetPosition)
    supplementaryCost = costTable.get(tableLookupKey) || 0;

    return absoluteDifferenceOfMagnitudes + supplementaryCost;
};

const numericPair = processInput();
const finalTravelCost = computePathCost(numericPair.alpha, numericPair.beta);
console.log(finalTravelCost);