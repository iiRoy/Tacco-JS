function solveProblem(rawInputString) {
    const MAX_BURGER_LEVEL_INDEX = 50; // The maximum level index accessed in the original loop (0 to 50)
    // Note: The original code initializes arrays with size 50, but then accesses index 50.
    // This implies a potential runtime error if N=50. This behavior is preserved.
    const pattyCountsAtLevel = new Array(MAX_BURGER_LEVEL_INDEX);
    const totalLayerSizesAtLevel = new Array(MAX_BURGER_LEVEL_INDEX);

    pattyCountsAtLevel[0] = 1;
    totalLayerSizesAtLevel[0] = 1;

    // Pre-calculate patty and total layer counts for each burger level
    for (let currentLevelIndex = 1; currentLevelIndex <= MAX_BURGER_LEVEL_INDEX; currentLevelIndex++) {
        pattyCountsAtLevel[currentLevelIndex] = (pattyCountsAtLevel[currentLevelIndex - 1] * 2) + 1;
        totalLayerSizesAtLevel[currentLevelIndex] = (totalLayerSizesAtLevel[currentLevelIndex - 1] * 2) + 3;
    }

    const inputLines = rawInputString.split("\n");
    const firstLineValues = inputLines[0].split(" ");
    const levelDepth = parseInt(firstLineValues[0], 10);
    let targetPosition = parseInt(firstLineValues[1], 10);

    let currentLayerTotalSize = totalLayerSizesAtLevel[levelDepth];
    let currentLayerPattyCount = pattyCountsAtLevel[levelDepth];
    let pattiesEaten = 0;
    let isReversedCalculation = false;

    // Helper function to process one layer of the burger structure iteratively
    // This encapsulates the logic of a single iteration of the original while loop
    function iterateBurgerDecomposition(currentX, currentFullSize, currentPattyCount) {
        let nextX = currentX;
        let nextFullSize = currentFullSize;
        let nextPattyCount = currentPattyCount;
        let pattiesAddedThisStep = 0;

        // (currentFullSize - 1) / 2 represents the size of (Bun + Burger(L-1))
        const sizeOfLowerHalfSegment = Math.floor((currentFullSize - 1) / 2);
        // (currentPattyCount - 1) / 2 represents the patty count of Burger(L-1)
        const pattiesInLowerBurgerSegment = Math.floor((currentPattyCount - 1) / 2);

        if (currentX > sizeOfLowerHalfSegment) {
            // The target position is in the middle patty, upper burger (L-1), or top bun.
            // We have passed the lower burger (L-1) and the middle patty.
            pattiesAddedThisStep = pattiesInLowerBurgerSegment + 1;

            // Adjust target position to be relative to the start of the upper burger (L-1).
            // This means consuming the lower half segment (Bun + Burger(L-1)) and the middle patty.
            nextX = currentX - sizeOfLowerHalfSegment - 1;

            // The remaining structure to analyze is effectively an (L-1) burger.
            nextFullSize = sizeOfLowerHalfSegment - 1; // This is the actual size of Burger(L-1)
            nextPattyCount = pattiesInLowerBurgerSegment; // This is the actual patty count of Burger(L-1)
        } else {
            // The target position is in the bottom bun or the lower burger (L-1).
            // Consume the bottom bun.
            nextX = currentX - 1;

            // The remaining structure to analyze is effectively an (L-1) burger.
            nextFullSize = sizeOfLowerHalfSegment - 1; // This is the actual size of Burger(L-1)
            nextPattyCount = pattiesInLowerBurgerSegment; // This is the actual patty count of Burger(L-1)
        }
        return { nextX, nextFullSize, nextPattyCount, pattiesAddedThisStep };
    }

    // Handle the case where targetPosition is beyond the burger's total size.
    // The original logic handles this by effectively counting from the end.
    if (targetPosition > currentLayerTotalSize) {
        targetPosition = currentLayerTotalSize - targetPosition; // Original: X = full - X;
        isReversedCalculation = true;
    }

    // Iteratively decompose the burger structure to count patties up to the targetPosition
    while (targetPosition > 0) {
        const stepResult = iterateBurgerDecomposition(targetPosition, currentLayerTotalSize, currentLayerPattyCount);
        pattiesEaten += stepResult.pattiesAddedThisStep;
        targetPosition = stepResult.nextX;
        currentLayerTotalSize = stepResult.nextFullSize;
        currentLayerPattyCount = stepResult.nextPattyCount;
    }

    // If the calculation was effectively reversed (targetPosition was initially > total size),
    // then the result needs to be subtracted from the total patties in the full burger.
    if (isReversedCalculation) { // Original: if(flag=1)
        pattiesEaten = pattyCountsAtLevel[levelDepth] - pattiesEaten;
    }

    console.log('%s', pattiesEaten);
}

// Debugging utility function for browser environment (preserved as per original)
function runDebugSimulation() {
    var input = document.getElementById("input").value;
    solveProblem(input);
}

// Main execution for competitive programming environment (e.g., Node.js)
solveProblem(require("fs").readFileSync("/dev/stdin", "utf8"));
