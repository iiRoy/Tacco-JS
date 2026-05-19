var processInputData = function processInputData(rawData) {
  var inputLinesArray = rawData.split('\n');

  var parseNumericValue = function parseNumericValue(str) {
    return Number(str);
  };

  var extractEntryCount = function extractEntryCount(firstLine) {
    var parts = firstLine.split(' ');
    return parseNumericValue(parts[0]);
  };

  var numberOfEntries = extractEntryCount(inputLinesArray[0]);

  var buildFrequencyCounter = function buildFrequencyCounter(lines, countLimit) {
    var stringCounts = new Map();
    for (var i = 0; i < countLimit; i++) {
      var currentEntry = lines[i + 1];
      if (currentEntry === undefined || currentEntry.trim() === '') {
        continue; // Skip empty lines if any, though problem constraints usually prevent this.
      }
      stringCounts.set(currentEntry, (stringCounts.get(currentEntry) || 0) + 1);
    }
    return stringCounts;
  };

  var entryFrequencies = buildFrequencyCounter(inputLinesArray, numberOfEntries);

  if (entryFrequencies.size === 0) {
    return; // No entries to process
  }

  var sortFrequenciesDescending = function sortFrequenciesDescending(frequencyMap) {
    var frequencyList = Array.from(frequencyMap.entries());
    frequencyList.sort(function (a, b) {
      // Sort by count descending, then by string ascending for tie-breaking (lexicographical)
      if (b[1] !== a[1]) {
        return b[1] - a[1];
      }
      return a[0].localeCompare(b[0]);
    });
    return frequencyList;
  };

  var sortedFrequencyPairs = sortFrequenciesDescending(entryFrequencies);

  var highestFrequencyValue = sortedFrequencyPairs[0][1];

  for (var i = 0; i < sortedFrequencyPairs.length; i++) {
    var pair = sortedFrequencyPairs[i];
    var currentString = pair[0];
    var currentCount = pair[1];

    if (currentCount === highestFrequencyValue) {
      console.log(currentString);
    } else {
      // Since the array is sorted by frequency descending,
      // once we encounter a lower frequency, all subsequent
      // items will also have lower or equal frequency.
      // We only care about items with the *highest* frequency.
      break;
    }
  }
};

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
