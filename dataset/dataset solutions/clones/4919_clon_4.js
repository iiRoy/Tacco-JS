function processGameScenario(incomingTextData) {
  const individualSymbols = incomingTextData.trim().split("");

  const outcomeLookup = [
    [0, -1], // Player's 0 (conceptual 'g') vs opponent's 0 (conceptual 'g'), Player's 0 vs opponent's 1 (conceptual 'p')
    [1, 0]   // Player's 1 (conceptual 'p') vs opponent's 0 (conceptual 'g'), Player's 1 vs opponent's 1 (conceptual 'p')
  ];

  const characterToOrdinal = { 'g': 0, 'p': 1 };

  const finalSummary = individualSymbols.reduce((currentTally, opponentSymbol, roundPosition) => {
    let playerOrdinalChoice;
    if (roundPosition === 0) {
      playerOrdinalChoice = 0; // Player's initial choice is always conceptual 'g' (0)
    } else {
      // Subsequent choices: strategy based on player's prior counts
      if (currentTally.ordinalZeroCount > currentTally.ordinalOneCount) {
        playerOrdinalChoice = 1; // If player has played more conceptual 'g's (0), then play conceptual 'p' (1)
      } else {
        playerOrdinalChoice = 0; // Otherwise, play conceptual 'g' (0)
      }
    }

    const opponentOrdinal = characterToOrdinal[opponentSymbol];
    const roundScore = outcomeLookup[playerOrdinalChoice][opponentOrdinal];

    return {
      totalScore: currentTally.totalScore + roundScore,
      ordinalZeroCount: currentTally.ordinalZeroCount + (playerOrdinalChoice === 0 ? 1 : 0),
      ordinalOneCount: currentTally.ordinalOneCount + (playerOrdinalChoice === 1 ? 1 : 0)
    };
  }, { totalScore: 0, ordinalZeroCount: 0, ordinalOneCount: 0 });

  console.log(finalSummary.totalScore);
}

processGameScenario(require("fs").readFileSync("/dev/stdin", "utf8"));