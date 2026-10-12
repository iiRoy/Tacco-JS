'use strict'

function GameEngine(rawData) {
  const lineSegments = rawData.split('\n');

  const playerHands = new Map();
  playerHands.set('a', [...lineSegments[0]]);
  playerHands.set('b', [...lineSegments[1]]);
  playerHands.set('c', [...lineSegments[2]]);

  function determineWinner(activePlayerIdentifier, currentHandsMap) {
    const currentHand = currentHandsMap.get(activePlayerIdentifier);
    const nextDesignation = currentHand.shift();

    if (currentHand.length === 0) {
      return activePlayerIdentifier.toUpperCase();
    } else {
      return determineWinner(nextDesignation, currentHandsMap);
    }
  }

  const finalVictor = determineWinner('a', playerHands);
  console.log(finalVictor);
}

GameEngine(require("fs").readFileSync("/dev/stdin", "utf8"));
