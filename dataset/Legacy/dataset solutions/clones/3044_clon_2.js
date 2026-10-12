'use strict'

function ProcessData(rawData) {
  // A large power of 2, used in calculations later.
  var LargePower = Math.pow(2, 50);
  // The modulus value for all arithmetic operations.
  const ModulusValue = 998244353;

  // Pre-process the input string: trim, split by whitespace, and convert to numbers.
  var parsedNumbers = rawData.trim().split(/\s+/).map(item => item - 0);

  // The first number is the count of elements, the rest are the elements themselves.
  var ElementCount = parsedNumbers.shift();
  // Calculate the total sum of the remaining elements.
  var TotalSum = parsedNumbers.reduce((accumulator, currentValue) => accumulator + currentValue);
  // Determine the target half sum for dynamic programming.
  var HalfSum = Math.floor(TotalSum / 2);

  // Initialize a sequence of multipliers.
  var MultiplierSequence = [3];
  // Populate the multiplier sequence based on the ModulusValue.
  for (let idx = 0; idx < ElementCount - 1; idx++) {
    MultiplierSequence.push((MultiplierSequence[idx] * 2) % ModulusValue);
  }

  // Initialize a 3D array for dynamic programming.
  // DynamicProgressionTable[i][j][k] will store the number of ways to form sum 'k'
  // using 'j' elements from the first 'i' numbers.
  var DynamicProgressionTable = [];
  for (let idx = 0; idx <= ElementCount; idx++) {
    DynamicProgressionTable[idx] = [];
    for (let subIdx = 0; subIdx <= idx; subIdx++) {
      DynamicProgressionTable[idx][subIdx] = [];
      for (let valIdx = 0; valIdx <= HalfSum; valIdx++) {
        DynamicProgressionTable[idx][subIdx][valIdx] = 0;
      }
    }
  }

  // Base case for DP: 0 elements, 0 sum, 1 way (empty set).
  DynamicProgressionTable[0][0][0] = 1;

  // Fill the DP table.
  for (let idx = 0; idx < ElementCount; idx++) {
    for (let subIdx = 0; subIdx <= idx; subIdx++) {
      for (let valIdx = 0; valIdx <= HalfSum; valIdx++) {
        // Case 1: Do not include the current element parsedNumbers[idx].
        DynamicProgressionTable[idx + 1][subIdx][valIdx] += DynamicProgressionTable[idx][subIdx][valIdx];
        DynamicProgressionTable[idx + 1][subIdx][valIdx] %= ModulusValue;
      }
      // Case 2: Include the current element parsedNumbers[idx].
      // Iterate from the current element's value up to HalfSum.
      for (let valIdx = parsedNumbers[idx]; valIdx <= HalfSum; valIdx++) {
        DynamicProgressionTable[idx + 1][subIdx + 1][valIdx] += DynamicProgressionTable[idx][subIdx][valIdx - parsedNumbers[idx]];
        DynamicProgressionTable[idx + 1][subIdx + 1][valIdx] %= ModulusValue;
      }
    }
  }

  // Initialize the final result.
  var FinalResult = 1;
  // Calculate 3^N modulo K.
  for (let idx = 0; idx < ElementCount; idx++) {
    FinalResult *= 3;
    FinalResult %= ModulusValue;
  }

  // Adjust the result based on the DP table and multiplier sequence.
  for (let idx = 0; idx < ElementCount; idx++) {
    let currentMultiplier = MultiplierSequence[idx];
    // Sum up the counts of subsets for the current number of elements (idx).
    let subsetSumCount = DynamicProgressionTable[ElementCount][idx].reduce(function(subAccumulator, subCurrent, subIndex) {
      if (subIndex <= HalfSum) {
        subAccumulator += subCurrent;
        subAccumulator %= ModulusValue;
      }
      return subAccumulator;
    }, 0) % ModulusValue;

    // Perform a specific calculation involving LargePower.
    let divisorVal = Math.round((currentMultiplier * subsetSumCount) / LargePower) + 1;
    let quotientVal = (currentMultiplier - (currentMultiplier % divisorVal)) / divisorVal;

    // Subtract the calculated term from the FinalResult.
    FinalResult -= ((quotientVal * subsetSumCount % ModulusValue) * divisorVal + (currentMultiplier % divisorVal) * subsetSumCount) % ModulusValue;
  }

  // Ensure FinalResult stays within the positive range of the modulus.
  FinalResult %= ModulusValue;
  FinalResult += ModulusValue;
  FinalResult %= ModulusValue;

  // If the total sum is even, add an additional term.
  if (TotalSum % 2 === 0) {
    for (let subIdx = 0; subIdx <= ElementCount; subIdx++) {
      FinalResult += 3 * DynamicProgressionTable[ElementCount][subIdx][HalfSum];
      FinalResult %= ModulusValue;
    }
  }

  // Output the final computed result.
  console.log(FinalResult);
}

// Read input from standard input and pass it to the main processing function.
ProcessData(require('fs').readFileSync('/dev/stdin', 'utf8'));
