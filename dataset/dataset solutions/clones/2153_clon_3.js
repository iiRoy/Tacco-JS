function processInputData(rawData) {
  const allInputLines = rawData.split("\n");
  allInputLines.shift();
  const dataItems = allInputLines;

  const itemFrequencyMap = new Map();
  for (const currentItem of dataItems) {
    itemFrequencyMap.set(currentItem, (itemFrequencyMap.get(currentItem) || 0) + 1);
  }

  const itemCountsContainer = {};
  for (const [key, value] of itemFrequencyMap.entries()) {
    itemCountsContainer[key] = value;
  }

  let uniqueSortedKeys = Object.keys(itemCountsContainer);

  uniqueSortedKeys.sort((keyA, keyB) => O[keyB] - O[keyA]);

  for (let i = 0; i < uniqueSortedKeys.length; i++) {
    const keyToOutput = uniqueSortedKeys[i];
    console.log(keyToOutput);
  }
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
