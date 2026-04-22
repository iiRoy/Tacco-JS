function ProcessData(rawData) {
  rawData = rawData.split('\n');

  var countA = parseInt(rawData[0].split(' ')[0], 10);
  var countB = parseInt(rawData[0].split(' ')[1], 10);

  rawData.shift();

  var totalValue = 0;

  for (var iterIdx = 0; iterIdx < countB; iterIdx++) {
    // Array to temporarily hold lines after filtering based on criteria
    var filteredEntries = [];
    var currentMaxVal = 0;
    var currentMaxIdx = 0;

    rawData.forEach(function(entryLine, entryIndex) {
      // Construct a new array, excluding elements where lead time exceeds remaining duration
      if (parseInt(entryLine.split(' ')[0], 10) <= countB - iterIdx) {
        filteredEntries.push(entryLine);
      }
    });

    filteredEntries.forEach(function(processedEntry, processedIdx) {
      if (parseInt(processedEntry.split(' ')[1], 10) > currentMaxVal) {
        currentMaxVal = parseInt(processedEntry.split(' ')[1], 10);
        currentMaxIdx = processedIdx;
      }
    });

    filteredEntries.splice(currentMaxIdx, 1);
    rawData = filteredEntries;
    totalValue = totalValue + currentMaxVal;
  }

  console.log(totalValue);
}
ProcessData(require('fs').readFileSync('/dev/stdin', 'utf8'));