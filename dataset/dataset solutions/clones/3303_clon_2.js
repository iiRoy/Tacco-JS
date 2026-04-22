// Assessment 1: Sliding window approach with prefix sums
// Sort items by descending value
// Attempting a sliding window method using cumulative weights.
function ExecuteProcess(rawData)
{
  // Obtain input parameters
  rawData = rawData.split("\n");
  var lineData = rawData[0].split(" ");
  const itemCount = Number.parseInt(lineData[0]);
  const capacityLimit = Number.parseInt(lineData[1]);

  var itemCollection = [];

  for (let outerIndex = 0; outerIndex < itemCount; outerIndex++) {
    lineData = rawData[outerIndex + 1].split(" ");
    itemCollection.push(lineData.map(currentString => Number.parseInt(currentString)));
  }

  // Sort objects (descending order based on their second property, which is value)
  itemCollection.sort(function(firstItem, secondItem) {
    return (secondItem[1] - firstItem[1]);
  });

  // Display the sorted collection (for debugging)
  // console.log(itemCollection);

  var currentWeight = 0;
  var currentValue = 0;
  var maxAchievedValue = 0;

  // Sliding window algorithm (left bound is 'outerIndex', right bound is 'innerIndex')
  for (let outerIndex = 0; outerIndex < itemCount; outerIndex++) {
    // Debug: Add item's worth to current total
    // console.log("currentValue=", currentValue, "adding", itemCollection[outerIndex][1]);
    currentWeight += itemCollection[outerIndex][0];
    currentValue += itemCollection[outerIndex][1];

    let innerIndex = outerIndex + 1;
    while (innerIndex < itemCount) {
      if (currentWeight + itemCollection[innerIndex][0] <= capacityLimit) {
        // Include the next available item
        // Debug: Include worth of the right-side item
        // console.log("currentValue=", currentValue, "adding", itemCollection[innerIndex][1]);
        currentWeight += itemCollection[innerIndex][0];
        currentValue += itemCollection[innerIndex][1];
        innerIndex++;
      }
      else {
        break;
      }
    }

    maxAchievedValue = Math.max(currentValue, maxAchievedValue);

    // Debug: Remove worth of the left-side item
    // console.log("currentValue=", currentValue, "subtracting", itemCollection[outerIndex][1]);
    currentWeight -= itemCollection[outerIndex][0];
    currentValue -= itemCollection[outerIndex][1];
  }

  console.log(maxAchievedValue);
}

ExecuteProcess(require("fs").readFileSync("/dev/stdin", "utf8"));