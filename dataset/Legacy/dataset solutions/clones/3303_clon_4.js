function processInputData(rawText) {
  const dataLines = rawText.split("\n");
  const firstLineElements = dataLines[0].split(" ");
  const totalItems = Number.parseInt(firstLineElements[0], 10);
  const maxWeightCapacity = Number.parseInt(firstLineElements[1], 10);

  const itemCollection = [];
  for (let idx = 0; idx < totalItems; idx++) {
    const itemLineElements = dataLines[idx + 1].split(" ");
    itemCollection.push(itemLineElements.map(str => parseInt(str, 10)));
  }
  return { totalItems, maxWeightCapacity, itemCollection };
}

function determineOptimalValue(totalItems, maxWeightCapacity, itemCollection) {
  // Sort items by their value in descending order
  itemCollection.sort((itemA, itemB) => itemB[1] - itemA[1]);

  let windowStart = 0;
  let currentWindowWeight = 0;
  let currentWindowValue = 0;
  let highestValueFound = 0;

  // Iterate through items, expanding the window from the right
  for (let windowEnd = 0; windowEnd < totalItems; windowEnd++) {
    // Add the current item to the window
    currentWindowWeight += itemCollection[windowEnd][0];
    currentWindowValue += itemCollection[windowEnd][1];

    // If the window's total weight exceeds capacity, shrink it from the left
    while (currentWindowWeight > maxWeightCapacity && windowStart <= windowEnd) {
      currentWindowWeight -= itemCollection[windowStart][0];
      currentWindowValue -= itemCollection[windowStart][1];
      windowStart++;
    }

    // After adjusting the window, update the highest value
    highestValueFound = Math.max(highestValueFound, currentWindowValue);
  }

  return highestValueFound;
}

function executeProgram(inputContent) {
  const { totalItems, maxWeightCapacity, itemCollection } = processInputData(inputContent);
  const finalResult = determineOptimalValue(totalItems, maxWeightCapacity, itemCollection);
  console.log(finalResult);
}

executeProgram(require("fs").readFileSync("/dev/stdin", "utf8"));
