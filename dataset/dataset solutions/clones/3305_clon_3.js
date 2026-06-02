function processInput(rawData) {
  const parseNumbers = (str) => str.split(' ').map(val => parseInt(val, 10));

  const inputLines = rawData.split('\n');
  const configParams = parseNumbers(inputLines.shift());
  const numItems = configParams[0];
  const maxWeightCapacity = configParams[1];

  const itemDetailsList = inputLines.map(line => parseNumbers(line));

  const initialItemEntry = itemDetailsList.shift();
  const initialItemWeight = initialItemEntry[0];
  const initialItemValue = initialItemEntry[1];

  let currentMaxPossibleValue = initialItemValue;
  
  // Using a Map to handle sparse DP table and replicate 'undefined' behavior
  // for non-existent values, which is crucial for NaN propagation.
  const minWeightRequiredForValue = new Map();
  minWeightRequiredForValue.set(0, 0); // 0 value requires 0 weight

  // Initialize DP table with the first item's contribution
  // Original logic: any value from 1 to initialItemValue can be achieved with initialItemWeight
  for (let valIdx = 1; valIdx <= initialItemValue; valIdx++) {
    minWeightRequiredForValue.set(valIdx, initialItemWeight);
  }

  // Iterate through the remaining items
  for (let itemIndex = 0; itemIndex < itemDetailsList.length; itemIndex++) {
    const currentItemDetails = itemDetailsList[itemIndex];
    const currentItemWeight = currentItemDetails[0];
    const currentItemValue = currentItemDetails[1];

    // Update the maximum possible value that can be achieved
    currentMaxPossibleValue += currentItemValue;

    // Iterate backwards through possible values to update DP table
    for (let targetValue = currentMaxPossibleValue; targetValue > 0; targetValue--) {
      const existingMinWeight = minWeightRequiredForValue.get(targetValue);
      
      if (targetValue >= currentItemValue) {
        // Option 1: Achieve targetValue by taking current item and
        // achieving (targetValue - currentItemValue) with previous items.
        const weightForPreviousValue = minWeightRequiredForValue.get(targetValue - currentItemValue);
        
        // Calculate candidate weight. If weightForPreviousValue is undefined, result will be NaN.
        const candidateWeightFromPrev = currentItemWeight + weightForPreviousValue;

        if (existingMinWeight === undefined) {
          // If targetValue was not achievable before, set it to the new candidate
          minWeightRequiredForValue.set(targetValue, candidateWeightFromPrev);
        } else {
          // If targetValue was already achievable, take the minimum
          minWeightRequiredForValue.set(targetValue, Math.min(candidateWeightFromPrev, existingMinWeight));
        }
      } else {
        // Option 2: If targetValue is less than currentItemValue,
        // the original logic allows achieving targetValue by just taking the current item
        // and paying its full weight.
        if (existingMinWeight === undefined) {
          // If targetValue was not achievable before, set it to current item's weight
          minWeightRequiredForValue.set(targetValue, currentItemWeight);
        } else {
          // If targetValue was already achievable, take the minimum
          minWeightRequiredForValue.set(targetValue, Math.min(currentItemWeight, existingMinWeight));
        }
      }
    }
  }

  let maxValueAchieved = 0;

  // Find the maximum value whose minimum required weight does not exceed maxWeightCapacity
  for (let finalValueIndex = currentMaxPossibleValue; finalValueIndex >= 0; finalValueIndex--) {
    const weightForCurrentValue = minWeightRequiredForValue.get(finalValueIndex);
    
    // Check if the weight is a valid number (not undefined or NaN) and within capacity
    if (weightForCurrentValue !== undefined && !isNaN(weightForCurrentValue) && weightForCurrentValue <= maxWeightCapacity) {
      maxValueAchieved = finalValueIndex;
      break;
    }
  }

  // Output the result, preserving the original's `+0` for type consistency (though not strictly necessary)
  console.log(maxValueAchieved + 0);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
