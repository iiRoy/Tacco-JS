function processInputData(rawData) {
  const lines = rawData.split("\n");
  const itemCount = parseInt(lines[0]);

  const initialItems = [];
  for (let i = 0; i < itemCount; i++) {
    const lineParts = lines[i + 1].split(" ");
    initialItems.push({
      x: parseInt(lineParts[0]),
      y: parseInt(lineParts[1]),
      id: i
    });
  }

  const sortedByX = [...initialItems].sort(compareXDescYDesc);
  const sortedByY = [...initialItems].sort(compareYDescXDesc);

  let turnIndicator = 0; // 0 for player A (x-score), 1 for player B (y-score)
  let scoreA = 0;
  let scoreB = 0;
  const chosenItemIdentifiers = new Set();

  let xPointer = 0;
  let yPointer = 0;

  for (let k = 0; k < itemCount; k++) {
    if (turnIndicator === 0) { // Player A's turn
      while (chosenItemIdentifiers.has(sortedByX[xPointer].id)) {
        xPointer++;
      }
      const currentSelection = sortedByX[xPointer];
      scoreA += currentSelection.x;
      chosenItemIdentifiers.add(currentSelection.id);
      xPointer++;
      turnIndicator = 1;
    } else { // Player B's turn
      while (chosenItemIdentifiers.has(sortedByY[yPointer].id)) {
        yPointer++;
      }
      const currentSelection = sortedByY[yPointer];
      scoreB += currentSelection.y;
      chosenItemIdentifiers.add(currentSelection.id);
      yPointer++;
      turnIndicator = 0;
    }
  }

  const finalDifference = scoreA - scoreB;
  console.log(finalDifference.toString());
}

// Comparison function for sorting by x (descending), then y (descending)
function compareXDescYDesc(itemA, itemB) {
  if (itemA.x < itemB.x) return 1;
  if (itemA.x > itemB.x) return -1;
  if (itemA.y < itemB.y) return 1;
  if (itemA.y > itemB.y) return -1;
  return 0;
}

// Comparison function for sorting by y (descending), then x (descending)
function compareYDescXDesc(itemA, itemB) {
  if (itemA.y < itemB.y) return 1;
  if (itemA.y > itemB.y) return -1;
  if (itemA.x < itemB.x) return 1;
  if (itemA.x > itemB.x) return -1;
  return 0;
}

// Entry point for the application (Node.js environment)
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));

// Function for browser-based debugging (original's "debug" function)
function runDebugFromBrowser() {
  const browserInput = document.getElementById("input").value;
  processInputData(browserInput);
}
