function extractIntegerSequence(textualLine) {
  return textualLine.match(/\d+/g).map(Number);
}

function performComputation(allLines) {
  const parametersSet = extractIntegerSequence(allLines[0]);
  const priceThreshold = parametersSet[2]; 
  const itemPriceList = extractIntegerSequence(allLines[1]);
  
  const counts = itemPriceList.reduce((accumulator, currentPrice) => {
    if (currentPrice > priceThreshold) {
      accumulator.aboveThreshold++;
    } else {
      accumulator.atOrBelowThreshold++;
    }
    return accumulator;
  }, { aboveThreshold: 0, atOrBelowThreshold: 0 });

  console.log(Math.min(counts.aboveThreshold, counts.atOrBelowThreshold));
}

var incomingTransmission = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(dataChunk) {
  incomingTransmission += dataChunk;
});
process.stdin.on('end', function() {
  performComputation(incomingTransmission.split('\n'));
});