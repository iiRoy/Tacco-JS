const outputResult = console.log;

/**
 * Creates a utility function to sequentially read lines from a multi-line string.
 * It maintains an internal index to track the current position.
 * @param {string} sourceText - The raw input string containing multiple lines.
 * @returns {function(): (string | null)} A function that returns the next line, or null if no more lines.
 */
function obtainInputSupplier(sourceText) {
    // Input validation: ensure the source is a string.
    if (typeof sourceText !== 'string') {
        // Log an error and return a safe, non-functional reader.
        console.error("Error: Input source for line reader must be a string.");
        return () => null;
    }

    // Split the input into an array of lines.
    const dataFragments = sourceText.split("\n");
    let currentLineIndex = 0; // Initialize index for sequential access.

    // Return the line-fetching function.
    return function fetchNextLine() {
        // Check if there are more lines to read.
        if (currentLineIndex < dataFragments.length) {
            const line = dataFragments[currentLineIndex];
            currentLineIndex++; // Advance the index for the next call.
            return line;
        }
        return null; // Indicate that all lines have been read.
    };
}

// Constants defining game mechanics for clarity and easier modification.
const MAX_OUTS_PER_INNING = 3; // The number of outs before an inning ends.
const BASES_ON_FIELD = 3;     // Number of bases (1st, 2nd, 3rd).

/**
 * Encapsulates the logic for processing a single baseball-like game simulation.
 * It simulates events until three outs are recorded.
 * @param {function(): (string | null)} eventReader - A function to get the next game event string.
 * @returns {number} The total points scored in the simulated game.
 */
function simulateSingleGame(eventReader) {
    let currentOuts = 0;      // Counter for outs in the current game.
    let baseOccupancy = 0;    // Represents the number of runners currently on bases (0-3).
    let totalPoints = 0;      // Accumulator for points scored in this game.

    // Helper function to manage point scoring and base clearing.
    const scorePoints = (pointsToAdd, clearBases = false) => {
        totalPoints += pointsToAdd;
        if (clearBases) {
            baseOccupancy = 0; // Reset bases if specified (e.g., after a home run).
        }
    };

    // The main game loop continues until the maximum number of outs is reached.
    while (currentOuts < MAX_OUTS_PER_INNING) {
        const rawActionString = eventReader(); // Fetch the next event.

        // Robust input validation: handle null or non-string inputs.
        if (rawActionString === null || typeof rawActionString !== 'string') {
            // Treat invalid input as an out to prevent infinite loops or errors.
            console.warn("Warning: Received invalid or no input for a game event. Counting as an out.");
            currentOuts++;
            continue; // Skip to the next iteration of the loop.
        }

        // Normalize the event string for consistent processing.
        const trimmedAction = rawActionString.trim().toUpperCase();

        // Use a switch statement for clear event handling.
        switch (trimmedAction) {
            case 'HIT':
                baseOccupancy++; // The batter advances to first base.
                // If bases are loaded and a batter hits, a runner scores.
                if (baseOccupancy > BASES_ON_FIELD) {
                    scorePoints(1);             // One point for the runner who scored.
                    baseOccupancy = BASES_ON_FIELD; // Bases remain loaded (new runner on 1st, others advance).
                }
                break;
            case 'HOMERUN':
                // All runners on base plus the batter score.
                const totalScorers = baseOccupancy + 1;
                scorePoints(totalScorers, true); // Add points and clear all bases.
                break;
            case 'OUT':
                currentOuts++; // Increment the out counter.
                break;
            default:
                // Handle any unexpected or unrecognized event strings.
                console.warn(`Warning: Unrecognized game event '${rawActionString}'. Counting as an out.`);
                currentOuts++;
                break;
        }
    }
    return totalPoints; // Return the final score for the game.
}


/**
 * Main entry point for processing multiple game simulations from an input string.
 * This function orchestrates reading the number of games and then simulating each one,
 * printing the score for each.
 * @param {string} rawInputData - The complete input string from the data source.
 */
function executeScoreCalculation(rawInputData) {
    // Obtain the line-reading utility from the raw input data.
    const lineFetcher = obtainInputSupplier(rawInputData);

    // Read the first line, which should specify the total number of games to simulate.
    const gamesToProcessStr = lineFetcher();
    if (gamesToProcessStr === null) {
        console.error("Error: Input data is empty; no game count provided.");
        return; // Exit if no game count can be read.
    }

    const totalGames = parseInt(gamesToProcessStr, 10); // Convert the string to an integer.

    // Validate the parsed number of games.
    if (isNaN(totalGames) || totalGames < 0) {
        console.error(`Error: Invalid number of games specified in input: '${gamesToProcessStr}'.`);
        return; // Exit if the game count is invalid.
    }

    // Loop through each game simulation.
    for (let gameIndex = 0; gameIndex < totalGames; gameIndex++) {
        const gameResult = simulateSingleGame(lineFetcher); // Simulate one game.
        outputResult(gameResult); // Display the score for the completed game.
    }
}

// --- Program Execution Start ---
// This section is responsible for reading the input from the environment
// and initiating the main processing function.
// In competitive programming environments, input is typically read from /dev/stdin.
// For local testing, a file like 'input.txt' can be used by uncommenting the alternative line.
executeScoreCalculation(require("fs").readFileSync("/dev/stdin", "utf8"));
// executeScoreCalculation(require("fs").readFileSync("input.txt", "utf8"));