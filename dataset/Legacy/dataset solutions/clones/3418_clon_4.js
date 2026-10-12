const MAX_BURGER_DEPTH = 50;
const totalLayerCounts = new Array(MAX_BURGER_DEPTH + 1);
const totalPattyCounts = new Array(MAX_BURGER_DEPTH + 1);

totalLayerCounts[0] = 1; // A level 0 burger is just a patty (P)
totalPattyCounts[0] = 1; // It has 1 layer and 1 patty

// Pre-calculate layer and patty counts for all burger levels up to MAX_BURGER_DEPTH
// A level 'D' burger is structured as: B (D-1 burger) P (D-1 burger) B
// Layers: 1 + totalLayerCounts[D-1] + 1 + totalLayerCounts[D-1] + 1
// Patties: 0 + totalPattyCounts[D-1] + 1 + totalPattyCounts[D-1] + 0
for (let currentDepth = 1; currentDepth <= MAX_BURGER_DEPTH; currentDepth++) {
    totalLayerCounts[currentDepth] = totalLayerCounts[currentDepth - 1] * 2 + 3;
    totalPattyCounts[currentDepth] = totalPattyCounts[currentDepth - 1] * 2 + 1;
}

/**
 * Recursively calculates the number of patties eaten when consuming a specified number of layers
 * from the bottom of a burger of a given level.
 *
 * @param {number} currentDepth The current level of the burger being considered (e.g., N in the problem).
 * @param {number} layersToEat The number of layers to consume from the bottom of the current burger.
 * @returns {number} The total number of patties eaten.
 */
function calculateEatenPatties(currentDepth, layersToEat) {
    // If no layers are to be eaten, or we've gone past the top, no patties are eaten.
    if (layersToEat <= 0) {
        return 0;
    }

    // Base case: A level 0 burger is a single patty.
    if (currentDepth === 0) {
        return 1; // If layersToEat > 0, we eat the patty.
    }

    const lowerLevelLayers = totalLayerCounts[currentDepth - 1];
    const lowerLevelPatties = totalPattyCounts[currentDepth - 1];

    // Burger structure: B (D-1 burger) P (D-1 burger) B
    // Layer breakdown from bottom:
    // 1. Bottom Bun (1 layer)
    // 2. Lower (D-1) Burger (lowerLevelLayers layers)
    // 3. Middle Patty (1 layer)
    // 4. Upper (D-1) Burger (lowerLevelLayers layers)
    // 5. Top Bun (1 layer)

    // Scenario 1: Only eating the bottom bun (1 layer)
    if (layersToEat === 1) {
        return 0; // Buns have no patties.
    }
    // Scenario 2: Eating the bottom bun and into the lower (D-1) burger
    else if (layersToEat <= 1 + lowerLevelLayers) {
        // We eat the bottom bun (0 patties), then recurse on the lower (D-1) burger
        // with (layersToEat - 1) layers remaining.
        return calculateEatenPatties(currentDepth - 1, layersToEat - 1);
    }
    // Scenario 3: Eating the bottom bun, the entire lower (D-1) burger, and the middle patty
    else if (layersToEat === 1 + lowerLevelLayers + 1) {
        // We've eaten all patties from the lower (D-1) burger plus the middle patty.
        return lowerLevelPatties + 1;
    }
    // Scenario 4: Eating the bottom bun, the entire lower (D-1) burger, the middle patty,
    // and into the upper (D-1) burger
    else if (layersToEat <= 1 + lowerLevelLayers + 1 + lowerLevelLayers) {
        // Patties from the bottom half (lower burger + middle patty).
        const pattiesFromBottomHalf = lowerLevelPatties + 1;
        // Remaining layers to eat from the upper (D-1) burger.
        const remainingLayersForUpperBurger = layersToEat - (1 + lowerLevelLayers + 1);
        return pattiesFromBottomHalf + calculateEatenPatties(currentDepth - 1, remainingLayersForUpperBurger);
    }
    // Scenario 5: Eating the entire current burger (or more layers than available, which is equivalent)
    else {
        // We've eaten all patties in the current burger.
        return totalPattyCounts[currentDepth];
    }
}

/**
 * Main function to process the input and output the result.
 * @param {string} rawData The raw input string from stdin.
 */
function processBurgerRequest(rawData) {
    const lines = rawData.split("\n");
    const [burgerLevelStr, layersToConsumeStr] = lines[0].split(" ");

    const burgerLevel = parseInt(burgerLevelStr, 10);
    const layersToConsume = parseInt(layersToConsumeStr, 10);

    const resultPatties = calculateEatenPatties(burgerLevel, layersToConsume);
    console.log('%s', resultPatties);
}

// Read input from stdin and call the main processing function.
processBurgerRequest(require("fs").readFileSync("/dev/stdin", "utf8"));
