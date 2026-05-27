let parsedInputLines = [];
let rawInputBuffer = '';

function calculateMaxSubarraySum() {
  let lineCursor = 0;
  let sequenceLength;

  while (true) {
    sequenceLength = parseInt(parsedInputLines[lineCursor++], 10);

    if (isNaN(sequenceLength) || sequenceLength === 0) {
      break;
    }

    let numericSequence = [];
    for (let elementCounter = 0; elementCounter < sequenceLength; elementCounter++) {
      numericSequence.push(parseInt(parsedInputLines[lineCursor++], 10));
    }

    let peakSum;
    let currentMaxEndingHere;

    peakSum = numericSequence[0];
    currentMaxEndingHere = numericSequence[0];

    for (let sequenceElementIdx = 1; sequenceElementIdx < sequenceLength; sequenceElementIdx++) {
      let currentElement = numericSequence[sequenceElementIdx];
      currentMaxEndingHere = Math.max(currentElement, currentMaxEndingHere + currentElement);
      peakSum = Math.max(peakSum, currentMaxEndingHere);
    }

    console.log(peakSum);
  }
}

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(chunk) {
  rawInputBuffer += chunk;
});
process.stdin.on('end', function() {
  parsedInputLines = rawInputBuffer.split('\n');
  calculateMaxSubarraySum();
});
