function processInputData(inputLines) {
  const WHITESPACE_DELIMITER = /\s+/;
  let searchTarget = inputLines[0];
  let occurrenceCounter = 0;

  const countOccurrencesInLine = (lineContent, targetWord) => {
    const wordsOnLine = lineContent.split(WHITESPACE_DELIMITER);
    let lineSpecificCount = 0;

    for (const word of wordsOnLine) {
      if (word === targetWord) {
        lineSpecificCount++;
      }
    }
    return lineSpecificCount;
  };

  const contentLines = inputLines.slice(1);
  contentLines.forEach(line => {
    occurrenceCounter += countOccurrencesInLine(line, searchTarget);
  });

  console.log(occurrenceCounter);
}

let receivedDataChunks = [];

process.stdin.on('data', (dataChunk) => {
  receivedDataChunks.push(dataChunk);
});

process.stdin.on('end', () => {
  const fullInputContent = Buffer.concat(receivedDataChunks).toString('utf8');
  const allInputLines = fullInputContent.split('\n');
  processInputData(allInputLines);
});
