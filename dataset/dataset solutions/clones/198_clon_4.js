let capturedContent = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', (incomingData) => {
  capturedContent += incomingData;
});

process.stdin.on('end', () => {
  processData(capturedContent);
});

function processData(fullPayload) {
  const rawSegments = fullPayload.split('\n');

  const recordTally = new Map([
    ['A', 0],
    ['B', 0],
    ['AB', 0],
    ['O', 0]
  ]);

  rawSegments.reduce((currentTally, segmentLine) => {
    const cleanedLine = segmentLine.trim();
    if (cleanedLine === '') {
      return currentTally;
    }

    const divisions = cleanedLine.split(',');
    if (divisions.length > 1) {
      const categoryLabel = divisions[1];
      if (currentTally.has(categoryLabel)) {
        currentTally.set(categoryLabel, currentTally.get(categoryLabel) + 1);
      }
    }
    return currentTally;
  }, recordTally);

  console.log(recordTally.get('A'));
  console.log(recordTally.get('B'));
  console.log(recordTally.get('AB'));
  console.log(recordTally.get('O'));
}