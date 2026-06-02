process.stdin.resume();
process.stdin.setEncoding("utf8");
process.stdin.on("data", (rawData) => {
    const parsedData = parseInputData(rawData);
    const finalOutcome = calculateMinimumSum(parsedData[0], parsedData[1]);

    console.log(finalOutcome);
});

const parseInputData = (sourceText) => {
  const numericTokens = sourceText.match(/\d+/g).map(Number);

  // The first number is N (unused), the second is K.
  // The rest are the Pk values.
  const kValue = numericTokens[1];
  const pkValues = numericTokens.slice(2);

  return [kValue, pkValues];
};

const calculateMinimumSum = (limit, sourceValues) => {
  const topValues = []; // This array will store the 'limit' smallest values found so far

  for (const currentVal of sourceValues) {
    if (topValues.length < limit) {
      // If the topValues array is not yet full, insert the current value
      // while maintaining sorted order (ascending).
      let inserted = false;
      for (let i = 0; i < topValues.length; i++) {
        if (currentVal < topValues[i]) {
          topValues.splice(i, 0, currentVal);
          inserted = true;
          break;
        }
      }
      if (!inserted) {
        topValues.push(currentVal);
      }
    } else if (currentVal < topValues[limit - 1]) {
      // If the topValues array is full and the current value is smaller
      // than the largest value currently in topValues (which is at index limit-1).
      // Remove the largest value and insert the current value in its sorted position.
      topValues.pop(); // Remove the largest element
      let inserted = false;
      for (let i = 0; i < topValues.length; i++) {
        if (currentVal < topValues[i]) {
          topValues.splice(i, 0, currentVal);
          inserted = true;
          break;
        }
      }
      if (!inserted) {
        // This case should ideally not be reached if currentVal < topValues[limit - 1]
        // but as a fallback, push it.
        topValues.push(currentVal);
      }
    }
  }

  // Sum all elements in the topValues array.
  let finalSum = 0;
  for (let i = 0; i < topValues.length; i++) {
    finalSum += topValues[i];
  }
  return finalSum;
};
