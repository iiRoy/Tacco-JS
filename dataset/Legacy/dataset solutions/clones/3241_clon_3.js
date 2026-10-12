function ProcessInput(rawData) {
  const lines = rawData.split("\n");
  const itemCount = parseInt(lines[0]);

  const parseItemLine = (lineString, originalIndex) => {
    const parts = lineString.split(" ");
    return [parseInt(parts[0]), parseInt(parts[1]), originalIndex];
  };

  const allItems = [];
  for (let idx = 0; idx < itemCount; idx++) {
    allItems.push(parseItemLine(lines[idx + 1], idx));
  }

  const itemsSortedByA = [...allItems].sort(compareItemsByA);
  const itemsSortedByB = [...allItems].sort(compareItemsByB);

  let turnIndicator = 0;
  let scoreA = 0;
  let scoreB = 0;

  const processedItemIndices = [];

  const getNextAvailableItem = (sortedList, currentProcessedIndices) => {
    while (sortedList.length > 0) {
      const candidateItem = sortedList[0];
      if (currentProcessedIndices.includes(candidateItem[2])) {
        sortedList.shift();
      } else {
        return sortedList.shift();
      }
    }
    return null;
  };

  for (let currentRound = 0; currentRound < itemCount; currentRound++) {
    let selectedItem;
    if (turnIndicator === 0) {
      selectedItem = getNextAvailableItem(itemsSortedByA, processedItemIndices);
      if (selectedItem === null) {
        break;
      }
      scoreA += selectedItem[0];
      processedItemIndices.push(selectedItem[2]);
      turnIndicator = 1;
    } else {
      selectedItem = getNextAvailableItem(itemsSortedByB, processedItemIndices);
      if (selectedItem === null) {
        break;
      }
      scoreB += selectedItem[1];
      processedItemIndices.push(selectedItem[2]);
      turnIndicator = 0;
    }
  }

  const finalScoreDiff = scoreA - scoreB;

  console.log('%s', finalScoreDiff);
}

function runDebugMode() {
  const debugInput = document.getElementById("input").value;
  ProcessInput(debugInput);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));

function compareItemsByA(itemX, itemY) {
  if (itemX[0] < itemY[0]) return 1;
  if (itemX[0] > itemY[0]) return -1;
  if (itemX[1] < itemY[1]) return 1;
  if (itemX[1] > itemY[1]) return -1;
  return 0;
}

function compareItemsByB(itemX, itemY) {
  if (itemX[1] < itemY[1]) return 1;
  if (itemX[1] > itemY[1]) return -1;
  if (itemX[0] < itemY[0]) return 1;
  if (itemX[0] > itemY[0]) return -1;
  return 0;
}
