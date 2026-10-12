var inputLines = [];
var unusedFileHandle; // Renamed from 'f', remains unused
var nodeReadline = require('readline');

var interfaceInstance = nodeReadline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

interfaceInstance.on('line', function (receivedLine) {
    inputLines.push(receivedLine);
});

interfaceInstance.on('close', function () {
    /* --TLE-- */

    function executeBurgerCalculation() {
        const inputParts = inputLines[0].split(" ");
        const burgerHeight = Number(inputParts[0]);
        const eatenPortion = Number(inputParts[1]);

        // The 'result' variable was present in the original but unused.
        // Keeping it renamed but still unused to maintain structural similarity.
        var computedPattyCount = 0;

        // バーガーの厚さの数列
        // an+1 = 2an + 3
        // (an+1 + 3) = 2(an +3)
        // 2(an + 3) = 2^n(a1 + 3)
        // an =  2^(n+2) - 3

        // パティの量
        // bn+1 = 2bn + 1
        // bn+1 + 1 = 2(bn + 1)
        // 2(bn + 1) = 2^n(b1 + 1)
        // bn = 2^(n+1) - 1

        console.log(calculatePattyPatties(burgerHeight, eatenPortion));
    }

    executeBurgerCalculation();
});

// calculatePattyPatties: Determines the number of patties eaten from a burger of a given level,
// considering a specific number of layers eaten from the bottom.
function calculatePattyPatties(currentBurgerHeight, portionToEat) {
    // Calculate total thickness and total patties for the current burger height using bit shifts
    const currentBurgerTotalThickness = (1 << (currentBurgerHeight + 1)) - 3; // Equivalent to Math.pow(2, currentBurgerHeight + 1) - 3
    const currentBurgerTotalPatties = (1 << currentBurgerHeight) - 1;       // Equivalent to Math.pow(2, currentBurgerHeight) - 1

    // Base case: A 0-level burger (smallest unit) has 1 patty.
    if (currentBurgerHeight === 0) {
        return 1;
    }

    const bottomBunLayerThickness = 1; // The very first layer is always a bun.
    const lowerBurgerTopBoundary = currentBurgerTotalThickness + bottomBunLayerThickness; // Corresponds to original 'len + 1'

    // Evaluate the portion eaten by "Runrun"
    if (portionToEat === bottomBunLayerThickness) {
        // If only the bottom bun is eaten, no patties are consumed.
        return 0;
    } else if (portionToEat <= lowerBurgerTopBoundary) {
        // If the eaten portion is within the lower burger (including its bottom bun, but not the middle patty).
        // Recursively check the lower burger, adjusting for the bottom bun already consumed.
        return calculatePattyPatties(currentBurgerHeight - 1, portionToEat - bottomBunLayerThickness);
    } else if (portionToEat === lowerBurgerTopBoundary + 1) {
        // If the eaten portion exactly reaches the middle patty.
        // This includes all patties from the lower burger plus the single middle patty.
        return currentBurgerTotalPatties + 1;
    } else if (portionToEat <= (lowerBurgerTopBoundary * 2)) {
        // If the eaten portion is beyond the middle patty, into the upper burger, but not the whole burger.
        // The portion to consider for the upper burger is:
        // total portion - (thickness of lower burger + middle patty + bottom bun)
        // This is `portionToEat - (lowerBurgerTopBoundary + bottomBunLayerThickness)`
        const remainingPortionForUpperBurger = portionToEat - (lowerBurgerTopBoundary + bottomBunLayerThickness);
        return currentBurgerTotalPatties + 1 + calculatePattyPatties(currentBurgerHeight - 1, remainingPortionForUpperBurger);
    } else {
        // If the entire burger is eaten.
        // This includes all patties from two lower burgers plus the single middle patty.
        return (currentBurgerTotalPatties * 2) + 1;
    }
    // The argument `portionToEat - bottomBunLayerThickness` is passed to the recursive call
    // because the very bottom layer is always a bun and does not contain a patty.
}
