'use strict';

const processInput = rawData => {
  const sourceText = rawData.trim();
  const lines = sourceText.split('\n');
  const stringValues = lines[1].split(' ');
  const numericValues = stringValues.map(val => Number.parseInt(val, 10));

  const totalSum = numericValues.reduce((accumulator, current) => accumulator + current, 0);
  const targetHalf = totalSum / 2;

  // Generate an array of prefix sums
  // prefixSums[k] will store the sum of numericValues[0] through numericValues[k]
  const prefixSums = numericValues.reduce((accumulator, value, index) => {
    const previousSum = (index > 0) ? accumulator[index - 1] : 0;
    accumulator.push(previousSum + value);
    return accumulator;
  }, []);

  // Find the index in prefixSums where the sum first meets or exceeds targetHalf.
  // This 'splitPointIndexInPrefix' corresponds to the index 'k' such that prefixSums[k] is the first sum >= targetHalf.
  // If no such sum exists (i.e., all elements are too small), findIndex returns -1.
  const splitPointIndexInPrefix = prefixSums.findIndex(currentSum => currentSum >= targetHalf);

  let firstCandidateSum;
  let secondCandidateSum;

  if (splitPointIndexInPrefix === -1) {
    // This scenario corresponds to the original loop where 'half' never reaches 'mokuhyo'
    // and eventually becomes NaN due to adding 'undefined'.
    // The original 'i' would become numericValues.length + 1.
    // Both ans1 and ans2 would become NaN.
    firstCandidateSum = NaN;
    secondCandidateSum = NaN;
  } else {
    // 'firstCandidateSum' corresponds to original 'ans1' (sum up to original 'i-1')
    // which is sum(numericValues[0...splitPointIndexInPrefix])
    firstCandidateSum = prefixSums[splitPointIndexInPrefix];

    // 'secondCandidateSum' corresponds to original 'ans2' (sum up to original 'i')
    // which is sum(numericValues[0...splitPointIndexInPrefix+1])
    // If splitPointIndexInPrefix is the last index, then numericValues[splitPointIndexInPrefix + 1] is undefined.
    // The original code would add undefined, resulting in NaN.
    if (splitPointIndexInPrefix + 1 < prefixSums.length) {
      secondCandidateSum = prefixSums[splitPointIndexInPrefix + 1];
    } else {
      // If splitPointIndexInPrefix is the last element, the next element is undefined.
      // The sum up to this point (totalSum) plus undefined results in NaN.
      secondCandidateSum = NaN;
    }
  }

  let finalResultA = firstCandidateSum;
  let finalResultB = secondCandidateSum;

  // Adjust finalResultA based on original logic
  const isPerfectSplitA = (finalResultA === targetHalf && totalSum - finalResultA === targetHalf);
  finalResultA = isPerfectSplitA ? 0 : Math.abs(finalResultA - totalSum);

  // Adjust finalResultB based on original logic
  const isFullSumB = (finalResultB === totalSum);
  finalResultB = isFullSumB ? Infinity : Math.abs(finalResultB - totalSum);

  console.log(Math.min(finalResultA, finalResultB));
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
