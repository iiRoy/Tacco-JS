function solveChallenge(rawData) {
  const processedLines = rawData.split('\n').filter(Boolean);
  const initialParameters = processedLines[0].split(' ').map(Number);

  const entityQuantity = initialParameters[0];
  const primaryAttackDamage = initialParameters[1];
  const secondaryAttackDamage = initialParameters[2];

  const initialEntityHealths = processedLines.slice(1, entityQuantity + 1).map(Number);

  // Helper function to determine if a given number of rounds is sufficient
  const assessRoundSufficiency = (currentRounds, healths, primaryDmg, secondaryDmg) => {
    if (currentRounds < 0) return false;

    // Base case: If 0 rounds, all entities must already have non-positive health
    if (currentRounds === 0) {
      for (const entityHealth of healths) {
        if (entityHealth > 0) {
          return false;
        }
      }
      return true;
    }

    let accumulatedBonusStrikesRequired = 0;
    const differentialDamage = primaryDmg - secondaryDmg;

    // Case 1: Primary attack is not strictly more powerful than secondary (or equal)
    if (differentialDamage <= 0) {
      for (const entityHealth of healths) {
        // If any entity's health is still positive after being hit only by secondary damage
        // and primary damage offers no additional benefit (or is a penalty),
        // then these rounds are insufficient.
        if (entityHealth - secondaryDmg * currentRounds > 0) {
          return false;
        }
      }
      // All entities defeated by secondary damage alone (or with less primary damage).
      return true;
    }

    // Case 2: Primary attack is strictly more powerful (differentialDamage > 0)
    for (const entityHealth of healths) {
      const remainingHealthAfterSecondary = entityHealth - secondaryDmg * currentRounds;
      if (remainingHealthAfterSecondary > 0) {
        // Calculate how many additional 'differentialDamage' hits are needed for this entity
        accumulatedBonusStrikesRequired += Math.ceil(remainingHealthAfterSecondary / differentialDamage);
      }
    }
    // Check if the total required bonus strikes can be accommodated within the currentRounds
    return accumulatedBonusStrikesRequired <= currentRounds;
  };

  // Binary search to find the minimum number of rounds
  let lowerBound = 0;
  let upperBound = 2_000_000_000; // A sufficiently large upper limit for rounds
  let minimalRounds = upperBound;

  while (lowerBound <= upperBound) {
    const middleRounds = Math.floor((lowerBound + upperBound) / 2);
    if (assessRoundSufficiency(middleRounds, initialEntityHealths, primaryAttackDamage, secondaryAttackDamage)) {
      minimalRounds = middleRounds;
      upperBound = middleRounds - 1; // Try to find an even smaller number of rounds
    } else {
      lowerBound = middleRounds + 1; // Need more rounds
    }
  }

  console.log(minimalRounds);
}

solveChallenge(require("fs").readFileSync("/dev/stdin", "utf8"));