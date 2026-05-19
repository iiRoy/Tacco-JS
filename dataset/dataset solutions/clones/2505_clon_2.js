function ProcessInput(rawData) {
  // Split the incoming raw data string into an array of individual lines.
  rawData = rawData.split("\n");

  // Check if the last line is empty and remove it if so,
  // which is common when reading input from certain environments.
  if (rawData[rawData.length - 1] === '') {
    rawData.pop();
  }

  // Extract the total count of elements from the first line of input.
  // The `- 0` converts the string to a number.
  const countElements = rawData[0].split(' ')[0] - 0;

  // Process the second line: split into numbers, convert to numeric type,
  // and then sort them in ascending order.
  const sortedNumbers = rawData[1].split(' ').map(item => {
    return item - 0; // Convert each string item to a number.
  }).sort((valA, valB) => {
    return valA - valB; // Sort numerically.
  });

  // Initialize variables for calculating frequency counts of consecutive numbers.
  let frequencyCounts = []; // This array will store the counts of each unique number sequence.
  let currentCount = 0;     // Tracks the count of the current sequence of identical numbers.
  let lastValue = 0;        // Stores the value of the last number processed.

  // Iterate through the sorted numbers to determine the frequency of each unique number.
  sortedNumbers.forEach(item => {
    if (item !== lastValue) {
      // If the current number is different from the previous one,
      // it means a new sequence has started. Store the count of the previous sequence.
      frequencyCounts.push(currentCount);
      lastValue = item; // Update the reference to the last processed value.
      currentCount = 1; // Start counting for the new sequence.
    } else {
      // If the current number is the same as the previous, increment its count.
      currentCount++;
    }
  });

  // After the loop, push the count of the very last sequence.
  frequencyCounts.push(currentCount);

  // Remove the first element from `frequencyCounts`. This element is typically `0`
  // due to the initial state of `currentCount` and `lastValue` before processing the first actual number.
  frequencyCounts.shift();

  // Sort the collected frequency counts in ascending order.
  frequencyCounts.sort((valA, valB) => {
    return valA - valB;
  });

  // console.debug(frequencyCounts); // This line is commented out, similar to the original.

  // Loop from 1 up to `countElements` (N). This outer loop represents different group sizes.
  let currentSum; // Variable to accumulate sums of frequencies in the inner loop.
  for (let outerIndex = 1; outerIndex <= countElements; outerIndex++) {
    currentSum = 0; // Reset the sum for each iteration of the outer loop.

    // Inner loop to calculate a partial sum of the smallest frequencies.
    // The number of frequencies summed depends on `outerIndex`.
    for (let innerIndex = 0; innerIndex < frequencyCounts.length - outerIndex + 1; innerIndex++) {
      currentSum += frequencyCounts[innerIndex];
    }

    // Calculate and output the minimum of two values:
    // 1. The maximum number of groups of size `outerIndex` that can be formed from `countElements`.
    // 2. The total number of elements that can be formed by taking `outerIndex` items from each of the `currentSum` smallest frequency groups.
    console.log(Math.min(Math.floor(countElements / outerIndex), currentSum * outerIndex));
  }
}


//*この行以降は編集しないでください（標準入出力から一度に読み込み、ProcessInputを呼び出します）
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
