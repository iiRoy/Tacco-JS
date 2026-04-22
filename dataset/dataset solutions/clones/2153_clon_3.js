// This module processes a collection of input strings to identify and display the most frequently occurring ones.
function ProcessInputData(rawData) {
  // Split the raw input string into individual lines based on the newline character.
  const allInputLines = rawData.split('\n');

  // The first line often represents a count or a parameter.
  // We parse it as an integer, though its direct use might vary depending on problem specifics.
  const initialParameter = parseInt(allInputLines.shift(), 10);

  // The remaining lines constitute the primary dataset for analysis.
  const datasetEntries = allInputLines;

  // A Map object is employed to store the frequency of each unique string encountered in the dataset.
  // Using Map provides better performance for string keys and maintains insertion order (though not strictly needed here).
  const stringFrequencyMap = new Map();

  // Iterate over each entry in the dataset to build the frequency map.
  for (const currentEntry of datasetEntries) {
    // Trim whitespace and skip any entirely empty lines to ensure accurate counting.
    const trimmedEntry = currentEntry.trim();
    if (trimmedEntry === '') {
      continue;
    }
    // Increment the count for the current entry. If it's a new entry, initialize its count to 1.
    stringFrequencyMap.set(trimmedEntry, (stringFrequencyMap.get(trimmedEntry) || 0) + 1);
  }

  // --- Type III Addition: Input validation/guard clauses ---
  // If the frequency map is empty after processing, it means there's no data to analyze.
  if (stringFrequencyMap.size === 0) {
    // In a real application, a message might be logged or an error thrown.
    // For competitive programming, simply returning might be sufficient.
    return;
  }

  // An additional check: if the initial parameter (N) doesn't match the number of
  // non-empty lines processed, it could indicate malformed input.
  // This is a soft check, as problem interpretations of N can vary.
  const actualProcessedNonEmptyLines = datasetEntries.filter(line => line.trim() !== '').length;
  if (!isNaN(initialParameter) && initialParameter !== actualProcessedNonEmptyLines) {
      // console.warn(`Input mismatch: Expected ${initialParameter} data lines, found ${actualProcessedNonEmptyLines}.`);
      // We proceed with the found data, but this serves as an alert.
  }

  // Determine the maximum frequency observed among all unique strings.
  let maximumOccurrenceCount = 0;
  for (const count of stringFrequencyMap.values()) {
    if (count > maximumOccurrenceCount) {
      maximumOccurrenceCount = count;
    }
  }

  // Collect all strings that have reached this maximum occurrence count.
  const itemsWithHighestFrequency = [];
  for (const [keyString, count] of stringFrequencyMap.entries()) {
    if (count === maximumOccurrenceCount) {
      itemsWithHighestFrequency.push(keyString);
    }
  }

  // Sort these top-ranked items lexicographically (alphabetically in ascending order).
  // This ensures a consistent and predictable output order when multiple items share the highest frequency.
  itemsWithHighestFrequency.sort();

  // Iterate through the sorted list of most frequent items and print each one to standard output.
  for (const finalOutputItem of itemsWithHighestFrequency) {
    console.log(finalOutputItem);
  }
}

// This section is responsible for reading input from the standard input stream
// and invoking the main processing function. It should not be modified.
ProcessInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));