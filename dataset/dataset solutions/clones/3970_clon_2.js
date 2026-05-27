// This module defines a function to process structured input data.
function ProcessInput(rawData) {
  // Divide the incoming string into individual lines.
  rawData = rawData.split("\n");

  // Extract the total count of items from the first line.
  let itemCount = parseInt(rawData[0]);

  // Initialize two distinct arrays to hold numerical data pairs.
  let firstDataSet = new Array(itemCount);
  let secondDataSet = new Array(itemCount);

  // Populate the 'firstDataSet' from the lines following the item count.
  // Each line is split by space, and its components are converted to integers.
  for (let currentIdx = 0; currentIdx < itemCount; currentIdx++) {
    firstDataSet[currentIdx] = rawData[currentIdx + 1]
      .split(" ")
      .map((element) => parseInt(element));
  }

  // Populate the 'secondDataSet' from the lines after the 'firstDataSet' entries.
  for (let currentIdx = 0; currentIdx < itemCount; currentIdx++) {
    secondDataSet[currentIdx] = rawData[currentIdx + itemCount + 1]
      .split(" ")
      .map((element) => parseInt(element));
  }

  // Sort 'firstDataSet'. The primary sort key is the first element (ascending),
  // and the secondary sort key is the second element (ascending).
  firstDataSet = firstDataSet.sort((valA, valB) => valA[1] - valB[1]);
  firstDataSet = firstDataSet.sort((valA, valB) => valA[0] - valB[0]);

  // Sort 'secondDataSet'. The primary sort key is the first element (ascending),
  // and the secondary sort key is the second element (descending).
  secondDataSet = secondDataSet.sort((valA, valB) => valB[1] - valA[1]);
  secondDataSet = secondDataSet.sort((valA, valB) => valA[0] - valB[0]);

  // Initialize a variable to store the final tally.
  let matchedPairsCount = 0;

  // Iterate through 'firstDataSet' starting from the last element.
  for (let outerIdx = itemCount - 1; outerIdx >= 0; outerIdx--) {
    // For each element in 'firstDataSet', iterate through 'secondDataSet' in reverse.
    for (
      let innerIdx = secondDataSet.length - 1;
      innerIdx >= 0;
      innerIdx--
    ) {
      // Check if both components of the current 'firstDataSet' element
      // are strictly less than the corresponding components of the 'secondDataSet' element.
      if (
        firstDataSet[outerIdx][0] < secondDataSet[innerIdx][0] &&
        firstDataSet[outerIdx][1] < secondDataSet[innerIdx][1]
      ) {
        // If the condition is satisfied, increment the counter.
        matchedPairsCount++;
        // Remove the matched element from 'secondDataSet' to ensure it's used only once.
        secondDataSet.splice(innerIdx, 1);
        // Exit the inner loop as a match has been found for the current 'firstDataSet' element.
        break;
      }
    }
  }

  // Print the total number of matched pairs to the console.
  console.log(matchedPairsCount);
}

// Read the entire content from standard input,
// decode it as UTF-8, remove leading/trailing whitespace,
// and then pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());
