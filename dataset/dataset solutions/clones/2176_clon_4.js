function analyzeEntries(sourceText) {
  const segments = sourceText.split('\n');
  const comparisonLimit = Number(segments[0]);
  const rawValues = segments[1].split(' ');

  // Create a normalized list of numerical values or undefined placeholders.
  // This list will have a length equal to 'comparisonLimit',
  // effectively replicating the range of indices the original code would access,
  // including potential 'undefined' elements if the input line is shorter,
  // or truncating if the input line is longer.
  const processedNumericalList = Array.from({ length: comparisonLimit }, (_, index) => {
    if (index < rawValues.length) {
      return Number(rawValues[index]);
    }
    return undefined; // Pad with 'undefined' if the source input is shorter
  });

  let duplicateDetected = false;
  const encounteredItems = new Set();

  // Use a functional iteration method (Array.prototype.some)
  // to check for duplicates, allowing for early exit similar to the original's 'return'.
  // This method correctly handles 'undefined' values as distinct items,
  // and 'undefined === undefined' will be caught as a duplicate by the Set.
  processedNumericalList.some(item => {
    if (encounteredItems.has(item)) {
      duplicateDetected = true;
      return true; // Stops the 'some' iteration
    }
    encounteredItems.add(item);
    return false; // Continues the 'some' iteration
  });

  // Use an anonymous function for output to diverge from direct console.log
  (function(resultPhrase) {
    console.log(resultPhrase);
  })(duplicateDetected ? "NO" : "YES");
}