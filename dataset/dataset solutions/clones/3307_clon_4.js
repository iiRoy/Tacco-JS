function processPayload(payloadStr) {
  const lineData = payloadStr.split("\n");

  const parseNumeric = (str) => {
    return parseInt(str, 10);
  };

  const [itemCount, capacityLimit] = lineData[0].split(' ').map(parseNumeric);
  
  const articles = [];
  let totalValueCeiling = 0; 
  
  for (let idx = 0; idx < itemCount; idx++) {
    const [weight, value] = lineData[idx + 1].split(' ').map(parseNumeric);
    articles.push([weight, value]);
    totalValueCeiling += value;
  }
 
  console.log(determineOptimalValue(itemCount, capacityLimit, articles, totalValueCeiling));
}

function determineOptimalValue(itemQuantity, maximumCapacity, itemCollection, valueSumMax) {
  // minimumWeightForValue[v] stores the minimum total weight required to achieve a total value of 'v'.
  // Initialize with a large number (effectively infinity) for all values > 0.
  const minimumWeightForValue = Array(valueSumMax + 1).fill(Number.MAX_SAFE_INTEGER);
  minimumWeightForValue[0] = 0; // It takes 0 weight to achieve a value of 0.

  // Iterate through each item available
  for (const currentArticle of itemCollection) {
    const currentWeight = currentArticle[0];
    const currentVal = currentArticle[1];

    // Iterate backwards through possible total values.
    // This ensures that for each item, its contribution to a sum_val
    // is based on the state *before* this item was considered for current_sum_val - current_val.
    for (let currentSumVal = valueSumMax; currentSumVal >= currentVal; currentSumVal--) {
      const weightWithoutCurrent = minimumWeightForValue[currentSumVal];
      const weightWithCurrentCandidate = minimumWeightForValue[currentSumVal - currentVal];

      // If the (currentSumVal - currentVal) state is reachable,
      // consider using the current item to reach currentSumVal.
      if (weightWithCurrentCandidate !== Number.MAX_SAFE_INTEGER) {
        minimumWeightForValue[currentSumVal] = Math.min(
          weightWithoutCurrent,
          weightWithCurrentCandidate + currentWeight
        );
      }
    }
  }

  let finalMaxAchievedValue = 0;
  // After processing all items, find the highest value 'v'
  // for which the minimum required weight (minimumWeightForValue[v])
  // does not exceed the maximumCapacity.
  for (let valIndex = valueSumMax; valIndex >= 0; valIndex--) {
    if (minimumWeightForValue[valIndex] <= maximumCapacity) {
      finalMaxAchievedValue = valIndex;
      break; // Since we are iterating downwards, the first match is the maximum possible value.
    }
  }

  return finalMaxAchievedValue;
}

processPayload(require("fs").readFileSync("/dev/stdin", "utf8"));