function processInputData(sourceContent) {
  // Parse the first set of numbers from the second line of input
  const firstDataSet = sourceContent.split('\n')[1].split(' ').map(function (strValue) {
    return parseInt(strValue, 10);
  });

  // Parse the second set of numbers from the third line of input
  const secondDataSet = sourceContent.split('\n')[2].split(' ').map(function (strValue) {
    return parseInt(strValue, 10);
  });

  // Parse the third set of numbers from the fourth line of input
  const thirdDataSet = sourceContent.split('\n')[3].split(' ').map(function (strValue) {
    return parseInt(strValue, 10);
  });

  // Calculate the number of elements in firstDataSet that are less than each element in secondDataSet
  const matchingCounts = secondDataSet.map(function (currentBValue) {
    return firstDataSet.filter(function (currentAValue) {
      return currentAValue < currentBValue;
    }).length;
  });

  // Output the intermediate array of counts
  console.log(matchingCounts);

  // Perform the final calculation based on thirdDataSet, secondDataSet, and matchingCounts
  const finalCalculatedSum = thirdDataSet.map(function (currentCValue) {
    // For each element in thirdDataSet, iterate through secondDataSet
    return secondDataSet.map(function (innerBValue, indexPosition) {
      // If innerBValue is less than currentCValue, use the corresponding count from matchingCounts
      // Otherwise, use 0
      return innerBValue < currentCValue ? matchingCounts[indexPosition] : 0;
    }).reduce(function (previousSum, addedValue) {
      // Sum up the values for the current currentCValue
      return previousSum + addedValue;
    });
  }).reduce(function (overallSum, subtotalValue) {
    // Sum up all the subtotals to get the final result
    return overallSum + subtotalValue;
  });

  // Output the final calculated sum
  console.log(finalCalculatedSum);
}

// Do not modify the following line (reads from standard input and invokes the main processing function)
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
