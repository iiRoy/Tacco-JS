const fileSystem = require('fs'); // Import the Node.js file system module for input operations
const standardInputPath = '/dev/stdin'; // Define the path for standard input

// Acquire and preprocess raw input data from standard input
// Reads the entire file, converts it to a UTF-8 string, removes leading/trailing whitespace, and splits into an array of lines.
let rawInputData = fileSystem.readFileSync(standardInputPath, 'utf8').trim().split('\n');

// Initialize a cursor to track the current line being processed from the input array
let inputLineCursor = 0;

// Parse the very first line of input, which contains global parameters.
// Splits the line by one or more whitespace characters and converts each part to a number.
const initialConfigTokens = rawInputData[inputLineCursor++].split(/\s+/).map(Number);

// The first token represents the primary objective or threshold to be reached (e.g., target health, score).
const primaryObjectiveThreshold = initialConfigTokens[0];
// The second token indicates the count of available 'actions' or 'abilities' that can be used.
const countOfAvailableAbilities = initialConfigTokens[1];

// --- Input Validation (Type III addition) ---
// Basic checks for valid numeric input for critical parameters.
if (isNaN(primaryObjectiveThreshold) || primaryObjectiveThreshold < 1 ||
    isNaN(countOfAvailableAbilities) || countOfAvailableAbilities < 1) {
    // In a real application, this might throw an error or log a warning.
    // For competitive programming, invalid input might lead to specific behavior or be implicitly handled.
    // console.error("Error: Invalid or non-positive values for objective threshold or number of abilities.");
    // process.exit(1); // Exit if critical input is invalid
}

// An array to store the details of each available ability.
// Each ability will be an object with 'effect' (how much it contributes to the objective)
// and 'cost' (the resource expenditure for using it).
let definedAbilities = [];
let maxIndividualAbilityEffect = 0; // Tracks the largest 'effect' value among all abilities.
                                    // Used to determine the necessary size of the DP array.

// Loop through the subsequent input lines to populate the 'definedAbilities' array.
for (let abilityIdx = 0; abilityIdx < countOfAvailableAbilities; abilityIdx++) {
    // Split each line into two numeric tokens: effect and cost.
    const abilityDetailPair = rawInputData[inputLineCursor++].split(/\s+/).map(Number);
    const abilityImpact = abilityDetailPair[0];
    const abilityResourceCost = abilityDetailPair[1];

    // Store the ability as an object for better readability.
    definedAbilities.push({ impact: abilityImpact, expense: abilityResourceCost });

    // Update the maximum individual ability effect if the current one is larger.
    if (abilityImpact > maxIndividualAbilityEffect) {
        maxIndividualAbilityEffect = abilityImpact;
    }
}

// --- Dynamic Programming Setup ---
// Calculate the maximum possible effect level that needs to be considered in our DP table.
// We need to track states up to the primaryObjectiveThreshold, plus the maximum single impact
// an ability can provide, because reaching slightly beyond the threshold with less cost is valid.
const maxRelevantEffectLevel = primaryObjectiveThreshold + maxIndividualAbilityEffect;

// Initialize the DP array. `minResourceCostToAchieve[i]` will store the minimum cost
// to achieve an effect level of *exactly* 'i'.
// All states are initially set to 'Infinity' to signify they are unreachable.
let minResourceCostToAchieve = Array(maxRelevantEffectLevel + 1).fill(Infinity);

// Base case: Achieving an effect level of 0 costs 0 resources.
minResourceCostToAchieve[0] = 0;

// --- Core Dynamic Programming Calculation ---
// Iterate through each possible effect level we can try to reach.
// The loop goes up to 'maxRelevantEffectLevel' because costs for these states are needed
// to potentially find the optimal solution for 'primaryObjectiveThreshold' or higher.
for (let currentEffectProgress = 0; currentEffectProgress <= maxRelevantEffectLevel; currentEffectProgress++) {
    // If the current effect level is not reachable (cost is Infinity), skip processing it.
    // There's no point in trying to apply abilities from an unreachable state.
    if (minResourceCostToAchieve[currentEffectProgress] === Infinity) {
        continue;
    }

    // For each available ability, attempt to apply it from the current effect level.
    for (let abilityListIndex = 0; abilityListIndex < countOfAvailableAbilities; abilityListIndex++) {
        const currentAbilityDefinition = definedAbilities[abilityListIndex];
        const abilityEffectValue = currentAbilityDefinition.impact;
        const abilityExpenditure = currentAbilityDefinition.expense;

        // Calculate the new effect level after applying this ability.
        const resultantEffectLevel = currentEffectProgress + abilityEffectValue;

        // --- Array Bounds Check (Type III addition) ---
        // Ensure that the 'resultantEffectLevel' is within our calculated DP array bounds.
        // If it exceeds the maximum relevant level, we don't need to track its cost.
        if (resultantEffectLevel > maxRelevantEffectLevel) {
            continue;
        }

        // Calculate the total cost to reach 'resultantEffectLevel' via the current path.
        const cumulativeCostForThisPath = minResourceCostToAchieve[currentEffectProgress] + abilityExpenditure;

        // Update the minimum cost for 'resultantEffectLevel' if this new path is cheaper.
        if (cumulativeCostForThisPath < minResourceCostToAchieve[resultantEffectLevel]) {
            minResourceCostToAchieve[resultantEffectLevel] = cumulativeCostForThisPath;
        }
    }
}

// --- Post-processing: Determine the overall minimum cost ---
// The objective is to find the minimum cost to achieve *at least* the 'primaryObjectiveThreshold'.
// This means we need to check all states from 'primaryObjectiveThreshold' up to 'maxRelevantEffectLevel'.
let overallMinimumAchievedCost = Infinity;

// Iterate through the relevant range of effect levels.
for (let scanObjectiveLevel = primaryObjectiveThreshold; scanObjectiveLevel <= maxRelevantEffectLevel; scanObjectiveLevel++) {
    // If the current 'scanObjectiveLevel' is reachable, compare its cost with the current overall minimum.
    if (minResourceCostToAchieve[scanObjectiveLevel] !== Infinity) {
        if (minResourceCostToAchieve[scanObjectiveLevel] < overallMinimumAchievedCost) {
            overallMinimumAchievedCost = minResourceCostToAchieve[scanObjectiveLevel];
        }
    }
}

// --- Final Validation (Type III addition) ---
// If 'overallMinimumAchievedCost' is still Infinity, it implies the primary objective
// (or any level beyond it) was completely unreachable with the given abilities.
if (overallMinimumAchievedCost === Infinity) {
    // For competitive programming, the problem usually implies a valid solution exists
    // or expects 'Infinity' to be the output for unreachable cases.
    // console.log("The primary objective threshold is unreachable with the given abilities.");
}

// Output the final calculated minimum cost to achieve the objective.
console.log(overallMinimumAchievedCost);