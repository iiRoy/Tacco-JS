function processInput(rawData) {
  // The first line of the input string contains the total number of items.
  const itemCount = rawData.split('\n')[0];

  // The second line contains space-separated weight values.
  // We split it by newline, then by space, and convert each part to an integer.
  const weights = rawData.split('\n')[1].split(' ').map((numStr) => parseInt(numStr, 10));

  // This array will store the absolute differences calculated for each possible split point.
  var diffsArray = [];

  // Iterate through all possible positions to split the array of weights.
  // 'splitPoint' represents the index where the second group begins.
  // It starts from 1 because a split at index 0 would mean the first group is empty.
  // It goes up to (but not including) itemCount, as a split at itemCount would mean the second group is empty.
  for (var splitPoint = 1; splitPoint < itemCount; splitPoint++) {
    // Initialize sums for the two groups for the current split configuration.
    var firstGroupSum = 0;
    var secondGroupSum = 0;

    // Calculate the sum of weights for the first group.
    // This group includes elements from the beginning up to 'splitPoint - 1'.
    for (var idx1 = 0; idx1 < splitPoint; idx1++) {
      firstGroupSum += weights[idx1];
    }

    // Calculate the sum of weights for the second group.
    // This group includes elements from 'splitPoint' up to the end of the array.
    for (var idx2 = splitPoint; idx2 < itemCount; idx2++) {
      secondGroupSum += weights[idx2];
    }

    // Compute the absolute difference between the sums of the two groups.
    // Add this difference to our collection array.
    diffsArray.push(Math.abs(firstGroupSum - secondGroupSum));
  }

  // After evaluating all possible splits, find the minimum absolute difference recorded.
  // Then, print this minimum value to the console.
  console.log(Math.min.apply(null, diffsArray));
}

// Read the entire content from standard input synchronously.
// The input is expected to be UTF-8 encoded.
// Then, pass this content to our main processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
