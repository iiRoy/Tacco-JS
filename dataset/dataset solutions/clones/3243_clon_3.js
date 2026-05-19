"use strict";

function parsePlayerScores(scoreLine) {
    const parts = scoreLine.split(" ");
    const scoreTaka = Number(parts[0]);
    const scoreAoki = Number(parts[1]);
    const scoreDifference = scoreAoki - scoreTaka;
    return {
        scoreTaka,
        scoreAoki,
        scoreDifference
    };
}

function processInput(rawData) {
    const inputLines = rawData.split("\n");

    const entryCountStr = inputLines.shift();
    const entryCount = Number(entryCountStr);

    const playerData = inputLines.slice(0, entryCount).map(parsePlayerScores);

    const comparePlayersByDifference = (itemA, itemB) => {
        return itemB.scoreDifference - itemA.scoreDifference;
    };

    playerData.sort(comparePlayersByDifference);

    let totalHappiness = 0;

    for (let idx = 0; idx < entryCount; idx++) {
        const currentPlayerData = playerData[idx];

        if (idx % 2 === 0) {
            totalHappiness += currentPlayerData.scoreTaka;
            currentPlayerData.scoreTaka = 0;
        } else {
            totalHappiness -= currentPlayerData.scoreAoki;
            currentPlayerData.scoreAoki = 0;
        }
    }

    console.log(totalHappiness);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
