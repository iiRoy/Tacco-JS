function Main(rawInput) {
  const charSequence = rawInput.trim().split("");

  const outcomeMatrix = {
    'g': { 'g': 0, 'p': -1 },
    'p': { 'g': 1, 'p': 0 }
  };

  const finalState = charSequence.reduce((accumulator, currentOpponentMove, currentIndex) => {
    let playerChoice;

    if (currentIndex === 0) {
      playerChoice = "g";
    } else {
      if (accumulator.rockPlays > accumulator.paperPlays) {
        playerChoice = "p";
      } else {
        playerChoice = "g";
      }
    }

    const roundOutcome = outcomeMatrix[playerChoice][currentOpponentMove];

    if (playerChoice === "g") {
      accumulator.rockPlays++;
    } else {
      accumulator.paperPlays++;
    }

    accumulator.totalScore += roundOutcome;

    return accumulator;
  }, { totalScore: 0, rockPlays: 0, paperPlays: 0 });

  console.log(finalState.totalScore);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
