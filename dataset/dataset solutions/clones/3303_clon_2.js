function ProcessInput(rawData) {
  // This function processes raw input data to find the maximum value
  // using a sliding window (two-pointer) approach after sorting.

  // Parse the initial parameters from the first line
  let dataLines = rawData.split('\n');
  let firstLineParts = dataLines[0].split(' ');
  const itemCount = Number.parseInt(firstLineParts[0], 10);
  const capacityLimit = Number.parseInt(firstLineParts[1], 10);

  // Prepare an array to hold item weight and value pairs
  let itemData = [];
  for (let outerIndex = 0; outerIndex < itemCount; outerIndex++) {
    let currentLineParts = dataLines[outerIndex + 1].split(' ');
    itemData.push(currentLineParts.map(partString => parseInt(partString, 10)));
  }

  // Sort the items by value (second element) in descending order
  itemData.sort(function(itemA, itemB) {
    return (itemB[1] - itemA[1]);
  });

  // Initialize variables for the sliding window algorithm
  let currentWeight = 0;
  let currentValue = 0;
  let maximumValue = 0;

  // Implement the sliding window (two-pointer) technique
  // 'firstPointer' represents the left boundary of the window
  for (let firstPointer = 0; firstPointer < itemCount; firstPointer++) {
    // Add the item at the left boundary to the current window
    currentWeight += itemData[firstPointer][0];
    currentValue += itemData[firstPointer][1];

    // 'secondPointer' represents the right boundary of the window
    let secondPointer = firstPointer + 1;
    while (secondPointer < itemCount) {
      // Check if adding the next item exceeds the capacity limit
      if (currentWeight + itemData[secondPointer][0] <= capacityLimit) {
        // If not, add it to the window and advance the right pointer
        currentWeight += itemData[secondPointer][0];
        currentValue += itemData[secondPointer][1];
        secondPointer++;
      } else {
        // If it exceeds, stop expanding the window to the right
        break;
      }
    }

    // Update the overall maximum value found so far
    maximumValue = Math.max(currentValue, maximumValue);

    // Remove the item at the left boundary as the window slides
    currentWeight -= itemData[firstPointer][0];
    currentValue -= itemData[firstPointer][1];
  }

  // Output the final maximum value
  console.log(maximumValue);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
