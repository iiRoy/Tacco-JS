"use strict";

const processInput = (inputString) => {
  const EAST_CHAR = "E";
  const WEST_CHAR = "W";

  const lines = inputString.trim().split("\n");
  const sequenceLength = parseInt(lines[0].split(" ")[0]);
  const charSequence = lines[1].split("");

  let totalEastCount = 0;
  for (let k = 0; k < sequenceLength; k++) {
    if (charSequence[k] === EAST_CHAR) {
      totalEastCount++;
    }
  }
  const totalWestCount = sequenceLength - totalEastCount; // This variable is not used in the original logic, but kept for consistency with initial analysis.

  let eastCountPrefix = 0; // Represents Rcnt in original
  let westCountPrefix = 0; // Represents Lcnt in original

  let minTurnsRequired = Infinity;

  // Helper function to calculate the cost for a given split point
  const calculateCurrentSplitCost = (
    currentWestPrefixCount,
    totalEastCharacters,
    currentEastPrefixCount,
    currentCharAtSplit
  ) => {
    // This corresponds to 'needMoveLeft' in the original code
    const costFromWestSide = currentWestPrefixCount;

    // This corresponds to 'needMoveRight' in the original code, before adjustment
    let costFromEastSide = totalEastCharacters - currentEastPrefixCount;

    // Adjustment for the current character if it's an 'E'
    if (currentCharAtSplit === EAST_CHAR) {
      costFromEastSide--;
    }
    return costFromWestSide + costFromEastSide;
  };

  for (let currentIndex = 0; currentIndex < sequenceLength; currentIndex++) {
    const currentCharacter = charSequence[currentIndex];

    const currentCost = calculateCurrentSplitCost(
      westCountPrefix,
      totalEastCount,
      eastCountPrefix,
      currentCharacter
    );

    minTurnsRequired = Math.min(minTurnsRequired, currentCost);

    if (currentCharacter === WEST_CHAR) {
      westCountPrefix++;
    } else {
      eastCountPrefix++;
    }
  }

  console.log(minTurnsRequired);
};

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
