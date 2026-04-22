function createHighValueContainer() {
  const collectionItems = [];

  function addEntry(incomingValue) {
    let insertionPoint = 0;
    while (insertionPoint < collectionItems.length && incomingValue < collectionItems[insertionPoint]) {
      insertionPoint++;
    }
    collectionItems.splice(insertionPoint, 0, incomingValue);
  }

  function removeTop() {
    if (collectionItems.length === 0) {
      return undefined;
    }
    return collectionItems.shift();
  }

  return {
    addEntry: addEntry,
    removeTop: removeTop
  };
}

(function initiateProcessing() {
  const fileSystemAccessor = require('fs');
  const rawInput = fileSystemAccessor.readFileSync('/dev/stdin', 'utf8');
  const processedInput = rawInput.trim();
  const instructionLines = processedInput.split('\n');
  const actualInstructions = instructionLines.slice(0, -1);

  const priorityManager = createHighValueContainer();
  let resultBuffer = '';

  actualInstructions.forEach(function(currentDirective) {
    const firstChar = currentDirective[0];
    if (firstChar === 'i') {
      const parts = currentDirective.split(' ');
      const numericValue = Number(parts[1]);
      priorityManager.addEntry(numericValue);
    } else if (firstChar === 'e') {
      const extractedValue = priorityManager.removeTop();
      if (extractedValue !== undefined) {
        resultBuffer += `${extractedValue}\n`;
      }
    }
  });
  process.stdout.write(resultBuffer);
})();