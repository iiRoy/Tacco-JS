function CombatRoundsOptimizer(battleLogData) {
    // Validate input type: Ensure the provided data is a string.
    if (typeof battleLogData !== 'string') {
        battleLogData = String(battleLogData); // Coerce to string if possible.
    }

    // Split the entire input string into individual lines for processing.
    const inputLines = battleLogData.split('\n');

    // Perform initial validation: Check if there's any data to process.
    if (!inputLines || inputLines.length === 0 || inputLines[0].trim() === '') {
        throw new Error("Operational data is missing or malformed; cannot proceed.");
    }

    // Extract core combat parameters from the first line of input.
    // These include the total number of adversaries, and damage values for different attack types.
    const initialConfiguration = inputLines[0].split(' ');

    const totalAdversaries = Number(initialConfiguration[0]);
    const highPowerDamage = Number(initialConfiguration[1]);
    const lowPowerDamage = Number(initialConfiguration[2]);

    // Robustness checks for initial parsed parameters.
    if (isNaN(totalAdversaries) || totalAdversaries < 0 ||
        isNaN(highPowerDamage) || highPowerDamage < 0 ||
        isNaN(lowPowerDamage) || lowPowerDamage < 0) {
        throw new Error("Detected invalid numerical parameters in configuration. All values must be non-negative.");
    }

    // Critical game logic constraint: High power damage must strictly exceed low power damage
    // for the strategic calculations involving damage differential to be meaningful.
    if (highPowerDamage <= lowPowerDamage) {
        throw new Error("High power damage must be greater than low power damage for this combat strategy to apply.");
    }

    const adversaryHealthPoints = [];
    let peakAdversaryHealth = 0; // Tracks the highest health value encountered among all enemies.

    // Iterate through the remaining input lines to populate adversary health data.
    // The loop starts from index 1 of `inputLines` as index 0 contains configuration.
    for (let currentAdversaryIndex = 0; currentAdversaryIndex < totalAdversaries; currentAdversaryIndex++) {
        const individualAdversaryHp = Number(inputLines[currentAdversaryIndex + 1]);

        // Validate each adversary's health value.
        if (isNaN(individualAdversaryHp) || individualAdversaryHp < 0) {
            throw new Error(`Invalid health value found for adversary at index ${currentAdversaryIndex}.`);
        }

        adversaryHealthPoints.push(individualAdversaryHp);

        // Update the peak health if the current adversary is tougher.
        if (individualAdversaryHp > peakAdversaryHealth) {
            peakAdversaryHealth = individualAdversaryHp;
        }
    }

    // Handle edge cases: If there are no adversaries or the strongest adversary has zero health,
    // no combat rounds are necessary.
    if (totalAdversaries === 0 || peakAdversaryHealth === 0) {
        console.log(0);
        return;
    }

    // Initialize the search space for the optimal number of combat rounds.
    // `upperBoundRounds`: An initial pessimistic estimate assuming only low-power attacks.
    // `lowerBoundRounds`: The absolute minimum possible rounds.
    let upperBoundRounds = Math.ceil(peakAdversaryHealth / lowPowerDamage);
    let lowerBoundRounds = 0;
    
    // `currentRoundGuess`: Our iterative best guess for the optimal rounds.
    // Initialized to a reasonable mid-point estimate.
    let currentRoundGuess = Math.ceil(peakAdversaryHealth / (2 * lowPowerDamage));
    let lastRoundGuessState = -1; // Used to detect convergence or stagnation in the search.

    let executionIterations = 0; // Counter to prevent infinite loops.
    const MAXIMUM_ITERATIONS_ALLOWED = 150; // Set a hard limit for the search process.

    // Pre-calculate the difference between high and low damage for repeated use.
    const damageDifferencePerHit = highPowerDamage - lowPowerDamage;

    // Main optimization loop: This performs a binary search-like process
    // to find the minimum number of rounds required.
    while (true) {
        executionIterations++;

        // Calculate the total damage that would be dealt if all attacks in
        // `currentRoundGuess` were low-power attacks.
        const cumulativeLowDamagePerRound = currentRoundGuess * lowPowerDamage;
        let supplementaryHighDamageHitsNeeded = 0; // Counts additional high-power hits.

        // Iterate through each adversary to determine if additional high-power attacks are necessary.
        for (const adversaryHp of adversaryHealthPoints) {
            // If an adversary's health surpasses the cumulative low damage,
            // it means high-power attacks are required to finish it.
            if (adversaryHp > cumulativeLowDamagePerRound) {
                // Determine how many extra high-power hits are needed for this specific adversary.
                // This accounts for the remaining health using the damage differential.
                supplementaryHighDamageHitsNeeded += Math.ceil((adversaryHp - cumulativeLowDamagePerRound) / damageDifferencePerHit);
            }
        }

        // Store the current guess before potential modification.
        lastRoundGuessState = currentRoundGuess;

        // Adjust the search bounds and the `currentRoundGuess` based on the analysis.
        if (supplementaryHighDamageHitsNeeded > currentRoundGuess) {
            // If we need more high-power hits than the current guess allows,
            // our guess is too low. We need to increase the lower bound.
            lowerBoundRounds = currentRoundGuess;
            currentRoundGuess = Math.ceil((upperBoundRounds + currentRoundGuess) / 2);
        } else if (supplementaryHighDamageHitsNeeded < currentRoundGuess) {
            // If we need fewer high-power hits, our guess is too high.
            // We can potentially reduce the number of rounds by adjusting the upper bound.
            upperBoundRounds = currentRoundGuess;
            currentRoundGuess = Math.ceil((lowerBoundRounds + currentRoundGuess) / 2);
        } else {
            // If the number of supplementary high-power hits exactly matches the current guess,
            // we have found the optimal number of rounds.
            break;
        }

        // Termination conditions for the loop:
        // 1. If the guess for optimal rounds no longer changes (convergence).
        if (currentRoundGuess === lastRoundGuessState) {
            break;
        }
        // 2. If the loop exceeds a predefined number of iterations (safeguard against infinite loops).
        if (executionIterations >= MAXIMUM_ITERATIONS_ALLOWED) {
            break;
        }
    }

    // Output the final calculated optimal number of combat rounds.
    console.log(currentRoundGuess);
}

// Entry point for execution: Read input from standard input and invoke the optimizer.
try {
    CombatRoundsOptimizer(require("fs").readFileSync("/dev/stdin", "utf8"));
} catch (error) {
    // Basic error handling for issues during execution or input processing.
    console.error("An operational error occurred: " + error.message);
    // In a production environment, more sophisticated error logging and exiting strategies would be employed.
    // process.exit(1); // Indicate failure.
}