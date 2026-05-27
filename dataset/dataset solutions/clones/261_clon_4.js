function generateOrderedSelections(sourceSet, selectionLength, currentPath, visitedFlags, resultConsumer) {
  if (currentPath.length === selectionLength) {
    resultConsumer([...currentPath]);
    return;
  }

  for (let elementIndex = 0; elementIndex < sourceSet.length; elementIndex++) {
    if (!visitedFlags[elementIndex]) {
      visitedFlags[elementIndex] = true;
      currentPath.push(sourceSet[elementIndex]);

      generateOrderedSelections(sourceSet, selectionLength, currentPath, visitedFlags, resultConsumer);

      currentPath.pop();
      visitedFlags[elementIndex] = false;
    }
  }
}

function executeProcessing() {
  const digitPool = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

  for (const entryString of rawInputLines) {
    if (entryString.trim() === '') continue;

    const parsedValues = entryString.split(' ').map(parseFloat);
    const selectionSize = parsedValues[0];
    const targetSum = parsedValues[1];
    let matchCounter = 0;

    const initialPath = [];
    const initialVisitedFlags = new Array(digitPool.length).fill(false);

    generateOrderedSelections(
      digitPool,
      selectionSize,
      initialPath,
      initialVisitedFlags,
      function(currentSelection) {
        let runningTotal = 0;
        for (let k = 0; k < currentSelection.length; k++) {
          runningTotal += currentSelection[k] * (k + 1);
        }
        if (runningTotal === targetSum) {
          matchCounter++;
        }
      }
    );
    console.log(matchCounter);
  }
}

let accumulatedInput = '';
let rawInputLines;

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(dataChunk) {
  accumulatedInput += dataChunk;
});
process.stdin.on('end', function() {
  rawInputLines = accumulatedInput.split('\n');
  executeProcessing();
});
