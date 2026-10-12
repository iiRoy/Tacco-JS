function ProcessInput(inputString) {
  // Split the input string into an array of lines based on newline characters.
  inputString = inputString.split("\n");

  // Parse the first line to get the total number of elements.
  const arrayLength = +inputString[0];

  // Parse the second line, split by spaces, and convert each part to a number.
  const initialNumbers = inputString[1].split(" ").map(val => +val);

  // Initialize an array to store prefix sums.
  // prefixSums[k] will store the sum of initialNumbers[0] through initialNumbers[k].
  const prefixSums = [];

  // Calculate prefix sums using the reduce method.
  // The final result of reduce (the total sum) is assigned to prefixSums[arrayLength - 1].
  prefixSums[arrayLength - 1] = initialNumbers.reduce((accumulator, currentElement, currentIndex) => {
    // For each element, store the cumulative sum up to the previous element in prefixSums.
    // Note: currentIndex starts from 1 for the second element in reduce without initialValue.
    prefixSums[currentIndex - 1] = accumulator;
    // Return the updated cumulative sum for the next iteration.
    return accumulator + currentElement;
  });

  // Initialize the minimum difference found so far with a very large number.
  let minDifference = 9000000000; // Equivalent to 9e9

  // Iterate through possible split points for the middle two partitions.
  // 'splitPointIdx' (original 'i') defines the boundary between the second and third partitions.
  // The loop runs from index 2 up to arrayLength - 2.
  for (let splitPointIdx = 2; splitPointIdx < arrayLength - 1; splitPointIdx++) {
    // Calculate target sums for the first and fourth partitions to guide binary search.
    // targetLeftSum is half of the sum of the first two partitions (up to splitPointIdx - 1).
    const targetLeftSum = prefixSums[splitPointIdx - 1] / 2;
    // targetRightSum is half of the sum of the last two partitions (from splitPointIdx to arrayLength - 1),
    // plus the sum of the first two partitions.
    const targetRightSum = (prefixSums[arrayLength - 1] + prefixSums[splitPointIdx - 1]) / 2;

    // Find the optimal split points for the first and fourth partitions using a binary search function.
    // 'leftPartitionIdx' (original 'l') splits the first two partitions.
    const leftPartitionIdx = findLowerBound(prefixSums, 1, splitPointIdx - 1, targetLeftSum);
    // 'rightPartitionIdx' (original 'r') splits the last two partitions.
    const rightPartitionIdx = findLowerBound(prefixSums, splitPointIdx + 1, arrayLength - 1, targetRightSum);

    // Calculate the sums of the four partitions based on the current split points.
    // P1 = prefixSums[leftPartitionIdx - 1]
    // P2 = prefixSums[splitPointIdx - 1] - prefixSums[leftPartitionIdx - 1]
    // P3 = prefixSums[rightPartitionIdx - 1] - prefixSums[splitPointIdx - 1]
    // P4 = prefixSums[arrayLength - 1] - prefixSums[rightPartitionIdx - 1]
    let currentPartitionSums = [
      prefixSums[leftPartitionIdx - 1],
      prefixSums[splitPointIdx - 1] - prefixSums[leftPartitionIdx - 1],
      prefixSums[rightPartitionIdx - 1] - prefixSums[splitPointIdx - 1],
      prefixSums[arrayLength - 1] - prefixSums[rightPartitionIdx - 1]
    ];

    // Update the minimum difference between the maximum and minimum partition sums.
    minDifference = Math.min(minDifference, Math.max(...currentPartitionSums) - Math.min(...currentPartitionSums));

    // Check an alternative split for the first two partitions by shifting 'leftPartitionIdx' one position to the right.
    // This is done if there's enough room for such a shift (i.e., leftPartitionIdx is not at its maximum possible value).
    if (splitPointIdx - leftPartitionIdx > 1) {
      currentPartitionSums = [
        prefixSums[leftPartitionIdx],
        prefixSums[splitPointIdx - 1] - prefixSums[leftPartitionIdx],
        prefixSums[rightPartitionIdx - 1] - prefixSums[splitPointIdx - 1],
        prefixSums[arrayLength - 1] - prefixSums[rightPartitionIdx - 1]
      ];
      minDifference = Math.min(minDifference, Math.max(...currentPartitionSums) - Math.min(...currentPartitionSums));

      // If the left split was adjusted, also check an alternative for the last two partitions
      // by shifting 'rightPartitionIdx' one position to the right.
      if (arrayLength - rightPartitionIdx > 1) {
        currentPartitionSums = [
          prefixSums[leftPartitionIdx],
          prefixSums[splitPointIdx - 1] - prefixSums[leftPartitionIdx],
          prefixSums[rightPartitionIdx] - prefixSums[splitPointIdx - 1],
          prefixSums[arrayLength - 1] - prefixSums[rightPartitionIdx]
        ];
        minDifference = Math.min(minDifference, Math.max(...currentPartitionSums) - Math.min(...currentPartitionSums));
      }
    }

    // Check an alternative split for the last two partitions by shifting 'rightPartitionIdx' one position to the right.
    // This check is independent of the 'if (splitPointIdx - leftPartitionIdx > 1)' block,
    // and uses the original 'leftPartitionIdx - 1' for the first partition.
    if (arrayLength - rightPartitionIdx > 1) {
      currentPartitionSums = [
        prefixSums[leftPartitionIdx - 1],
        prefixSums[splitPointIdx - 1] - prefixSums[leftPartitionIdx - 1],
        prefixSums[rightPartitionIdx] - prefixSums[splitPointIdx - 1],
        prefixSums[arrayLength - 1] - prefixSums[rightPartitionIdx]
      ];
      minDifference = Math.min(minDifference, Math.max(...currentPartitionSums) - Math.min(...currentPartitionSums));
    }
  }

  // Print the final calculated minimum difference to the console.
  console.log(minDifference);
}

// Binary search function to find the lower bound of a target value in a sorted array.
// It returns the index of the first element in 'dataArray' that is
// greater than or equal to 'targetValue' within the specified range [startIndex, endIndex).
function findLowerBound(dataArray, startIndex, endIndex, targetValue) {
  let midIndex;
  // Continue searching while the range contains more than one element.
  while (1 < endIndex - startIndex) {
    // Calculate the middle index. Using Math.floor ensures integer division.
    midIndex = Math.floor((startIndex + endIndex) / 2);
    // If the element at midIndex is less than the target,
    // the lower bound must be in the right half (excluding midIndex).
    if (dataArray[midIndex] < targetValue) {
      startIndex = midIndex;
    } else {
      // Otherwise, the lower bound is in the left half (including midIndex).
      endIndex = midIndex;
    }
  }
  // After the loop, startIndex and endIndex will be adjacent.
  // Check which of these two indices represents the lower bound.
  return dataArray[startIndex] < targetValue ? endIndex : startIndex;
}

// Read the entire content of standard input as a UTF-8 string
// and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
