function processNumericalData(rawLines) {
  // The first line of input is parsed but not utilized in the original logic.
  // We achieve the same by processing only the subsequent lines.
  const relevantEntries = rawLines.slice(1);

  // Determine if any of the numerical entries are odd.
  // This replaces the imperative loop with a declarative functional approach.
  const containsOddValue = relevantEntries.some(entryText => {
    const numericRepresentation = parseInt(entryText, 10);
    return numericRepresentation % 2 !== 0;
  });

  console.log(containsOddValue ? 'first' : 'second');
}

let accumulatedInput = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(dataSegment) {
  accumulatedInput += dataSegment;
});
process.stdin.on('end', function() {
  const processedLines = accumulatedInput.split('\n');
  processNumericalData(processedLines);
});
