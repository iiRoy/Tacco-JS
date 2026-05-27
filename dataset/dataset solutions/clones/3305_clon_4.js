function main(programInput) {
  const inputLines = programInput.split('\n');
  const [numItems, maxWeight] = inputLines.shift().split(' ').map(Number);
  const itemData = inputLines.map(line => line.split(' ').map(Number));

  // Initialize DP state: A Map where keys are total values and values are minimum weights.
  // Value 0 requires 0 weight.
  let initialDpState = new Map([[0, 0]]);
  let currentMaxPossibleValue = 0;

  // Process the first item separately to establish the initial DP table and max value.
  // This step is crucial for replicating the original's specific initialization.
  const [firstItemWeight, firstItemValue] = itemData.shift();
  currentMaxPossibleValue = firstItemValue;
  for (let val = 1; val <= firstItemValue; val++) {
    initialDpState.set(val, firstItemWeight);
  }

  // Define a reducer function to process each subsequent item.
  // The accumulator will hold the current DP Map and the maximum possible value achieved so far.
  const processItemIntoNewState = (accumulator, currentItem) => {
    const { dp: previousDpMap, maxVal: previousMaxVal } = accumulator;
    const [itemWeight, itemValue] = currentItem;

    const nextMaxVal = previousMaxVal + itemValue;
    const nextDpMap = new Map(previousDpMap); // Create a new Map for the next state

    // Iterate values downwards to correctly update the DP table,
    // ensuring that each item is considered only once for a given value calculation.
    for (let val = nextMaxVal; val > 0; val--) {
      if (val >= itemValue) {
        // Case 1: Current item can contribute to achieving 'val'
        const weightForRemainingValue = previousDpMap.get(val - itemValue);
        const currentWeightForVal = previousDpMap.get(val);

        // Calculate the candidate weight if we take the current item.
        // If 'weightForRemainingValue' is undefined (meaning val - itemValue was unachievable),
        // 'candidateWeightIfTaken' will become NaN, replicating original JS behavior.
        const candidateWeightIfTaken = weightForRemainingValue + itemWeight;

        let newWeightForVal;
        if (currentWeightForVal === undefined) {
          // If 'val' was previously unachievable, set it to the candidate weight.
          newWeightForVal = candidateWeightIfTaken;
        } else {
          // If 'val' was achievable, take the minimum of the current weight and the candidate.
          // Math.min(NaN, number) correctly evaluates to NaN, replicating original behavior.
          newWeightForVal = Math.min(candidateWeightIfTaken, currentWeightForVal);
        }
        nextDpMap.set(val, newWeightForVal);

      } else {
        // Case 2: Current item's value is greater than 'val'.
        // This branch replicates the original code's non-standard behavior for this case.
        const currentWeightForVal = previousDpMap.get(val);
        if (currentWeightForVal === undefined) {
          // If 'val' was previously unachievable, set its weight to the current item's weight.
          // This is the problematic part of the original logic, but must be replicated.
          nextDpMap.set(val, itemWeight);
        } else {
          // If 'val' was achievable, take the minimum of its current weight and the current item's weight.
          // This also replicates the original's non-standard behavior.
          nextDpMap.set(val, Math.min(itemWeight, currentWeightForVal));
        }
      }
    }
    return { dp: nextDpMap, maxVal: nextMaxVal };
  };

  // Apply the reducer to all remaining items.
  const finalState = itemData.reduce(processItemIntoNewState, { dp: initialDpState, maxVal: currentMaxPossibleValue });

  const finalDpMap = finalState.dp;
  const finalMaxVal = finalState.maxVal;

  let finalResult = 0;
  // Iterate values downwards from the maximum possible value to find the largest value
  // that can be achieved within the given weight limit.
  for (let val = finalMaxVal; val >= 0; val--) {
    const achievedWeight = finalDpMap.get(val);
    // Check if 'achievedWeight' is a valid number (not undefined or NaN) and within the limit.
    if (typeof achievedWeight === 'number' && !isNaN(achievedWeight) && achievedWeight <= maxWeight) {
      finalResult = val;
      break; // Found the maximum value, exit loop.
    }
  }

  console.log(finalResult);
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
