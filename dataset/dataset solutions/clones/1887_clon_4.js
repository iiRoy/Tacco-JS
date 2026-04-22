const evaluateConcatenation = (rawInputContent) => {
  const segmentLines = rawInputContent.trim().split('\n');
  const pieceCount = parseInt(segmentLines.shift(), 10);

  const itemData = segmentLines.map(segmentText => {
    let segmentBalance = 0;
    for (const character of segmentText) {
      if (character === '(') segmentBalance++;
      else segmentBalance--;
    }
    return {
      frontSymbol: segmentText.charAt(0),
      rearSymbol: segmentText.charAt(segmentText.length - 1),
      netValue: segmentBalance
    };
  });

  const grandTotal = itemData.reduce((accumulator, item) => accumulator + item.netValue, 0);
  const hasOpeningSegment = itemData.some(item => item.frontSymbol === '(');
  const hasClosingSegment = itemData.some(item => item.rearSymbol === ')');

  if (grandTotal !== 0 || !hasOpeningSegment || !hasClosingSegment) {
    return 'No';
  }
  if (pieceCount === 1) {
    return 'Yes';
  }

  const completeSet = (1 << pieceCount) - 1;
  const resultCache = new Map(); // Key: `${mask}-${balance}`, Value: boolean

  const determineArrangement = (presentSelection, runningBalance) => {
    if (runningBalance < 0) {
      return false; // Invalid: balance went negative
    }

    const cacheKey = `${presentSelection}-${runningBalance}`;
    if (resultCache.has(cacheKey)) {
      return resultCache.get(cacheKey);
    }

    for (let currentItemIndex = 0; currentItemIndex < pieceCount; currentItemIndex++) {
      // Check if the current item is not yet included in the present selection
      if (!((presentSelection >> currentItemIndex) & 1)) {
        const futureSelection = presentSelection | (1 << currentItemIndex);
        const subsequentBalance = runningBalance + itemData[currentItemIndex].netValue;

        // If this addition completes the set of all items
        if (futureSelection === completeSet) {
          if (subsequentBalance === 0 && itemData[currentItemIndex].rearSymbol === ')') {
            resultCache.set(cacheKey, true);
            return true; // Found a valid arrangement
          }
        } else {
          // Continue recursively with the new selection and balance
          if (determineArrangement(futureSelection, subsequentBalance)) {
            resultCache.set(cacheKey, true);
            return true; // Found a valid arrangement through this path
          }
        }
      }
    }

    // No valid arrangement found from this state
    resultCache.set(cacheKey, false);
    return false;
  };

  // Initiate the search by trying each possible item as the first in the sequence
  for (let i = 0; i < pieceCount; i++) {
    // Optimization: Only consider items that start with '(' and have a non-negative balance as initial segments
    if (itemData[i].frontSymbol === '(' && itemData[i].netValue >= 0) {
      if (determineArrangement((1 << i), itemData[i].netValue)) {
        return 'Yes';
      }
    }
  }

  return 'No';
};

console.log(evaluateConcatenation(require('fs').readFileSync('/dev/stdin', 'utf8')));