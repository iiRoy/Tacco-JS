const processGameConfiguration = (configLineText) => {
    const numericParts = configLineText.split(" ").map(Number);
    return {
        playerCount: numericParts[0],
        startingStones: numericParts[1]
    };
};

let rawInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');
let inputDataLines = rawInputContent.trim().split("\n");
let currentInputLinePointer = 0;

while (true) {
    const configurationString = inputDataLines[currentInputLinePointer++];
    if (configurationString === "0 0") {
        break;
    }

    const gameParameters = processGameConfiguration(configurationString);
    const numberOfPlayers = gameParameters.playerCount;
    let stonesCurrentlyHeld = gameParameters.startingStones;
    const totalStonesInGame = gameParameters.startingStones;

    let playerStonePiles = new Array(numberOfPlayers).fill(0);

    let activePlayerIdentifier = 0;

    // The game simulation loop continues until a winner is found.
    // The original code used a for loop with a large upper bound,
    // but a while(true) loop with an internal break is more semantically aligned.
    while (true) {
        // Cycle through players
        if (activePlayerIdentifier >= numberOfPlayers) {
            activePlayerIdentifier = 0;
        }

        if (stonesCurrentlyHeld > 0) {
            stonesCurrentlyHeld--;
            playerStonePiles[activePlayerIdentifier]++;

            const isWinningConditionMet = (stonesCurrentlyHeld === 0 && totalStonesInGame === playerStonePiles[activePlayerIdentifier]);
            if (isWinningConditionMet) {
                console.log(activePlayerIdentifier);
                break; // Exit the inner game simulation loop
            }
        } else {
            // If no stones in hand, take all from current player's pile
            stonesCurrentlyHeld = playerStonePiles[activePlayerIdentifier];
            playerStonePiles[activePlayerIdentifier] = 0;
        }
        activePlayerIdentifier++; // Advance to the next player
    }
}
