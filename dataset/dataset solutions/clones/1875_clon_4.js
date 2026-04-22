const parseScenarioConfiguration = (rawText) => {
  const dataLines = rawText.trim().split('\n');
  const [offeringCountStr, skillCategoryCountStr, minimumCompetenceStr] = dataLines[0].split(' ');
  const offeringCount = Number(offeringCountStr);
  const skillCategoryCount = Number(skillCategoryCountStr);
  const minimumCompetence = Number(minimumCompetenceStr);

  const allOfferings = dataLines.slice(1, 1 + offeringCount).map(line => line.split(' ').map(Number));

  return { offeringCount, skillCategoryCount, minimumCompetence, allOfferings };
};

const compileProgress = (selectedOfferings) => {
  if (!Array.isArray(selectedOfferings) || selectedOfferings.length === 0) {
    return null;
  }

  // Initialize accumulator with an array of zeros matching the structure of an offering
  const initialAccumulator = selectedOfferings[0].map(() => 0);

  return selectedOfferings.reduce((totalStats, currentOffering) => {
    return totalStats.map((currentTotal, index) => currentTotal + currentOffering[index]);
  }, initialAccumulator);
};

const evaluateCompetence = (skillValues, requiredLevel) => {
  return skillValues.every(level => level >= requiredLevel);
};

const processLearningScenario = (scenarioData) => {
  const { offeringCount, skillCategoryCount, minimumCompetence, allOfferings } = parseScenarioConfiguration(scenarioData);

  // Generate all possible combinations of offering indices (power set)
  const offeringIndices = Array.from({ length: offeringCount }, (_, i) => i);
  const allIndexCombinations = offeringIndices.reduce((accumulator, currentIdx) => {
    return accumulator.concat(accumulator.map(existingCombo => [...existingCombo, currentIdx]));
  }, [[]]); // Start with an empty combination

  const potentialCosts = allIndexCombinations
    .filter(combo => combo.length > 0) // Exclude the empty combination, as it has no cost/skills
    .map(combo => combo.map(idx => allOfferings[idx])) // Map indices to actual offering data
    .map(chosenOfferings => compileProgress(chosenOfferings)) // Aggregate costs and skills for the chosen offerings
    .filter(combinedStats => combinedStats !== null) // Filter out combinations that resulted in null (e.g., empty input to compileProgress)
    .filter(combinedStats => {
      const achievedSkillLevels = combinedStats.slice(1, 1 + skillCategoryCount); // Extract skill levels from aggregated stats
      return evaluateCompetence(achievedSkillLevels, minimumCompetence); // Check if all skills meet the minimum competence
    })
    .map(combinedStats => combinedStats[0]); // Extract only the total cost for valid combinations

  if (potentialCosts.length === 0) {
    return -1; // No combination met the requirements
  } else {
    return Math.min(...potentialCosts); // Return the minimum cost among valid combinations
  }
};

const executeScenario = (sourceInput) => {
  console.log(processLearningScenario(sourceInput));
};

executeScenario(require("fs").readFileSync("/dev/stdin", "utf8"));