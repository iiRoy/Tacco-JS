const getSwappedFruit = (originalWord) => {
  const APPLE_STR = 'apple';
  const PEACH_STR = 'peach';
  return originalWord === APPLE_STR ? PEACH_STR : APPLE_STR;
};

function processInputLines() {
  const fruitPattern = /apple|peach/g;
  processedLines.forEach(function(currentLine) {
    const modifiedLine = currentLine.replace(fruitPattern, getSwappedFruit);
    console.log(modifiedLine);
  });
}

let rawInputBuffer = '';
let processedLines = [];

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(dataChunk) {
  rawInputBuffer += dataChunk;
});
process.stdin.on('end', function() {
  processedLines = rawInputBuffer.split('\n');
  processInputLines();
});
