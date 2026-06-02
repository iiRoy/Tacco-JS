const processInput = (rawData) => {
  const GOO_CHAR = "g";
  const PAA_CHAR = "p";

  const charSequence = rawData.trim().split("");
  const sequenceLength = charSequence.length;

  const determineRoundScore = (playerChoice, opponentChoice) => {
    if (playerChoice === opponentChoice) {
      return 0;
    }
    if (playerChoice === GOO_CHAR && opponentChoice === PAA_CHAR) {
      return -1;
    }
    if (playerChoice === PAA_CHAR && opponentChoice === GOO_CHAR) {
      return 1;
    }
    return undefined;
  };

  let totalScore = 0;
  let playerGCount = 0;
  let playerPCount = 0;

  for (let idx = 0; idx < sequenceLength; idx++) {
    const currentOpponentChar = charSequence[idx];
    let currentPlayerMove;

    if (idx === 0) {
      currentPlayerMove = GOO_CHAR;
      playerGCount++;
    } else {
      const isPlayerGCountGreater = playerGCount > playerPCount;
      const isOpponentGorP = currentOpponentChar === GOO_CHAR || currentOpponentChar === PAA_CHAR;

      if (isPlayerGCountGreater && isOpponentGorP) {
        currentPlayerMove = PAA_CHAR;
        playerPCount++;
      } else {
        currentPlayerMove = GOO_CHAR;
        playerGCount++;
      }
    }
    
    totalScore += determineRoundScore(currentPlayerMove, currentOpponentChar);
  }

  console.log(totalScore);
};

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
