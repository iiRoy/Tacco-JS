'use strict'

function determineMaxScore(documentContent) {
  const segments = documentContent.split('\n');
  const primaryCount = Number(segments[0]);

  const primaryItems = segments.slice(1, 1 + primaryCount);
  const secondaryItems = segments.slice(primaryCount + 2, -1);

  // Helper function to calculate item frequencies
  const calculateFrequencies = (itemArray) => {
    return itemArray.reduce((frequencyMap, currentItem) => {
      frequencyMap.set(currentItem, (frequencyMap.get(currentItem) || 0) + 1);
      return frequencyMap;
    }, new Map()); // Start with a new Map for each calculation
  };

  const primaryFrequencies = calculateFrequencies(primaryItems);
  const secondaryFrequencies = calculateFrequencies(secondaryItems);

  const combinedScores = new Map();

  // Populate combined scores with primary item frequencies
  for (const [identifier, frequency] of primaryFrequencies) {
    combinedScores.set(identifier, frequency);
  }

  // Adjust combined scores by subtracting secondary item frequencies
  for (const [identifier, frequency] of secondaryFrequencies) {
    combinedScores.set(identifier, (combinedScores.get(identifier) || 0) - frequency);
  }

  let finalMax = 0;

  // Find the maximum score among all combined scores, defaulting to 0 if all are negative
  for (const individualScore of combinedScores.values()) {
    finalMax = Math.max(finalMax, individualScore);
  }

  console.log(finalMax);
}

determineMaxScore(require("fs").readFileSync("/dev/stdin", "utf8"));