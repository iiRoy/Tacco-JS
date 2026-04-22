// This module processes battle scenario data to determine optimal engagement rounds for a combat encounter.

function ProcessGameData(rawData) {
    // Ensure rawData is a string and trim any leading/trailing whitespace before splitting into lines.
    const sanitizedInputLines = String(rawData).trim().split('\n');

    // --- Input Validation and Parsing ---
    // Verify that we have at least two lines of input: one for parameters, one for at least one entity.
    if (sanitizedInputLines.length < 2) {
        console.error("InputError: Insufficient data provided. Expected at least two lines.");
        return; // Terminate execution gracefully.
    }

    // Parse the first line which contains the primary combat parameters.
    const initialParametersLine = sanitizedInputLines[0];
    const parameterTokens = initialParametersLine.split(" ");

    // Ensure the parameter line contains exactly three values.
    if (parameterTokens.length < 3) {
        console.error("InputError: First line must contain three numeric parameters: total entities, high damage, low damage.");
        return;
    }

    // Convert parameter tokens to integers, using radix 10 for explicit base.
    const totalEntities = parseInt(parameterTokens[0], 10);
    const highDamagePerAttack = parseInt(parameterTokens[1], 10);
    const lowDamagePerAttack = parseInt(parameterTokens[2], 10);

    // Perform basic numerical validation on the parsed parameters.
    if (isNaN(totalEntities) || isNaN(highDamagePerAttack) || isNaN(lowDamagePerAttack) ||
        totalEntities <= 0 || highDamagePerAttack <= 0 || lowDamagePerAttack <= 0) {
        console.error("InputError: Invalid or non-positive numerical parameters detected. All parameters must be positive integers.");
        return;
    }

    // Crucial guard: highDamagePerAttack must be strictly greater than lowDamagePerAttack.
    // If not, the supplemental damage calculation (hi - lo) would be zero or negative, leading to division by zero or illogical results.
    if (highDamagePerAttack <= lowDamagePerAttack) {
        console.error("LogicError: High damage per attack must be strictly greater than low damage per attack for effective supplemental damage.");
        console.log(0); // Output 0 as a reasonable default if no effective strategy can be formed.
        return;
    }

    // Initialize variables for tracking enemy healths and the maximum health encountered.
    let peakHealth = 0; // Stores the highest health value among all adversaries.
    const foeHealths = []; // An array to store the health points of each individual adversary.

    // Populate the foeHealths array and simultaneously determine the peak health.
    // Iteration starts from index 1 of sanitizedInputLines because index 0 contains parameters.
    for (let currentEntityIndex = 0; currentEntityIndex < totalEntities; currentEntityIndex++) {
        const entityHealthString = sanitizedInputLines[currentEntityIndex + 1];
        const currentFoeHP = parseInt(entityHealthString, 10);

        // Validate each enemy's health point value.
        if (isNaN(currentFoeHP) || currentFoeHP < 0) {
            console.warn(`DataWarning: Invalid or negative health value detected for entity ${currentEntityIndex + 1}: '${entityHealthString}'. Treating as 0 HP.`);
            foeHealths.push(0); // Push 0 HP to maintain array structure and allow continuation.
            continue;
        }
        
        foeHealths.push(currentFoeHP);
        // Update peakHealth if the current foe's HP is higher.
        if (currentFoeHP > peakHealth) {
            peakHealth = currentFoeHP;
        }
    }

    // --- Core Logic: Binary Search-like Optimization ---
    // This section implements an iterative search to find the optimal number of engagement rounds.
    // The goal is to find the minimum 'currentEstimateRounds' such that the 'requiredReinforcementAttacks'
    // (calculated based on currentEstimateRounds) is less than or equal to 'currentEstimateRounds'.

    // Helper function to compute the total additional attacks required for all foes
    // given a specific number of base rounds.
    const calculateReinforcementAttacks = (currentOptimalRounds, baseDamagePerRound, adversaryHealths, supplementalDamagePerHit) => {
        let cumulativeAdditionalAttacks = 0;
        const damageDealtByBaseRounds = currentOptimalRounds * baseDamagePerRound;

        for (const hp of adversaryHealths) {
            // Only foes with HP greater than the base damage dealt require additional attacks.
            if (hp > damageDealtByBaseRounds) {
                const remainingHealth = hp - damageDealtByBaseRounds;
                // Calculate and accumulate additional attacks, rounding up for partial health.
                cumulativeAdditionalAttacks += Math.ceil(remainingHealth / supplementalDamagePerHit);
            }
        }
        return cumulativeAdditionalAttacks;
    };

    // Define the search space boundaries for the number of rounds.
    // 'upperBound' is an initial conservative estimate for the maximum possible rounds needed.
    // It's based on the peak health and the lowest damage per attack.
    let upperBound = Math.ceil(peakHealth / lowDamagePerAttack);
    let lowerBound = 0; // The absolute minimum number of rounds possible.

    // 'currentEstimateRounds' is our primary variable that we are trying to optimize.
    // Initial guess, based on peak health and a specific damage multiplier (2 * lowDamagePerAttack).
    let currentEstimateRounds = Math.ceil(peakHealth / (2 * lowDamagePerAttack));
    
    // Variable to detect stagnation in the search process.
    let previousEstimateRounds = -1;

    // Safety mechanism: a maximum iteration count to prevent infinite loops, especially
    // in scenarios where Math.ceil might cause oscillations or non-convergence.
    const MAX_SEARCH_ITERATIONS = 200; 
    let loopIterationCount = 0;

    // The main optimization loop.
    while (true) {
        loopIterationCount++;
        // Check if the maximum number of iterations has been exceeded.
        if (loopIterationCount > MAX_SEARCH_ITERATIONS) {
            console.warn("SearchWarning: Exceeded maximum iterations. The search might not have converged to the absolute optimum.");
            break; // Exit the loop to prevent an infinite run.
        }

        // Calculate the total number of additional attacks necessary given the current estimate of rounds.
        const requiredReinforcementAttacks = calculateReinforcementAttacks(
            currentEstimateRounds,
            lowDamagePerAttack,
            foeHealths,
            (highDamagePerAttack - lowDamagePerAttack) // This is the effective supplemental damage per hit.
        );

        // Compare the required reinforcements with our current estimate for total rounds.
        if (requiredReinforcementAttacks > currentEstimateRounds) {
            // If more reinforcements are needed than our current estimate allows,
            // it means currentEstimateRounds is too low. Adjust the lower bound
            // and propose a higher new estimate.
            lowerBound = currentEstimateRounds;
            currentEstimateRounds = Math.ceil((upperBound + currentEstimateRounds) / 2);
        } else if (requiredReinforcementAttacks < currentEstimateRounds) {
            // If fewer reinforcements are needed, it means currentEstimateRounds might be too high.
            // Adjust the upper bound and propose a lower new estimate.
            upperBound = currentEstimateRounds;
            currentEstimateRounds = Math.ceil((lowerBound + currentEstimateRounds) / 2);
        } else {
            // If required reinforcements exactly match currentEstimateRounds, we've found the optimal balance.
            break; // Exit the loop.
        }

        // Check for stagnation: if the estimate stops changing, we might be in an infinite loop or have converged.
        if (currentEstimateRounds === previousEstimateRounds) {
            console.warn("SearchWarning: Optimal rounds estimate has stagnated. Breaking loop to prevent infinite execution.");
            break;
        }
        previousEstimateRounds = currentEstimateRounds; // Update for the next iteration's stagnation check.
    }

    // Output the final computed optimal number of rounds to standard output.
    console.log(currentEstimateRounds);
}

// Standard entry point for execution in competitive programming environments.
// It reads the entire input from standard input (e.g., a file or piped string)
// and passes it to the main processing function.
ProcessGameData(require("fs").readFileSync("/dev/stdin", "utf8"));