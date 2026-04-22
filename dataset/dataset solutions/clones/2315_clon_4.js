function processScores(rawData) {
  const parameters = rawData[0].split(' ').map(Number);
  const totalItems = parameters[0]; 
  const maxIndividualBoost = parameters[1]; 
  const overallBoostAllowance = parameters[2]; 
  const desiredRank = parameters[3]; 

  const initialValues = rawData[1].split(' ').map(Number).sort((val1, val2) => val1 - val2);

  // Helper function to check if an item at a given index can achieve the desired rank.
  // This function is the core of the alternative strategy.
  const checkRankPossibility = (candidatePosition, valuesArray, countOverall, maxPerItem, totalAvailableVotes, targetPosition) => {
    // The maximum score the candidate item can achieve
    const candidatePotentialScore = valuesArray[candidatePosition] + maxPerItem;

    // One vote is implicitly for the candidate itself.
    // The remaining votes can be used for other items.
    const remainingVoteBudget = totalAvailableVotes - 1;

    // Count how many other items are already inherently superior or can easily become superior
    // without requiring specific vote allocation from 'remainingVoteBudget'.
    let naturallySuperiorCount = 0;
    for (let currentItemIdx = 0; currentItemIdx < countOverall; currentItemIdx++) {
      if (currentItemIdx === candidatePosition) continue; // Skip the candidate item itself

      // If an item's initial score is already greater than or equal to the candidate's potential score,
      // it is considered naturally superior.
      if (valuesArray[currentItemIdx] >= candidatePotentialScore) {
        naturallySuperiorCount++;
      }
    }

    // If there are already 'targetPosition' or more items that are naturally superior,
    // the candidate cannot achieve the desired rank.
    if (naturallySuperiorCount >= targetPosition) {
      return false;
    }

    // Calculate the votes required to "cap" other items.
    // These are items that are initially weaker than 'candidatePotentialScore'
    // but could potentially exceed it if they received 'maxPerItem' votes.
    // We assume an optimal strategy where votes are spent to bring these items
    // exactly up to 'candidatePotentialScore', preventing them from becoming strictly better.
    let votesToNeutralizeOthers = 0;
    for (let currentItemIdx = 0; currentItemIdx < countOverall; currentItemIdx++) {
      if (currentItemIdx === candidatePosition) continue; // Skip the candidate item

      // Only consider items that are not naturally superior
      if (valuesArray[currentItemIdx] < candidatePotentialScore) {
        // If an item, with its 'maxPerItem' boost, could reach or exceed
        // 'candidatePotentialScore', then we calculate the votes needed
        // to bring it exactly to 'candidatePotentialScore'.
        if (valuesArray[currentItemIdx] + maxPerItem >= candidatePotentialScore) {
          votesToNeutralizeOthers += (candidatePotentialScore - valuesArray[currentItemIdx]);
        }
      }
    }

    // If the votes required to neutralize these other items exceed the available vote budget,
    // then the candidate cannot achieve the desired rank.
    if (votesToNeutralizeOthers > remainingVoteBudget) {
      return false;
    }

    // If all checks pass, it's possible for the candidate to achieve the desired rank.
    return true;
  };

  let lowerBound = 0;
  let upperBound = totalItems - 1;
  let successfulIndex = totalItems - 1; // Default to the largest score (always possible)

  // Binary search to find the smallest index 'i' in 'initialValues'
  // for which 'checkRankPossibility(i)' returns true.
  while (lowerBound <= upperBound) {
    const middleIndex = Math.floor((lowerBound + upperBound) / 2);
    if (checkRankPossibility(middleIndex, initialValues, totalItems, maxIndividualBoost, overallBoostAllowance, desiredRank)) {
      successfulIndex = middleIndex; // This index is feasible; try for an even smaller index
      upperBound = middleIndex - 1;
    } else {
      lowerBound = middleIndex + 1; // This index is not feasible; need a larger index
    }
  }

  // The final answer is the count of items from 'successfulIndex' to the end of the array.
  const finalResultCount = totalItems - successfulIndex;

  console.log(finalResultCount);
}

// Standard input reading and execution
processScores(require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n"));