const rawInputLines = require('fs') .readFileSync('/dev/stdin', 'utf8') .trim() .split('\n'); // Obtain raw input data from standard input, clean it, and divide into individual lines.

let configurationTokens = rawInputLines.shift() .split(' '); // Extract the very first line, which contains initial configuration parameters, splitting it by spaces.

const goalLevel = Number(configurationTokens.shift()); // Parse the target level for the problem (corresponds to H).
const availableAbilityCount = Number(configurationTokens.shift()); // Parse the total number of distinct abilities available (corresponds to N).

const abilityDescriptions = []; // Initialize a container to hold details for each distinct ability.

// Iterate 'availableAbilityCount' times to populate the 'abilityDescriptions' array.
// Each iteration reads a line describing an ability's power and its associated cost.
for (let abilityIndex = 0; abilityIndex < availableAbilityCount; abilityIndex++) {
    abilityDescriptions.push(
        rawInputLines.shift()
                     .split(' ')
                     .map(elementString => Number(elementString)) // Convert string components to numerical values.
    );
}

// Initialize a dynamic programming table (memoization array) to store the minimum cost
// to reach each specific elevation. 'minimumCosts[level]' will store the lowest cost to reach 'level'.
// Start with a base case: it costs 0 to be at level 0.
const minimumCosts = [0];

// Begin the primary DP calculation loop. This iterates through all possible elevations,
// from the starting point up to slightly beyond the 'goalLevel', to ensure all paths are considered.
for (let currentElevation = 0; currentElevation <= goalLevel + 1; currentElevation++) {
    // If the current elevation has not yet been reached by any valid path (cost is undefined),
    // then no further abilities can be applied from this elevation, so skip to the next.
    if (minimumCosts[currentElevation] === undefined) {
        continue;
    }

    // For the current reachable elevation, evaluate applying each available ability.
    for (let currentAbilityIdx = 0; currentAbilityIdx < availableAbilityCount; currentAbilityIdx++) {
        // Calculate the next elevation that would be reached by using the current ability.
        const nextElevation = currentElevation + abilityDescriptions[currentAbilityIdx][0];
        // Determine the total cost to reach 'nextElevation' via this specific path.
        const newCalculatedCost = minimumCosts[currentElevation] + abilityDescriptions[currentAbilityIdx][1];

        // Update the minimum cost for 'nextElevation' if this newly calculated path
        // is either the first path found to 'nextElevation' or is cheaper than a previously known path.
        minimumCosts[nextElevation] = (
            minimumCosts[nextElevation] === undefined ||
            minimumCosts[nextElevation] > newCalculatedCost
        )
            ? newCalculatedCost
            : minimumCosts[nextElevation];
    }
}

// After populating the 'minimumCosts' table, we need to find the overall minimum cost
// to reach *at least* the 'goalLevel'. This means considering levels beyond 'goalLevel'
// if they offer a cheaper overall path.
let lowestObservedCost = minimumCosts[minimumCosts.length - 1]; // Initialize with the cost of the highest calculated level.

// Iterate backwards from the highest calculated level down to the 'goalLevel'.
// This propagates the minimum cost backwards, ensuring that 'minimumCosts[goalLevel]'
// ultimately holds the lowest cost to reach 'goalLevel' or any level above it if that's cheaper.
for (let scanPosition = minimumCosts.length - 1; scanPosition >= goalLevel; scanPosition--) {
    // If the cost for the current 'scanPosition' is undefined or higher than the
    // 'lowestObservedCost' found so far, then this path isn't better.
    if (minimumCosts[scanPosition] === undefined || minimumCosts[scanPosition] >= lowestObservedCost) {
        minimumCosts[scanPosition] = lowestObservedCost; // Assign the current 'lowestObservedCost'.
    } else {
        lowestObservedCost = minimumCosts[scanPosition]; // Otherwise, a new lower cost is found.
    }
}

// Output the final minimum cost required to reach the 'goalLevel' (or beyond, if more optimal).
console.log(minimumCosts[goalLevel]);