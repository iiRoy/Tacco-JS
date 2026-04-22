'use strict'; /* Enforce strict parsing rules */

function ProcessData(rawData) {
  var LargeValue = Math.pow(2, 50); // A very large number for calculations
  const ModuloConstant = 998244353; // The modulus used for operations

  /* Pre-process the raw input string */
  rawData = rawData.trim().split(/\s+/).map(currentItem => currentItem - 0);

  var ItemCount = rawData.shift(); // Get the number of items from the beginning
  var TotalSum = rawData.reduce((accumulator, currentElement) => accumulator + currentElement); // Calculate the total sum of remaining items
  var TargetSumHalf = Math.floor(TotalSum / 2); // Determine half of the total sum

  var CoefficientSeries = [3]; // Initialize a series with a starting coefficient
  for (let outerIdx = 0; outerIdx < ItemCount - 1; outerIdx++) {
    CoefficientSeries.push(CoefficientSeries[outerIdx] * 2 % ModuloConstant); // Generate subsequent coefficients
  }

  var DynamicProgTable = []; // Declare the dynamic programming table
  // DynamicProgTable[first_idx_items][num_items_taken][current_total_value] stores the count of ways
  for (let outerIdx = 0; outerIdx <= ItemCount; outerIdx++) {
    DynamicProgTable[outerIdx] = [];
    for (let midIdx = 0; midIdx <= outerIdx; midIdx++) {
      DynamicProgTable[outerIdx][midIdx] = [];
      for (let innerIdx = 0; innerIdx <= TargetSumHalf; innerIdx++) {
        DynamicProgTable[outerIdx][midIdx][innerIdx] = 0; // Initialize all table entries to zero
      }
    }
  }
  DynamicProgTable[0][0][0] = 1; // Base case for the DP table

  /* Populate the dynamic programming table */
  for (let outerIdx = 0; outerIdx < ItemCount; outerIdx++) {
    for (let midIdx = 0; midIdx <= outerIdx; midIdx++) {
      for (let innerIdx = 0; innerIdx <= TargetSumHalf; innerIdx++) {
        DynamicProgTable[outerIdx + 1][midIdx][innerIdx] += DynamicProgTable[outerIdx][midIdx][innerIdx]; // Case: Don't include the current item
        DynamicProgTable[outerIdx + 1][midIdx][innerIdx] %= ModuloConstant;
      }
      for (let innerIdx = rawData[outerIdx]; innerIdx <= TargetSumHalf; innerIdx++) {
        DynamicProgTable[outerIdx + 1][midIdx + 1][innerIdx] += DynamicProgTable[outerIdx][midIdx][innerIdx - rawData[outerIdx]]; // Case: Include the current item
        DynamicProgTable[outerIdx + 1][midIdx + 1][innerIdx] %= ModuloConstant;
      }
    }
  }

  var FinalResult = 1; // Initialize the final answer variable

  /* Calculate initial result based on item count */
  for (let outerIdx = 0; outerIdx < ItemCount; outerIdx++) {
    FinalResult *= 3;
    FinalResult %= ModuloConstant;
  }

  /* Adjust the result using coefficients and DP table values */
  for (let outerIdx = 0; outerIdx < ItemCount; outerIdx++) {
    let CurrentCoefficient = CoefficientSeries[outerIdx];
    let SubtotalCount = DynamicProgTable[ItemCount][outerIdx].reduce(function(partialSum, elementValue, elementIndex) {
      if (elementIndex <= TargetSumHalf) {
        partialSum += elementValue;
        partialSum %= ModuloConstant;
      }
      return partialSum;
    }, 0) % ModuloConstant;

    let DivisorValue = Math.round(CurrentCoefficient * SubtotalCount / LargeValue) + 1;
    let QuotientPart = (CurrentCoefficient - CurrentCoefficient % DivisorValue) / DivisorValue;
    FinalResult -= ((QuotientPart * SubtotalCount % ModuloConstant) * DivisorValue + (CurrentCoefficient % DivisorValue) * SubtotalCount) % ModuloConstant;
  }

  FinalResult %= ModuloConstant;
  FinalResult += ModuloConstant; // Ensure positive result
  FinalResult %= ModuloConstant;

  /* Apply final adjustment if total sum is even */
  if (TotalSum % 2 === 0) {
    for (let midIdx = 0; midIdx <= ItemCount; midIdx++) {
      FinalResult += 3 * DynamicProgTable[ItemCount][midIdx][TargetSumHalf];
      FinalResult %= ModuloConstant;
    }
  }

  console.log(FinalResult); // Output the computed result
}

// Invoke the main processing function with data read from standard input
ProcessData(require('fs').readFileSync('/dev/stdin', 'utf8'));