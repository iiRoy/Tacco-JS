function processInputData(rawData) {
  const inputLines = rawData.split("\n");
  const elementCount = parseInt(inputLines[0]); // N from original, parsed but not used in logic

  let primaryValues = inputLines[1].split(" ").map(Number);
  let secondaryValues = inputLines[2].split(" ").map(Number);

  let totalCollectedAmount = 0;

  // Helper function to calculate the collected amount and update the next primary value
  const calculateBattleOutcome = (currentPrimaryDefender, nextPrimaryDefender, incomingSecondaryAttacker) => {
    let collectedThisTurn = 0;
    let remainingNextPrimary = nextPrimaryDefender;

    // First, try to defeat the attacker with the current primary defender
    const takenFromCurrentDefender = Math.min(incomingSecondaryAttacker, currentPrimaryDefender);
    collectedThisTurn += takenFromCurrentDefender;
    const remainingAttackerStrength = incomingSecondaryAttacker - takenFromCurrentDefender;

    // If attacker still has strength, use the next primary defender
    if (remainingAttackerStrength > 0) {
      const takenFromNextDefender = Math.min(remainingAttackerStrength, nextPrimaryDefender);
      collectedThisTurn += takenFromNextDefender;
      remainingNextPrimary -= takenFromNextDefender;
    }
    
    return { collected: collectedThisTurn, updatedNext: remainingNextPrimary };
  };

  for (let currentIdx = 0; currentIdx < secondaryValues.length; currentIdx++) {
    const currentPrimary = primaryValues[currentIdx];
    const nextPrimary = primaryValues[currentIdx + 1];
    const currentSecondary = secondaryValues[currentIdx];

    const battleResult = calculateBattleOutcome(currentPrimary, nextPrimary, currentSecondary);
    
    totalCollectedAmount += battleResult.collected;
    primaryValues[currentIdx + 1] = battleResult.updatedNext;
  }

  console.log(totalCollectedAmount);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
