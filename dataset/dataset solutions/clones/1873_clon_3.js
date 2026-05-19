function solveBookProblem(rawData) {
  const lines = rawData.split("\n");

  const firstLineParts = lines[0].split(' ').map(Number);
  const numBooks = firstLineParts[0];
  const numSkills = firstLineParts[1];
  const requiredSkillLevel = firstLineParts[2];

  const bookCosts = [];
  const bookSkillContributions = [];

  for (let lineIndex = 1; lineIndex < lines.length; lineIndex++) {
    const currentLineValues = lines[lineIndex].split(' ').map(Number);
    bookCosts.push(currentLineValues[0]);
    bookSkillContributions.push(currentLineValues.slice(1));
  }

  const selectedBooks = new Array(numBooks).fill(false);
  let minimumCost = Infinity;

  // Helper function to advance to the next combination of selected books
  const advanceCombination = (selectionArray) => {
    const numItems = selectionArray.length;
    for (let i = 0; i < numItems; i++) {
      if (selectionArray[i]) {
        selectionArray[i] = false;
      } else {
        selectionArray[i] = true;
        return true; // Successfully advanced to next combination
      }
    }
    return false; // All combinations exhausted (all false again)
  };

  // Helper function to check if all skill requirements are met
  const verifySkillRequirements = (selection, skillData, targetLevel, totalSkills) => {
    for (let skillIdx = 0; skillIdx < totalSkills; skillIdx++) {
      let currentSkillSum = 0;
      for (let bookIdx = 0; bookIdx < selection.length; bookIdx++) {
        if (selection[bookIdx]) {
          currentSkillSum += skillData[bookIdx][skillIdx];
        }
      }
      if (currentSkillSum < targetLevel) {
        return false; // This skill requirement is not met
      }
    }
    return true; // All skill requirements are met
  };

  // Helper function to calculate the total cost for the current selection
  const calculateSelectionCost = (selection, costsArray) => {
    let currentTotalCost = 0;
    for (let bookIdx = 0; bookIdx < selection.length; bookIdx++) {
      if (selection[bookIdx]) {
        currentTotalCost += costsArray[bookIdx];
      }
    }
    return currentTotalCost;
  };

  do {
    if (!verifySkillRequirements(selectedBooks, bookSkillContributions, requiredSkillLevel, numSkills)) {
      continue; // Skip to the next combination if skills are not met
    }

    const currentCombinationCost = calculateSelectionCost(selectedBooks, bookCosts);

    if (currentCombinationCost < minimumCost) {
      minimumCost = currentCombinationCost;
    }
  } while (advanceCombination(selectedBooks));

  console.log(minimumCost === Infinity ? -1 : minimumCost);
}

solveBookProblem(require("fs").readFileSync("/dev/stdin", "utf8"));
