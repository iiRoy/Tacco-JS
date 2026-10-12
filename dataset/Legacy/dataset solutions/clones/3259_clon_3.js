process.stdin.resume();
process.stdin.setEncoding('utf8');

let rawDataAccumulator = '';

process.stdin.on('data', function(dataChunk) {
    rawDataAccumulator += dataChunk;
});

process.stdin.on('end', function() {
  const processedLines = rawDataAccumulator.split("\n");
  const arraySize = parseInt(processedLines[0], 10);
  const stringifiedNumbers = processedLines[1].split(" ");

  const valueSequence = stringifiedNumbers.map(valStr => parseInt(valStr, 10));

  let totalOperationsPerformed = 0;
  let anyModificationOccurred = true;

  while (anyModificationOccurred) {
    anyModificationOccurred = false;

    for (let currentElementIdx = 0; currentElementIdx < arraySize; currentElementIdx++) {
      const currentElementValue = valueSequence[currentElementIdx];

      if (currentElementValue > 0) {
        for (let subsequentElementIdx = currentElementIdx + 1; subsequentElementIdx < arraySize; subsequentElementIdx++) {
          if (currentElementValue <= valueSequence[subsequentElementIdx]) {
            valueSequence[subsequentElementIdx]--;
          }
        }
        valueSequence[currentElementIdx]--;
        totalOperationsPerformed++;
        anyModificationOccurred = true;
      }
    }
  }
  console.log(totalOperationsPerformed);
});
