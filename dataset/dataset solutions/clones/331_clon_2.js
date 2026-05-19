var displayResult = console.log;

function processRawData(rawData) {
    // Split the entire input string into individual lines.
    var dataLines = rawData.split("\n");
    // Return a function that provides the next line from the processed data.
    return function () {
        return dataLines.shift();
    };
}

// This function orchestrates the main game simulation logic.
function executeGameSimulation(gameData) {
    // Obtain a function to retrieve the next piece of input data.
    var getNextDataItem = processRawData(gameData);
    // Read the first line, which indicates the number of games to simulate.
    var numGames = getNextDataItem() - 0; // Convert to number.

    // Iterate through each game.
    for (var gameIndex = 0; gameIndex < numGames; gameIndex++) {
        var outsCount = 0; // Counter for outs in the current game.
        var baseRunners = 0; // Number of runners currently on base.
        var totalPoints = 0; // Total points scored in the current game.

        // Continue the game until three outs are recorded.
        while (outsCount < 3) {
            // Read the next event outcome.
            var eventOutcome = getNextDataItem();

            if (eventOutcome === 'HIT') {
                // A hit advances runners and potentially scores a point.
                baseRunners++;
                if (baseRunners === 4) {
                    totalPoints++; // A runner scored.
                    baseRunners--; // The scoring runner is no longer on base.
                }
            } else if (eventOutcome === 'HOMERUN') {
                // A homerun clears all bases and scores points for all runners plus the batter.
                totalPoints += baseRunners + 1;
                baseRunners = 0; // Bases are cleared.
            } else {
                // Any other outcome is an out.
                outsCount++;
            }
        }
        // Display the total points for the completed game.
        displayResult(totalPoints);
    }
}

// Execute the main simulation function using input from standard input.
executeGameSimulation(require("fs").readFileSync("/dev/stdin", "utf8"));
// For local testing, you might use:
// executeGameSimulation(require("fs").readFileSync("input.txt", "utf8"));
