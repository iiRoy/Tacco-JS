function processInputData(rawData) {
  const lines = rawData.split('\n');
  const arraySize = Number(lines[0]);
  let elementStrings = lines[1].split(' ');

  // This line in the original code creates a new array of numbers but does not reassign it.
  // 'elementStrings' therefore remains an array of strings. This behavior is preserved.
  elementStrings.map(e => Number(e));

  // Helper function to determine the count of elements identical to the first element
  function checkHomogeneity(targetList) {
    if (targetList.length === 0) {
      return 0;
    }
    const firstElementValue = targetList[0];
    let matchCount = 0;
    for (let i = 0; i < targetList.length; i++) {
      if (firstElementValue === targetList[i]) {
        matchCount++;
      }
    }
    return matchCount;
  }

  // Perform initial homogeneity check
  const homogeneityCount = checkHomogeneity(elementStrings);
  const halfLength = parseInt(elementStrings.length / 2, 10);

  if (homogeneityCount === elementStrings.length) {
    console.log("%d", halfLength);
    return;
  }

  // Introduce a boolean flag for the second conditional check
  const isSingleMatchAndSufficientLength = (homogeneityCount === 1 && elementStrings.length >= 4);
  if (isSingleMatchAndSufficientLength) {
    console.log("%d", halfLength);
    return;
  }

  // Helper function to increment a count in a Map, creating the entry if it doesn't exist
  const incrementMapEntry = (targetMap, keyToUpdate) => {
    targetMap.set(keyToUpdate, (targetMap.get(keyToUpdate) || 0) + 1);
  };

  let evenIndexCounts = new Map(); // Stores frequencies for elements at even indices
  let oddIndexCounts = new Map();  // Stores frequencies for elements at odd indices

  for (let currentIndex = 0; currentIndex < elementStrings.length; currentIndex++) {
    const currentElement = elementStrings[currentIndex];
    if (currentIndex % 2 === 0) {
      incrementMapEntry(evenIndexCounts, currentElement);
    } else {
      incrementMapEntry(oddIndexCounts, currentElement);
    }
  }

  // Helper function to calculate the minimum removals needed to make all but one element uniform
  function calculateRemovalCost(frequencyMap) {
    const countValues = Array.from(frequencyMap.values());
    let costAccumulator = 0;

    if (countValues.length > 1) {
      countValues.sort((a, b) => b - a); // Sort counts in descending order
      // Sum all counts except the largest one
      for (let j = 1; j < countValues.length; j++) {
        costAccumulator += countValues[j];
      }
    }
    // If countValues.length is 0 or 1, costAccumulator remains 0, which is correct.
    return costAccumulator;
  }

  const costForEvenIndices = calculateRemovalCost(evenIndexCounts);
  let totalRemovalCost = costForEvenIndices;
  totalRemovalCost += calculateRemovalCost(oddIndexCounts);

  console.log("%d", totalRemovalCost);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
