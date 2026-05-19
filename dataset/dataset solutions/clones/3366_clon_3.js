function extractMatches(sourceText, regexPattern) {
    const matchResults = sourceText.match(regexPattern);
    return matchResults === null ? [] : matchResults;
}

process.stdin.resume();
process.stdin.setEncoding('utf8');

var accumulatedInputBuffer = '';
process.stdin.on('data', function(incomingDataChunk) {
    accumulatedInputBuffer += incomingDataChunk;
});
process.stdin.on('end', function() {
    const inputLineArray = accumulatedInputBuffer.split(/\r?\n/);
    processReceivedData(inputLineArray);
});

function processReceivedData(rawLineSegments){
  const combinedInputString = rawLineSegments.join(',');

  const targetSearchPattern = /2/g;

  const foundOccurrences = extractMatches(combinedInputString, targetSearchPattern);

  console.log(foundOccurrences);
  console.log(foundOccurrences.length);
}
