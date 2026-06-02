var utilityModule = require('util');

const wordReplacementMap = new Map([
  ['apple', 'peach'],
  ['peach', 'apple']
]);

function retrieveSwappedWord(matchedTerm) {
  return wordReplacementMap.get(matchedTerm);
}

const searchPattern = /apple|peach/g;

function processInputLines() {
  const linesArray = rawDataBuffer.split('\n');

  linesArray.forEach(function(currentLine) {
    const transformedLine = currentLine.replace(searchPattern, retrieveSwappedWord);
    utilityModule.print(transformedLine);
  });
}

var rawDataBuffer = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function(incomingDataChunk) {
  rawDataBuffer += incomingDataChunk;
});

function finalizeInputProcessing() {
  processInputLines();
}

process.stdin.on('end', finalizeInputProcessing);
