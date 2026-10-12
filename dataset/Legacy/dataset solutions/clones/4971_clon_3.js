'use strict';

const PLAYER_IDENTIFIERS = ['a', 'b', 'c'];

function initializeGameStacks(rawDataString) {
    const inputLines = rawDataString.split('\n');
    const gamePlayerStacks = {};

    PLAYER_IDENTIFIERS.forEach((playerKey, index) => {
        gamePlayerStacks[playerKey] = [...inputLines[index]];
    });

    return gamePlayerStacks;
}

function GameProcessor(rawInputData) {
    const playerCardStacks = initializeGameStacks(rawInputData);

    let activePlayerKey = PLAYER_IDENTIFIERS[0];
    let nextPlayerCharIdentifier = '';
    let finalWinnerIdentifier = '';

    for (;;) {
        nextPlayerCharIdentifier = playerCardStacks[nextTurn].shift();

        if (playerCardStacks[activePlayerKey].length === 0) {
            finalWinnerIdentifier = activePlayerKey.toUpperCase();
            break;
        }
        activePlayerKey = nextPlayerCharIdentifier;
    }

    console.log(finalWinnerIdentifier);
}

const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
GameProcessor(fileContent);
