function analyzeBloodSamples() {
  const initialTally = new Map([
    ['A', 0],
    ['B', 0],
    ['AB', 0],
    ['O', 0],
  ]);

  const processedTally = collectedInputLines
    .filter(entryLine => entryLine.trim().length > 0)
    .reduce((currentTally, entryLine) => {
      const components = entryLine.split(',');
      const bloodGroup = components[1];
      if (currentTally.has(bloodGroup)) {
        currentTally.set(bloodGroup, currentTally.get(bloodGroup) + 1);
      }
      return currentTally;
    }, initialTally);

  console.log(processedTally.get('A'));
  console.log(processedTally.get('B'));
  console.log(processedTally.get('AB'));
  console.log(processedTally.get('O'));
}

let collectedInputBuffer = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(dataSegment) {
  collectedInputBuffer += dataSegment;
});
process.stdin.on('end', function() {
  const collectedInputLines = collectedInputBuffer.split('\n');
  analyzeBloodSamples();
});
